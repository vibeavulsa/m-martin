/**
 * Cloud Functions para M'Martin Estofados.
 *
 * - createOrder: Valida preços no servidor, decrementa estoque e cria o pedido.
 * - processPayment: Processa pagamentos via Mercado Pago e outros gateways.
 * - Rate limiting embutido via timestamps em memória.
 */

import {setGlobalOptions} from "firebase-functions";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {initializeApp} from "firebase-admin/app";
import {defineSecret} from "firebase-functions/params";

initializeApp();

// Segredo do Mercado Pago (configurado via Firebase Functions secrets)
const mercadoPagoAccessToken = defineSecret("MERCADO_PAGO_ACCESS_TOKEN");

setGlobalOptions({maxInstances: 10});

const db = getFirestore();

// ============================================
// RATE LIMITING (em memória por instância)
// ============================================

/**
 * Mapa de IP → timestamps de requisições recentes.
 *
 * NOTA: Rate limiting em memória é por instância de Cloud Function.
 * Em ambientes com múltiplas instâncias, o limite efetivo é multiplicado
 * pelo número de instâncias ativas. Para rate limiting distribuído mais
 * rigoroso, considere usar Firestore ou Redis como store compartilhado.
 * A abordagem em memória já oferece proteção significativa contra abuso
 * e não adiciona latência extra por requisição.
 */
const rateLimitMap = new Map<string, number[]>();

/** Máximo de requisições por janela de tempo */
const RATE_LIMIT_MAX = 5;
/** Janela de tempo em milissegundos (1 minuto) */
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

/**
 * Verifica se o IP excedeu o limite de requisições.
 * Limpa entradas antigas automaticamente.
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];

  // Filtrar timestamps dentro da janela
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, recent);
    return false; // Limite excedido
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);
  return true; // Permitido
}

// ============================================
// INTERFACES
// ============================================

interface OrderItemInput {
  productId: string;
  name: string;
  quantity: number;
  imageUrl?: string;
}

interface CustomerInput {
  name: string;
  email?: string;
  phone: string;
  address: string;
  city?: string;
  notes?: string;
}

interface CreateOrderData {
  items: OrderItemInput[];
  customer: CustomerInput;
}

// ============================================
// CLOUD FUNCTION: createOrder
// ============================================

/**
 * Cloud Function callable que:
 * 1. Aplica rate limiting por IP
 * 2. Valida os dados de entrada
 * 3. Lê os preços reais dos produtos no Firestore (impede manipulação)
 * 4. Recalcula o totalPrice no servidor
 * 5. Verifica e decrementa o estoque atomicamente
 * 6. Cria o documento do pedido
 */
export const createOrder = onCall(
  {maxInstances: 10},
  async (request) => {
    const ip = request.rawRequest?.ip ||
      request.rawRequest?.headers?.["x-forwarded-for"]?.toString() ||
      `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // 1. Rate limiting
    if (!checkRateLimit(ip)) {
      throw new HttpsError(
        "resource-exhausted",
        "Muitas requisições. Aguarde um momento antes de tentar novamente."
      );
    }

    const data = request.data as CreateOrderData;

    // 2. Validar dados de entrada
    if (!data || !data.items || !Array.isArray(data.items) ||
        data.items.length === 0) {
      throw new HttpsError(
        "invalid-argument",
        "O pedido deve conter ao menos um item."
      );
    }

    if (!data.customer || !data.customer.name?.trim() ||
        !data.customer.phone?.trim() || !data.customer.address?.trim()) {
      throw new HttpsError(
        "invalid-argument",
        "Dados do cliente incompletos (nome, telefone e endereço são obrigatórios)."
      );
    }

    // Validar cada item
    for (const item of data.items) {
      if (!item.productId || typeof item.productId !== "string") {
        throw new HttpsError(
          "invalid-argument",
          "Cada item deve ter um productId válido."
        );
      }
      if (!item.quantity || typeof item.quantity !== "number" ||
          item.quantity < 1 || !Number.isInteger(item.quantity)) {
        throw new HttpsError(
          "invalid-argument",
          `Quantidade inválida para o item ${item.name || item.productId}.`
        );
      }
    }

    try {
      // 3–6. Transação atômica: ler preços, validar estoque, decrementar, criar pedido
      // NOTA: Firestore transactions são serializáveis — se outro processo modificar
      // os mesmos documentos durante a transação, ela será automaticamente re-executada,
      // garantindo que a validação de estoque e o decremento ocorram atomicamente.
      const orderId = await db.runTransaction(async (transaction) => {
        // 3. Ler todos os produtos do Firestore para obter preços reais
        const productRefs = data.items.map((item) =>
          db.collection("products").doc(item.productId)
        );
        const productSnapshots = await Promise.all(
          productRefs.map((ref) => transaction.get(ref))
        );

        // 4. Validar existência, estoque e calcular preços reais
        let serverTotalPrice = 0;
        const orderItems: Array<{
          productId: string;
          name: string;
          price: number;
          quantity: number;
          imageUrl: string;
          subtotal: number;
        }> = [];

        for (let i = 0; i < productSnapshots.length; i++) {
          const snap = productSnapshots[i];
          const inputItem = data.items[i];

          if (!snap.exists) {
            throw new HttpsError(
              "not-found",
              `Produto não encontrado: ${inputItem.name || inputItem.productId}`
            );
          }

          const productData = snap.data()!;
          const serverPrice = productData.price;
          const currentQuantity = productData.quantity || 0;

          // Validar que o preço existe e é um número válido
          if (typeof serverPrice !== "number" || serverPrice <= 0) {
            throw new HttpsError(
              "failed-precondition",
              `Preço inválido para o produto: ${inputItem.name || inputItem.productId}`
            );
          }

          // Verificar estoque
          if (currentQuantity < inputItem.quantity) {
            throw new HttpsError(
              "failed-precondition",
              `Estoque insuficiente: ${productData.name || inputItem.name}. ` +
              `Disponível: ${currentQuantity}, Solicitado: ${inputItem.quantity}`
            );
          }

          const subtotal = serverPrice * inputItem.quantity;
          serverTotalPrice += subtotal;

          orderItems.push({
            productId: inputItem.productId,
            name: productData.name || inputItem.name,
            price: serverPrice,
            quantity: inputItem.quantity,
            imageUrl: inputItem.imageUrl || productData.imageUrl || "",
            subtotal,
          });
        }

        // 5. Decrementar estoque
        for (let i = 0; i < productRefs.length; i++) {
          transaction.update(productRefs[i], {
            quantity: FieldValue.increment(-data.items[i].quantity),
          });
        }

        // 6. Criar o pedido com preços validados pelo servidor
        const orderRef = db.collection("orders").doc();
        transaction.set(orderRef, {
          customer: {
            name: data.customer.name,
            email: data.customer.email || "",
            phone: data.customer.phone,
            address: data.customer.address,
            city: data.customer.city || "",
            notes: data.customer.notes || "",
          },
          items: orderItems,
          totalItems: orderItems.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: serverTotalPrice,
          status: "pending",
          paymentMethod: "whatsapp_checkout",
          createdAt: FieldValue.serverTimestamp(),
        });

        return orderRef.id;
      });

      logger.info("Pedido criado com sucesso", {orderId, ip});
      return {orderId};
    } catch (error) {
      // Re-throw HttpsError diretamente
      if (error instanceof HttpsError) {
        throw error;
      }

      logger.error("Erro ao criar pedido", {error, ip});
      throw new HttpsError(
        "internal",
        "Não foi possível registrar o pedido. Tente novamente."
      );
    }
  }
);

// ============================================
// INTERFACES: processPayment
// ============================================

/** Constantes para coleção/documento de configurações de pagamento */
const PAYMENT_SETTINGS_COLLECTION = "paymentSettings";
const PAYMENT_SETTINGS_DOC = "mercadoPago";

interface ProcessPaymentInput {
  orderId: string;
  paymentMethod: "pix" | "credit_card" | "mercado_pago";
  amountCents: number;
  customer: {
    name: string;
    email?: string;
    phone: string;
  };
}

interface MercadoPagoPreferenceItem {
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
}

interface MercadoPagoPreferenceRequest {
  items: MercadoPagoPreferenceItem[];
  payer: {
    name: string;
    email: string;
  };
  external_reference: string;
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: string;
  notification_url?: string;
  payment_methods?: {
    excluded_payment_types?: Array<{ id: string }>;
  };
}

interface MercadoPagoPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

// ============================================
// CLOUD FUNCTION: processPayment
// ============================================

/**
 * Cloud Function callable que processa pagamentos via Mercado Pago.
 *
 * Para o método 'mercado_pago':
 * 1. Busca os dados do pedido no Firestore
 * 2. Cria uma preferência de pagamento no Mercado Pago
 * 3. Retorna a URL de redirecionamento para o checkout do Mercado Pago
 *
 * Para os métodos 'pix' e 'credit_card':
 * Utiliza a API do Mercado Pago para gerar pagamentos PIX ou com cartão.
 */
export const processPayment = onCall(
  {maxInstances: 10, secrets: [mercadoPagoAccessToken]},
  async (request) => {
    const ip = request.rawRequest?.ip ||
      request.rawRequest?.headers?.["x-forwarded-for"]?.toString() ||
      `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Rate limiting
    if (!checkRateLimit(ip)) {
      throw new HttpsError(
        "resource-exhausted",
        "Muitas requisições. Aguarde um momento antes de tentar novamente."
      );
    }

    const data = request.data as ProcessPaymentInput;

    // Validação
    if (!data.orderId || typeof data.orderId !== "string") {
      throw new HttpsError("invalid-argument", "orderId é obrigatório.");
    }
    if (!data.amountCents || typeof data.amountCents !== "number" ||
        data.amountCents <= 0) {
      throw new HttpsError(
        "invalid-argument",
        "amountCents deve ser um número positivo."
      );
    }
    if (!data.paymentMethod) {
      throw new HttpsError(
        "invalid-argument",
        "paymentMethod é obrigatório."
      );
    }

    const accessToken = mercadoPagoAccessToken.value();
    if (!accessToken) {
      logger.error("MERCADO_PAGO_ACCESS_TOKEN não configurado");
      throw new HttpsError(
        "failed-precondition",
        "Gateway de pagamento não configurado. Contate o administrador."
      );
    }

    try {
      // Buscar dados do pedido no Firestore
      const orderDoc = await db.collection("orders").doc(data.orderId).get();
      if (!orderDoc.exists) {
        throw new HttpsError("not-found", "Pedido não encontrado.");
      }

      const orderData = orderDoc.data()!;

      // Buscar configurações de pagamento (URLs de retorno, etc.)
      const settingsDoc = await db
        .collection(PAYMENT_SETTINGS_COLLECTION)
        .doc(PAYMENT_SETTINGS_DOC)
        .get();
      const settings = settingsDoc.exists ? settingsDoc.data() : {};

      const siteUrl = settings?.siteUrl || "https://mmartinestofados.com.br";

      if (data.paymentMethod === "mercado_pago" ||
          data.paymentMethod === "credit_card") {
        // Criar preferência de pagamento no Mercado Pago
        const items: MercadoPagoPreferenceItem[] =
          (orderData.items || []).map(
            (item: {name: string; quantity: number; price: number}) => ({
              title: item.name,
              quantity: item.quantity,
              unit_price: item.price,
              currency_id: "BRL",
            })
          );

        const preferenceBody: MercadoPagoPreferenceRequest = {
          items,
          payer: {
            name: data.customer.name,
            email: data.customer.email ||
              `noemail+${data.orderId}@mmartin.com.br`,
          },
          external_reference: data.orderId,
          back_urls: {
            success: `${siteUrl}?payment=success&order=${data.orderId}`,
            failure: `${siteUrl}?payment=failure&order=${data.orderId}`,
            pending: `${siteUrl}?payment=pending&order=${data.orderId}`,
          },
          auto_return: "approved",
        };

        // Configurar URL de notificação (webhook) se disponível
        if (settings?.webhookUrl) {
          preferenceBody.notification_url = settings.webhookUrl;
        }

        // Restringir métodos de pagamento se configurado
        if (data.paymentMethod === "credit_card") {
          // Apenas cartão de crédito quando selecionado especificamente
          preferenceBody.payment_methods = {
            excluded_payment_types: [
              {id: "ticket"},
              {id: "bank_transfer"},
            ],
          };
        }

        const response = await fetch(
          "https://api.mercadopago.com/checkout/preferences",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify(preferenceBody),
          }
        );

        if (!response.ok) {
          const errorBody = await response.text();
          logger.error("Erro ao criar preferência no Mercado Pago", {
            status: response.status,
            body: errorBody,
          });
          throw new HttpsError(
            "internal",
            "Falha ao criar pagamento no Mercado Pago."
          );
        }

        const preference =
          (await response.json()) as MercadoPagoPreferenceResponse;

        // Atualizar pedido com informações de pagamento
        await db.collection("orders").doc(data.orderId).update({
          paymentMethod: data.paymentMethod,
          paymentStatus: "pending",
          mercadoPagoPreferenceId: preference.id,
          updatedAt: FieldValue.serverTimestamp(),
        });

        // Determinar URL baseado no ambiente (sandbox vs produção)
        const isSandbox = settings?.sandbox !== false;
        const redirectUrl = isSandbox ?
          preference.sandbox_init_point :
          preference.init_point;

        logger.info("Preferência Mercado Pago criada", {
          orderId: data.orderId,
          preferenceId: preference.id,
          sandbox: isSandbox,
        });

        return {
          success: true,
          redirectUrl,
          transactionId: preference.id,
        };
      } else if (data.paymentMethod === "pix") {
        // Criar pagamento PIX via Mercado Pago
        const nameParts = data.customer.name.trim().split(/\s+/);
        const firstName = nameParts[0] || "";
        const lastName = nameParts.length > 1 ?
          nameParts.slice(1).join(" ") : firstName;

        const pixBody = {
          transaction_amount: data.amountCents / 100,
          description: `Pedido M'Martin #${data.orderId.slice(0, 8)}`,
          payment_method_id: "pix",
          payer: {
            email: data.customer.email ||
              `noemail+${data.orderId}@mmartin.com.br`,
            first_name: firstName,
            last_name: lastName,
          },
          external_reference: data.orderId,
        };

        const response = await fetch(
          "https://api.mercadopago.com/v1/payments",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`,
              "X-Idempotency-Key": data.orderId,
            },
            body: JSON.stringify(pixBody),
          }
        );

        if (!response.ok) {
          const errorBody = await response.text();
          logger.error("Erro ao criar pagamento PIX", {
            status: response.status,
            body: errorBody,
          });
          throw new HttpsError(
            "internal",
            "Falha ao gerar código PIX."
          );
        }

        const payment = await response.json();
        const pixCode =
          payment.point_of_interaction?.transaction_data?.qr_code || "";
        const pixQrCodeBase64 =
          payment.point_of_interaction?.transaction_data?.qr_code_base64 || "";

        // Atualizar pedido com informações de pagamento
        await db.collection("orders").doc(data.orderId).update({
          paymentMethod: "pix",
          paymentStatus: "pending",
          mercadoPagoPaymentId: payment.id?.toString(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        logger.info("Pagamento PIX criado via Mercado Pago", {
          orderId: data.orderId,
          paymentId: payment.id,
        });

        return {
          success: true,
          pixCode,
          pixQrCodeBase64,
          transactionId: payment.id?.toString(),
        };
      }

      throw new HttpsError(
        "invalid-argument",
        `Método de pagamento não suportado: ${data.paymentMethod}`
      );
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }

      logger.error("Erro ao processar pagamento", {error, ip});
      throw new HttpsError(
        "internal",
        "Não foi possível processar o pagamento. Tente novamente."
      );
    }
  }
);

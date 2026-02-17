/**
 * Cloud Functions para M'Martin Estofados.
 *
 * - createOrder: Valida preços no servidor, decrementa estoque e cria o pedido.
 * - Rate limiting embutido via timestamps em memória.
 */

import {setGlobalOptions} from "firebase-functions";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {initializeApp} from "firebase-admin/app";

initializeApp();

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

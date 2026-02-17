/**
 * Camada de serviço para persistência de pedidos via Cloud Functions.
 * A Cloud Function valida preços no servidor, decrementa estoque e cria o pedido.
 */
import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../config/firebase';
import type { Order } from '../types/order';

const functions = getFunctions(app);

/** Dados enviados para a Cloud Function (sem preços — o servidor calcula) */
interface CreateOrderInput {
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    imageUrl?: string;
  }>;
  customer: {
    name: string;
    email?: string;
    phone: string;
    address: string;
    city?: string;
    notes?: string;
  };
}

/**
 * Cria um pedido via Cloud Function.
 * Os preços são validados e calculados no servidor para evitar manipulação.
 * O estoque é decrementado atomicamente pela Cloud Function.
 * 
 * @param orderData - Dados do pedido (preços do cliente são ignorados pelo servidor).
 * @returns O ID do documento gerado pelo Firestore.
 * @throws Error se algum produto estiver fora de estoque ou se houver falha.
 */
export async function createOrder(
  orderData: Omit<Order, 'createdAt'>
): Promise<string> {
  try {
    const createOrderFn = httpsCallable<CreateOrderInput, { orderId: string }>(
      functions,
      'createOrder'
    );

    // Enviar apenas os dados necessários (preços são calculados no servidor)
    const input: CreateOrderInput = {
      items: orderData.items.map(item => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      })),
      customer: {
        name: orderData.customer.name,
        email: orderData.customer.email,
        phone: orderData.customer.phone,
        address: orderData.customer.address,
        city: orderData.customer.city,
        notes: orderData.customer.notes,
      },
    };

    const result = await createOrderFn(input);
    return result.data.orderId;
  } catch (error: unknown) {
    console.error('[orderService] Falha ao salvar pedido:', error);
    
    // Extrair mensagem de erro da Cloud Function
    const firebaseError = error as { code?: string; message?: string };
    const message = firebaseError.message || '';
    
    // Propagar erros específicos de estoque
    if (message.includes('Estoque insuficiente')) {
      throw new Error(message);
    }

    // Propagar erros de rate limiting
    if (firebaseError.code === 'functions/resource-exhausted') {
      throw new Error(message || 'Muitas requisições. Aguarde um momento.');
    }
    
    throw new Error(
      'Não foi possível registrar o pedido. Tente novamente.'
    );
  }
}

/**
 * Camada de serviço para persistência de pedidos via API Backend.
 * A API Vercel no /api/orders valida preços, decrementa estoque via transação
 * e cria o pedido na base Postgres.
 */
import type { Order } from '../types/order';

interface CreateOrderInput {
  id: string;
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
  paymentMethod: string;
}

/**
 * Cria um pedido chamando a API Backend construída em Next.js / Vercel.
 * Os preços são validados e calculados no servidor para evitar manipulação.
 * O estoque é decrementado atomicamente pela API.
 * 
 * @param orderData - Dados do pedido (preços do cliente são ignorados pelo servidor).
 * @returns O ID único do pedido gerado.
 * @throws Error se algum produto estiver fora de estoque ou se houver falha na API.
 */
export async function createOrder(
  orderData: Omit<Order, 'createdAt'>
): Promise<string> {
  try {
    const orderId = `ord_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

    const input: CreateOrderInput = {
      id: orderId,
      items: orderData.items.map(item => ({
        productId: item.productId || (item as any).id,
        name: item.name,
        quantity: item.quantity,
        imageUrl: item.imageUrl || (item as any).image,
      })),
      customer: {
        name: orderData.customer.name,
        email: orderData.customer.email,
        phone: orderData.customer.phone,
        address: orderData.customer.address,
        city: orderData.customer.city,
        notes: orderData.customer.notes,
      },
      paymentMethod: orderData.paymentMethod || 'whatsapp_checkout',
    };

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create order on server.');
    }

    const result = await response.json();
    return result.id;
  } catch (error: unknown) {
    console.error('[orderService] Falha ao salvar pedido:', error);

    const message = error instanceof Error ? error.message : '';

    // Propagar erros específicos do Backend
    if (message.includes('Estoque insuficiente') || message.includes('Produto não encontrado')) {
      throw new Error(message);
    }

    throw new Error(
      'Não foi possível registrar o pedido. ' + (message ? message : 'Tente novamente.')
    );
  }
}

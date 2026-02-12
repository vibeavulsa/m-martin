/**
 * Utilitária para gerar o link de checkout via WhatsApp.
 */
import type { Order } from '../types/order';

const WHATSAPP_NUMBER =
  import.meta.env.VITE_WHATSAPP_NUMBER || '5500000000000';

/** Formata valor em BRL (ex.: R$ 1.234,56) */
function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Gera a URL completa para abertura do WhatsApp com mensagem pré‑preenchida.
 * @param order  - Dados do pedido já salvo.
 * @param orderId - ID retornado pelo Firestore.
 */
export function generateWhatsAppLink(order: Order, orderId: string): string {
  const itemLines = order.items.map(
    (item) =>
      `• ${item.name} x${item.quantity} (${formatBRL(item.price)}) = ${formatBRL(item.subtotal)}`
  );

  const parts: string[] = [
    `Olá! Acabei de fazer o Pedido #${orderId} no site M'Martin Estofados.`,
    '',
    '*Itens do Pedido:*',
    ...itemLines,
    '',
    `*Total: ${formatBRL(order.totalPrice)}*`,
    '',
    '*Dados de Entrega:*',
    `Nome: ${order.customer.name}`,
    `Telefone: ${order.customer.phone}`,
    `Endereço: ${order.customer.address}, ${order.customer.city}`,
  ];

  if (order.customer.notes) {
    parts.push(`Observações: ${order.customer.notes}`);
  }

  const message = encodeURIComponent(parts.join('\n'));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

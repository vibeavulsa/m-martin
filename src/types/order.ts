/**
 * Tipagem do módulo de pedidos (Checkout Híbrido).
 * Persistência no Firebase + Finalização via WhatsApp.
 */

/** Dados do cliente coletados no formulário de checkout */
export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;       // WhatsApp do cliente
  address: string;
  city: string;
  notes?: string;
}

/** Snapshot de um item no momento do pedido */
export interface OrderItem {
  productId: string;
  name: string;
  price: number;       // Preço unitário em BRL (snapshot)
  quantity: number;
  imageUrl?: string;
  subtotal: number;    // price * quantity
}

/** Status do ciclo de vida do pedido */
export type OrderStatus = 'pending' | 'confirmed' | 'shipped';

/** Método de pagamento utilizado */
export type PaymentMethod = 'whatsapp_checkout' | 'pix' | 'credit_card' | 'mercado_pago';

/** Documento persistido na coleção `orders` do Firestore */
export interface Order {
  customer: OrderCustomer;
  items: OrderItem[];
  totalItems: number;
  totalPrice: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: Date;
}

/** Resultado de uma tentativa de pagamento via gateway */
export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  /** URL para redirecionamento (ex.: página de pagamento do gateway) */
  redirectUrl?: string;
  /** Dados PIX (código copia-e-cola) */
  pixCode?: string;
}

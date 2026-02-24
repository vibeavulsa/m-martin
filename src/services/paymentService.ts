/**
 * Serviço de pagamento — abstrai a comunicação com o gateway.
 *
 * Agora consumindo a rota /api/payment nativa em Node.js (Vercel).
 */
import type { PaymentMethod, PaymentResult } from '../types/order';

interface PaymentInput {
  orderId: string;
  paymentMethod: PaymentMethod;
  /** Valor total em centavos (ex.: R$ 35,00 → 3500) */
  amountCents: number;
  customer: {
    name: string;
    email?: string;
    phone: string;
  };
}

/**
 * Solicita a criação de um pagamento via API Vercel Serverless.
 * A API integra com o gateway configurado (ex.: Mercado Pago)
 * e retorna URL de redirect, código PIX, etc.
 *
 * @returns PaymentResult com dados de transação, redirect ou código PIX.
 */
export async function processPayment(input: PaymentInput): Promise<PaymentResult> {
  try {
    const response = await fetch('/api/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return {
          success: false,
          error: 'Muitas requisições. Aguarde um momento e tente novamente.',
        };
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Falha ao processar o pagamento na API.');
    }

    const data = await response.json();
    return data;
  } catch (error: unknown) {
    console.error('[paymentService] Falha ao processar pagamento:', error);

    const message = error instanceof Error ? error.message : '';

    return {
      success: false,
      error: message || 'Erro ao processar o pagamento. Tente novamente.',
    };
  }
}

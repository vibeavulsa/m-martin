/**
 * Serviço de pagamento — abstrai a comunicação com o gateway.
 *
 * O gateway real (Stripe, Mercado Pago, etc.) é invocado via Cloud Function
 * para manter as chaves secretas no servidor. Este módulo envia os dados
 * necessários e recebe o resultado (URL de redirect, código PIX, etc.).
 */
import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../config/firebase';
import type { PaymentMethod, PaymentResult } from '../types/order';

const functions = getFunctions(app);

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
 * Solicita a criação de um pagamento via Cloud Function.
 * A Cloud Function deve integrar com o gateway configurado (ex.: Stripe)
 * e retornar o resultado adequado ao método de pagamento escolhido.
 *
 * @returns PaymentResult com dados de transação, redirect ou código PIX.
 */
export async function processPayment(input: PaymentInput): Promise<PaymentResult> {
  try {
    const processPaymentFn = httpsCallable<PaymentInput, PaymentResult>(
      functions,
      'processPayment'
    );

    const result = await processPaymentFn(input);
    return result.data;
  } catch (error: unknown) {
    console.error('[paymentService] Falha ao processar pagamento:', error);

    const firebaseError = error as { code?: string; message?: string };

    if (firebaseError.code === 'functions/resource-exhausted') {
      return {
        success: false,
        error: 'Muitas requisições. Aguarde um momento e tente novamente.',
      };
    }

    return {
      success: false,
      error: firebaseError.message || 'Erro ao processar o pagamento. Tente novamente.',
    };
  }
}

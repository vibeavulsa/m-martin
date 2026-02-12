/**
 * Camada de serviço para persistência de pedidos no Firestore.
 */
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Order } from '../types/order';

/**
 * Salva um novo pedido na coleção `orders` do Firestore.
 * @param orderData - Dados completos do pedido (sem o campo createdAt, que é gerado pelo servidor).
 * @returns O ID do documento gerado pelo Firestore.
 */
export async function createOrder(
  orderData: Omit<Order, 'createdAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('[orderService] Falha ao salvar pedido:', error);
    throw new Error(
      'Não foi possível registrar o pedido. Tente novamente.'
    );
  }
}

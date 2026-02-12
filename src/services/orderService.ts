/**
 * Camada de serviço para persistência de pedidos no Firestore.
 * Implementa transações atômicas para garantir integridade de estoque.
 */
import { collection, addDoc, serverTimestamp, runTransaction, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Order } from '../types/order';

/**
 * Salva um novo pedido na coleção `orders` do Firestore usando transações atômicas.
 * Verifica e decrementa o estoque dos produtos antes de criar o pedido.
 * 
 * @param orderData - Dados completos do pedido (sem o campo createdAt, que é gerado pelo servidor).
 * @returns O ID do documento gerado pelo Firestore.
 * @throws Error se algum produto estiver fora de estoque ou se houver falha na transação.
 */
export async function createOrder(
  orderData: Omit<Order, 'createdAt'>
): Promise<string> {
  try {
    // Execute a transação atômica
    const orderId = await runTransaction(db, async (transaction) => {
      // 1. Ler as referências de todos os produtos no carrinho
      const productRefs = orderData.items.map(item => 
        doc(db, 'products', item.productId)
      );
      
      const productSnapshots = await Promise.all(
        productRefs.map(ref => transaction.get(ref))
      );

      // 2. Verificar se todos os produtos existem e têm estoque suficiente
      for (let i = 0; i < productSnapshots.length; i++) {
        const productSnap = productSnapshots[i];
        const item = orderData.items[i];
        
        if (!productSnap.exists()) {
          throw new Error(`Produto não encontrado: ${item.name}`);
        }

        const productData = productSnap.data();
        const currentQuantity = productData.quantity || 0;

        if (currentQuantity < item.quantity) {
          throw new Error(`Estoque insuficiente: ${item.name}. Disponível: ${currentQuantity}, Solicitado: ${item.quantity}`);
        }
      }

      // 3. Se passar todas as verificações, decrementar o estoque
      for (let i = 0; i < productRefs.length; i++) {
        const productSnap = productSnapshots[i];
        const item = orderData.items[i];
        const productData = productSnap.data();
        const newQuantity = (productData.quantity || 0) - item.quantity;

        transaction.update(productRefs[i], {
          quantity: newQuantity
        });
      }

      // 4. Criar o pedido com timestamp do servidor
      const orderRef = doc(collection(db, 'orders'));
      transaction.set(orderRef, {
        ...orderData,
        createdAt: serverTimestamp(),
      });

      return orderRef.id;
    });

    return orderId;
  } catch (error) {
    console.error('[orderService] Falha ao salvar pedido:', error);
    
    // Propagar erros específicos de estoque
    if (error instanceof Error && error.message.includes('Estoque insuficiente')) {
      throw error;
    }
    
    throw new Error(
      'Não foi possível registrar o pedido. Tente novamente.'
    );
  }
}

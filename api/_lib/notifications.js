export async function sendOrderConfirmation(order) {
    try {
        const { id, customer, total } = order;
        if (!customer?.email) return;

        // Simulated SendGrid/Resend API call
        console.log(`[Email] Enviar confirmação para ${customer.email} (Pedido #${id}, Total: R$ ${total})`);

        /* implementation example with Resend
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'M Martin <pedidos@mmartinestofados.com.br>',
            to: [customer.email],
            subject: `Confirmação de Pedido #${id} - M Martin`,
            html: `<h2>Olá ${customer.name},</h2><p>Recebemos seu pedido #${id} no valor de R$ ${total}.</p>`
          })
        });
        */
    } catch (error) {
        console.error('Error sending order confirmation:', error);
    }
}

export async function sendOrderStatusUpdate(order) {
    try {
        const { id, customer, status } = order;
        if (!customer?.email) return;

        // Simulated SendGrid/Resend API call
        console.log(`[Email] Enviar atualização para ${customer.email} (Pedido #${id}, Novo Status: ${status})`);
    } catch (error) {
        console.error('Error sending order status update:', error);
    }
}

export async function notifyAdminNewOrder(order) {
    try {
        const { id, total } = order;

        // Simulate WhatsApp / Webhook Notification to Admin
        console.log(`[WhatsApp/Webhook] Novo pedido recebido! Pedido #${id}, Valor: R$ ${total}`);

        // Webhook example:
        /*
        await fetch(process.env.STORE_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'new_order', orderId: id, total })
        });
        */
    } catch (error) {
        console.error('Error notifying admin:', error);
    }
}

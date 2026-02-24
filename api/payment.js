import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const data = req.body;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'anon';

    if (!data.orderId) return res.status(400).json({ error: 'orderId is required' });
    if (!data.amountCents || data.amountCents <= 0) return res.status(400).json({ error: 'Invalid amountCents' });
    if (!data.paymentMethod) return res.status(400).json({ error: 'paymentMethod is required' });

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
        console.error('MERCADO_PAGO_ACCESS_TOKEN not configured in environment.');
        return res.status(500).json({ error: 'Gateway de pagamento não configurado no servidor.' });
    }

    try {
        // 1. Fetch order data
        const orderRes = await sql`SELECT * FROM orders WHERE id = ${data.orderId}`;
        if (orderRes.rows.length === 0) {
            return res.status(404).json({ error: 'Pedido não encontrado.' });
        }
        const orderData = orderRes.rows[0];

        // 2. Fetch payment settings
        const settingsRes = await sql`SELECT value FROM settings WHERE key = 'paymentSettings'`;
        let settings = {};
        if (settingsRes.rows.length > 0 && settingsRes.rows[0].value) {
            // In PostgreSQL, JSONB can sometimes be returned as object directly depending on driver
            const rawVal = settingsRes.rows[0].value;
            settings = typeof rawVal === 'string' ? JSON.parse(rawVal) : rawVal;
        }

        // Usually nested under 'mercadoPago' inside paymentSettings
        const mpSettings = settings.mercadoPago || {};
        const siteUrl = mpSettings.siteUrl || 'https://mmartinestofados.com.br';

        if (data.paymentMethod === 'mercado_pago' || data.paymentMethod === 'credit_card') {
            const items = (orderData.items || []).map(item => ({
                title: item.name,
                quantity: item.quantity || 1,
                unit_price: item.price || (data.amountCents / 100),
                currency_id: 'BRL'
            }));

            const preferenceBody = {
                items,
                payer: {
                    name: data.customer?.name || 'Cliente',
                    email: data.customer?.email || `noemail+${data.orderId}@mmartin.com.br`,
                },
                external_reference: data.orderId,
                back_urls: {
                    success: `${siteUrl}?payment=success&order=${data.orderId}`,
                    failure: `${siteUrl}?payment=failure&order=${data.orderId}`,
                    pending: `${siteUrl}?payment=pending&order=${data.orderId}`,
                },
                auto_return: 'approved'
            };

            if (mpSettings.webhookUrl) {
                preferenceBody.notification_url = mpSettings.webhookUrl;
            }

            if (data.paymentMethod === 'credit_card') {
                preferenceBody.payment_methods = {
                    excluded_payment_types: [{ id: 'ticket' }, { id: 'bank_transfer' }]
                };
            }

            const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(preferenceBody),
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error('MercadoPago Create Pref. Error:', errText);
                throw new Error('Falha ao criar pagamento no Mercado Pago.');
            }

            const preference = await response.json();

            await sql`
        UPDATE orders SET 
          payment_method = ${data.paymentMethod}, 
          status = 'pending', 
          notes = CONCAT(COALESCE(notes, ''), ' [MP_PREF:', ${preference.id}, ']')
        WHERE id = ${data.orderId}
      `;

            const isSandbox = mpSettings.sandbox !== false;
            const redirectUrl = isSandbox ? preference.sandbox_init_point : preference.init_point;

            return res.status(200).json({
                success: true,
                redirectUrl,
                transactionId: preference.id
            });

        } else if (data.paymentMethod === 'pix') {
            const nameParts = (data.customer?.name || 'Cliente').trim().split(/\s+/);
            const firstName = nameParts[0] || '';
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName;

            const pixBody = {
                transaction_amount: data.amountCents / 100,
                description: `Pedido M'Martin #${data.orderId.slice(0, 8)}`,
                payment_method_id: 'pix',
                payer: {
                    email: data.customer?.email || `noemail+${data.orderId}@mmartin.com.br`,
                    first_name: firstName,
                    last_name: lastName,
                },
                external_reference: data.orderId,
            };

            const response = await fetch('https://api.mercadopago.com/v1/payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Idempotency-Key': data.orderId,
                },
                body: JSON.stringify(pixBody),
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error('MercadoPago PIX Error:', errText);
                throw new Error('Falha ao gerar código PIX no Mercado Pago.');
            }

            const payment = await response.json();
            const pixCode = payment.point_of_interaction?.transaction_data?.qr_code || '';
            const pixQrCodeBase64 = payment.point_of_interaction?.transaction_data?.qr_code_base64 || '';

            await sql`
        UPDATE orders SET 
          payment_method = 'pix', 
          status = 'pending', 
          notes = CONCAT(COALESCE(notes, ''), ' [MP_PAY_ID:', ${payment.id?.toString()}, ']')
        WHERE id = ${data.orderId}
      `;

            return res.status(200).json({
                success: true,
                pixCode,
                pixQrCodeBase64,
                transactionId: payment.id?.toString()
            });

        }

        return res.status(400).json({ error: `Método não suportado: ${data.paymentMethod}` });

    } catch (err) {
        console.error('[api/payment]', err);
        return res.status(500).json({ error: err.message || 'Erro interno.' });
    }
}

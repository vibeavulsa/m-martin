import { sql } from '@vercel/postgres';
import { requireAdmin, getAuthUser } from './_lib/auth.js';

/**
 * /api/orders
 * GET    → list all orders (admin) or filter by userId (client)
 * POST   → create a new order (public — customers create orders)
 * PUT    → update order status (admin only)
 * DELETE → delete an order     (admin only)
 */
export default async function handler(req, res) {
  try {
    // ── GET: List / query orders ────────────────────────────────────────────
    if (req.method === 'GET') {
      const { userId } = req.query;

      if (userId) {
        // Client requesting their own orders — verify they are the owner
        const user = await getAuthUser(req);
        if (!user || user.uid !== userId) {
          console.error(`[api/orders] fetchMyOrders 401: Requested userId='${userId}', but token decoded as:`, user);
          return res.status(401).json({ error: 'Autenticação necessária para ver pedidos.' });
        }

        const { rows } = await sql`
          SELECT
            id,
            customer,
            items,
            status,
            total,
            payment_method AS "paymentMethod",
            notes,
            user_id AS "userId",
            created_at AS "date",
            updated_at AS "updatedAt"
          FROM orders
          WHERE user_id = ${userId}
          ORDER BY created_at DESC
        `;
        return res.status(200).json(rows);
      }

      // No userId filter → admin listing all orders
      const { error } = await requireAdmin(req, res);
      if (error) return;

      const { rows } = await sql`
        SELECT
          id,
          customer,
          items,
          status,
          total,
          payment_method AS "paymentMethod",
          notes,
          user_id AS "userId",
          created_at AS "date",
          updated_at AS "updatedAt"
        FROM orders
        ORDER BY created_at DESC
      `;
      return res.status(200).json(rows);
    }

    // ── POST: Create a new order (public) ───────────────────────────────────
    if (req.method === 'POST') {
      const o = req.body;
      if (!o.id) return res.status(400).json({ error: 'Missing id' });

      // Optionally attach the authenticated user's ID
      const user = await getAuthUser(req);
      const userId = user?.uid || o.userId || null;

      const { db } = require('@vercel/postgres');
      const client = await db.connect();

      try {
        await client.sql`BEGIN`;

        let serverTotalPrice = 0;
        const validItems = [];

        // 1. Validate items and stock
        for (const item of o.items) {
          // Read product
          const prodRes = await client.sql`SELECT name, price FROM products WHERE id = ${item.productId}`;
          if (prodRes.rows.length === 0) {
            throw new Error(`Produto não encontrado: ${item.name || item.productId}`);
          }
          const prod = prodRes.rows[0];

          let serverPrice = parseFloat(prod.price);
          if (isNaN(serverPrice) || serverPrice <= 0) {
            throw new Error(`Preço inválido para o produto: ${item.name || item.productId}`);
          }

          // Read stock
          const stockRes = await client.sql`SELECT quantity FROM stock WHERE product_id = ${item.productId}`;
          const currentQuantity = stockRes.rows.length > 0 ? stockRes.rows[0].quantity : 0;

          if (currentQuantity < item.quantity) {
            throw new Error(`Estoque insuficiente: ${prod.name}. Disponível: ${currentQuantity}, Solicitado: ${item.quantity}`);
          }

          const subtotal = serverPrice * item.quantity;
          serverTotalPrice += subtotal;

          validItems.push({
            ...item,
            name: prod.name,
            price: serverPrice,
            subtotal
          });

          // 2. Decrement stock
          await client.sql`
            UPDATE stock 
            SET quantity = quantity - ${item.quantity}, updated_at = NOW() 
            WHERE product_id = ${item.productId}
          `;
        }

        // 3. Create the order with server-computed values and optional userId
        await client.sql`
          INSERT INTO orders (id, customer, items, status, total, payment_method, notes, user_id)
          VALUES (
            ${o.id},
            ${JSON.stringify(o.customer ?? {})},
            ${JSON.stringify(validItems)},
            ${o.status ?? 'pendente'},
            ${serverTotalPrice},
            ${o.paymentMethod ?? null},
            ${o.notes ?? null},
            ${userId}
          )
        `;

        await client.sql`COMMIT`;
        return res.status(201).json({ id: o.id, total: serverTotalPrice });
      } catch (err) {
        await client.sql`ROLLBACK`;
        return res.status(400).json({ error: err.message });
      } finally {
        client.release();
      }
    }

    // ── PUT / DELETE: Admin-only operations ──────────────────────────────────
    if (req.method === 'PUT' || req.method === 'DELETE') {
      const { error } = await requireAdmin(req, res);
      if (error) return;
    }

    if (req.method === 'PUT') {
      const { id, status } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await sql`
        UPDATE orders SET
          status     = COALESCE(${status ?? null}, status),
          updated_at = NOW()
        WHERE id = ${id}
      `;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await sql`DELETE FROM orders WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/orders]', err);
    return res.status(500).json({ error: err.message });
  }
}

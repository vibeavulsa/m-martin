import { sql } from '@vercel/postgres';

/**
 * /api/orders
 * GET    → list all orders (newest first)
 * POST   → create a new order     (body: order object)
 * PUT    → update order status    (body: { id, status })
 * DELETE → delete an order        (query: ?id=<order_id>)
 */
export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { rows } = await sql`
        SELECT
          id,
          customer,
          items,
          status,
          total,
          payment_method AS "paymentMethod",
          notes,
          created_at AS "date",
          updated_at AS "updatedAt"
        FROM orders
        ORDER BY created_at DESC
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const o = req.body;
      if (!o.id) return res.status(400).json({ error: 'Missing id' });
      await sql`
        INSERT INTO orders (id, customer, items, status, total, payment_method, notes)
        VALUES (
          ${o.id},
          ${JSON.stringify(o.customer ?? {})},
          ${JSON.stringify(o.items ?? [])},
          ${o.status ?? 'pendente'},
          ${o.total ?? null},
          ${o.paymentMethod ?? null},
          ${o.notes ?? null}
        )
      `;
      return res.status(201).json({ id: o.id });
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

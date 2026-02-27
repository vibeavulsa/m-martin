import { sql } from '@vercel/postgres';
import { requireAdmin } from './_lib/auth.js';

/**
 * /api/stock
 * GET    → all stock rows  (public — storefront needs availability)
 * POST   → upsert a row    (admin only)
 * PUT    → same as POST     (admin only)
 * DELETE → remove a row     (admin only)
 */
export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { id } = req.query;
      if (id) {
        const { rows } = await sql`
          SELECT product_id AS "productId", quantity, min_stock AS "minStock"
          FROM stock WHERE product_id = ${id}
        `;
        return res.status(200).json(rows[0] ?? null);
      }
      const { rows } = await sql`
        SELECT product_id AS "productId", quantity, min_stock AS "minStock"
        FROM stock ORDER BY product_id
      `;
      return res.status(200).json(rows);
    }

    // ── Admin-only operations ─────────────────────────────────────────────────
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
      const { error } = await requireAdmin(req, res);
      if (error) return;
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const { productId, quantity, minStock } = req.body;
      if (!productId) return res.status(400).json({ error: 'Missing productId' });
      await sql`
        INSERT INTO stock (product_id, quantity, min_stock, updated_at)
        VALUES (${productId}, ${quantity ?? 0}, ${minStock ?? 5}, NOW())
        ON CONFLICT (product_id) DO UPDATE SET
          quantity   = EXCLUDED.quantity,
          min_stock  = EXCLUDED.min_stock,
          updated_at = NOW()
      `;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await sql`DELETE FROM stock WHERE product_id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/stock]', err);
    return res.status(500).json({ error: err.message });
  }
}

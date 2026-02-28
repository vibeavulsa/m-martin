import { sql } from '@vercel/postgres';
import { requireAdmin } from './_lib/auth.js';

export default async function handler(req, res) {
    try {
        // ── GET: Query reviews ────────────────────────────────────────────
        if (req.method === 'GET') {
            const { productId, all } = req.query;

            if (all === 'true') {
                // Admin listing all reviews
                const { error } = await requireAdmin(req, res);
                if (error) return;

                const { rows } = await sql`
          SELECT * FROM reviews
          ORDER BY created_at DESC
        `;
                return res.status(200).json(rows);
            }

            if (!productId) {
                return res.status(400).json({ error: 'Missing productId parameter' });
            }

            // Public: list only approved reviews for a specific product
            const { rows } = await sql`
        SELECT id, product_id, user_name, rating, comment, created_at
        FROM reviews
        WHERE product_id = ${productId} AND is_approved = TRUE
        ORDER BY created_at DESC
      `;
            return res.status(200).json(rows);
        }

        // ── POST: Create a new review (public) ───────────────────────────────────
        if (req.method === 'POST') {
            const { id, productId, userName, rating, comment } = req.body;

            if (!id || !productId || !userName || !rating) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            if (rating < 1 || rating > 5) {
                return res.status(400).json({ error: 'Rating must be between 1 and 5' });
            }

            await sql`
        INSERT INTO reviews (id, product_id, user_name, rating, comment, is_approved)
        VALUES (
          ${id},
          ${productId},
          ${userName},
          ${rating},
          ${comment || null},
          FALSE
        )
      `;

            return res.status(201).json({ ok: true, id });
        }

        // ── PUT: Admin approve/reject review ──────────────────────────────────
        if (req.method === 'PUT') {
            const { error } = await requireAdmin(req, res);
            if (error) return;

            const { id, isApproved } = req.body;
            if (!id || typeof isApproved !== 'boolean') {
                return res.status(400).json({ error: 'Missing id or invalid isApproved' });
            }

            await sql`
        UPDATE reviews SET
          is_approved = ${isApproved}
        WHERE id = ${id}
      `;
            return res.status(200).json({ ok: true });
        }

        // ── DELETE: Admin delete review ──────────────────────────────────
        if (req.method === 'DELETE') {
            const { error } = await requireAdmin(req, res);
            if (error) return;

            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'Missing id' });

            await sql`DELETE FROM reviews WHERE id = ${id}`;
            return res.status(200).json({ ok: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('[api/reviews]', err);
        return res.status(500).json({ error: err.message });
    }
}

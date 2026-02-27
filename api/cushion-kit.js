import { sql } from '@vercel/postgres';
import { requireAdmin } from './_lib/auth.js';

/**
 * /api/cushion-kit
 * GET  → return the cushion-kit config row (public)
 * POST → upsert (create or replace) the cushion-kit config (admin only)
 */
export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { rows } = await sql`
        SELECT config, updated_at AS "updatedAt"
        FROM cushion_kit WHERE id = 1
      `;
      return res.status(200).json(rows[0]?.config ?? null);
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const { error } = await requireAdmin(req, res);
      if (error) return;

      const config = req.body;
      await sql`
        INSERT INTO cushion_kit (id, config, updated_at)
        VALUES (1, ${JSON.stringify(config)}, NOW())
        ON CONFLICT (id) DO UPDATE SET
          config     = EXCLUDED.config,
          updated_at = NOW()
      `;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/cushion-kit]', err);
    if (req.method === 'GET') {
      return res.status(200).json(null);
    }
    return res.status(500).json({ error: err.message });
  }
}

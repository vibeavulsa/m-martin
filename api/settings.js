import { sql } from '@vercel/postgres';

/**
 * /api/settings
 * GET    → all settings, or ?key=<key> for a specific setting
 * POST   → upsert a setting  (body: { key, value })
 * DELETE → remove a setting  (query: ?key=<key>)
 */
export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { key } = req.query;
      if (key) {
        const { rows } = await sql`
          SELECT key, value FROM settings WHERE key = ${key}
        `;
        return res.status(200).json(rows[0]?.value ?? null);
      }
      const { rows } = await sql`SELECT key, value FROM settings ORDER BY key`;
      const result = {};
      for (const row of rows) result[row.key] = row.value;
      return res.status(200).json(result);
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const { key, value } = req.body;
      if (!key) return res.status(400).json({ error: 'Missing key' });
      await sql`
        INSERT INTO settings (key, value, updated_at)
        VALUES (${key}, ${JSON.stringify(value)}, NOW())
        ON CONFLICT (key) DO UPDATE SET
          value      = EXCLUDED.value,
          updated_at = NOW()
      `;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const { key } = req.query;
      if (!key) return res.status(400).json({ error: 'Missing key' });
      await sql`DELETE FROM settings WHERE key = ${key}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/settings]', err);
    if (req.method === 'GET') {
      return res.status(200).json(req.query.key ? null : {});
    }
    return res.status(500).json({ error: err.message });
  }
}

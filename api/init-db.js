import { sql } from '@vercel/postgres';

/**
 * POST /api/init-db
 * Creates all tables if they do not exist yet.
 * Should be called once after provisioning the Vercel Postgres database.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        price TEXT,
        image TEXT,
        images JSONB DEFAULT '[]',
        features JSONB DEFAULT '[]',
        is_sofa BOOLEAN DEFAULT FALSE,
        is_custom_order BOOLEAN DEFAULT FALSE,
        sofa_model TEXT,
        is_kit BOOLEAN DEFAULT FALSE,
        kit_quantity INTEGER,
        price_cash TEXT,
        price_installment TEXT,
        installments INTEGER,
        barcode TEXT,
        supplier TEXT,
        unit TEXT,
        cost_price TEXT,
        wholesale_price TEXT,
        max_stock INTEGER,
        fabrics JSONB DEFAULT '[]',
        extra JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS stock (
        product_id TEXT PRIMARY KEY,
        quantity INTEGER NOT NULL DEFAULT 0,
        min_stock INTEGER NOT NULL DEFAULT 5,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer JSONB NOT NULL,
        items JSONB NOT NULL,
        status TEXT NOT NULL DEFAULT 'pendente',
        total TEXT,
        payment_method TEXT,
        notes TEXT,
        user_id TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Add user_id column if it doesn't exist (migration for existing DBs)
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'orders' AND column_name = 'user_id'
        ) THEN
          ALTER TABLE orders ADD COLUMN user_id TEXT;
        END IF;
      END $$
    `;

    // Create index on user_id for efficient "Meus Pedidos" queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id)
      WHERE user_id IS NOT NULL
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS cushion_kit (
        id INTEGER PRIMARY KEY DEFAULT 1,
        config JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CHECK (id = 1)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        is_approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Create index on product_id for fast lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews (product_id)
    `;


    return res.status(200).json({ ok: true, message: 'Tables created (or already exist). Indexes applied.' });
  } catch (err) {
    console.error('[init-db]', err);
    return res.status(500).json({ error: err.message });
  }
}

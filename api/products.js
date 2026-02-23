import { sql } from '@vercel/postgres';

/**
 * /api/products
 * GET    → list all products
 * POST   → create a product  (body: product object)
 * PUT    → update a product  (body: { id, ...fields })
 * DELETE → delete a product  (query: ?id=<product_id>)
 */
export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { rows } = await sql`
        SELECT
          id,
          name,
          category,
          description,
          price,
          image,
          images,
          features,
          is_sofa AS "isSofa",
          is_custom_order AS "isCustomOrder",
          sofa_model AS "sofaModel",
          is_kit AS "isKit",
          kit_quantity AS "kitQuantity",
          price_cash AS "priceCash",
          price_installment AS "priceInstallment",
          installments,
          barcode,
          supplier,
          unit,
          cost_price AS "costPrice",
          wholesale_price AS "wholesalePrice",
          max_stock AS "maxStock",
          fabrics,
          extra,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM products
        ORDER BY created_at ASC
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const p = req.body;
      const { rows } = await sql`
        INSERT INTO products (
          id, name, category, description, price, image, images, features,
          is_sofa, is_custom_order, sofa_model, is_kit, kit_quantity,
          price_cash, price_installment, installments, barcode, supplier,
          unit, cost_price, wholesale_price, max_stock, fabrics, extra
        ) VALUES (
          ${p.id},
          ${p.name},
          ${p.category},
          ${p.description ?? null},
          ${p.price ?? null},
          ${p.image ?? null},
          ${JSON.stringify(p.images ?? [])},
          ${JSON.stringify(p.features ?? [])},
          ${p.isSofa ?? false},
          ${p.isCustomOrder ?? false},
          ${p.sofaModel ?? null},
          ${p.isKit ?? false},
          ${p.kitQuantity ?? null},
          ${p.priceCash ?? null},
          ${p.priceInstallment ?? null},
          ${p.installments ?? null},
          ${p.barcode ?? null},
          ${p.supplier ?? null},
          ${p.unit ?? null},
          ${p.costPrice ?? null},
          ${p.wholesalePrice ?? null},
          ${p.maxStock ?? null},
          ${JSON.stringify(p.fabrics ?? [])},
          ${JSON.stringify(p.extra ?? {})}
        )
        RETURNING id
      `;
      return res.status(201).json({ id: rows[0].id });
    }

    if (req.method === 'PUT') {
      const p = req.body;
      if (!p.id) return res.status(400).json({ error: 'Missing id' });
      await sql`
        UPDATE products SET
          name               = COALESCE(${p.name ?? null}, name),
          category           = COALESCE(${p.category ?? null}, category),
          description        = COALESCE(${p.description ?? null}, description),
          price              = COALESCE(${p.price ?? null}, price),
          image              = COALESCE(${p.image ?? null}, image),
          images             = COALESCE(${p.images != null ? JSON.stringify(p.images) : null}::jsonb, images),
          features           = COALESCE(${p.features != null ? JSON.stringify(p.features) : null}::jsonb, features),
          is_sofa            = COALESCE(${p.isSofa ?? null}, is_sofa),
          is_custom_order    = COALESCE(${p.isCustomOrder ?? null}, is_custom_order),
          sofa_model         = COALESCE(${p.sofaModel ?? null}, sofa_model),
          is_kit             = COALESCE(${p.isKit ?? null}, is_kit),
          kit_quantity       = COALESCE(${p.kitQuantity ?? null}, kit_quantity),
          price_cash         = COALESCE(${p.priceCash ?? null}, price_cash),
          price_installment  = COALESCE(${p.priceInstallment ?? null}, price_installment),
          installments       = COALESCE(${p.installments ?? null}, installments),
          barcode            = COALESCE(${p.barcode ?? null}, barcode),
          supplier           = COALESCE(${p.supplier ?? null}, supplier),
          unit               = COALESCE(${p.unit ?? null}, unit),
          cost_price         = COALESCE(${p.costPrice ?? null}, cost_price),
          wholesale_price    = COALESCE(${p.wholesalePrice ?? null}, wholesale_price),
          max_stock          = COALESCE(${p.maxStock ?? null}, max_stock),
          fabrics            = COALESCE(${p.fabrics != null ? JSON.stringify(p.fabrics) : null}::jsonb, fabrics),
          extra              = COALESCE(${p.extra != null ? JSON.stringify(p.extra) : null}::jsonb, extra),
          updated_at         = NOW()
        WHERE id = ${p.id}
      `;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await sql`DELETE FROM products WHERE id = ${id}`;
      await sql`DELETE FROM stock WHERE product_id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/products]', err);
    if (req.method === 'GET') {
      return res.status(200).json([]);
    }
    return res.status(500).json({ error: err.message });
  }
}

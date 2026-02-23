import { sql } from '@vercel/postgres';

/**
 * POST /api/seed-data
 * Seeds the database with initial categories, sofaFabrics, and products
 * if they don't already exist. Safe to call multiple times (idempotent).
 */

const seedCategories = [
  {
    id: 'sofas',
    name: 'Sofás',
    description: 'Design moderno e conforto que abraça — sofás feitos para transformar sua sala',
    iconName: 'IconArmchair'
  },
  {
    id: 'almofadas',
    name: 'Almofadas',
    description: 'Fibra siliconada 500g que não embola — maciez e beleza que duram',
    iconName: 'IconPalette'
  }
];

const seedSofaFabrics = [
  { id: 'suede', name: 'Suede', description: 'Aveludado e sofisticado' },
  { id: 'veludo', name: 'Veludo', description: 'Luxuoso e elegante' },
  { id: 'linho', name: 'Linho', description: 'Natural e refinado' },
  { id: 'courino', name: 'Courino', description: 'Resistente e fácil de limpar' },
  { id: 'chenille', name: 'Chenille', description: 'Macio e durável' },
  { id: 'boucle', name: 'Bouclê', description: 'Moderno e texturizado' },
  { id: 'couro-natural', name: 'Couro Natural', description: 'Premium e atemporal' },
  { id: 'couro-sintetico', name: 'Couro Sintético', description: 'Prático e elegante' },
  { id: 'veludo-cotelê', name: 'Veludo Cotelê', description: 'Clássico e charmoso' },
  { id: 'jacquard', name: 'Jacquard', description: 'Sofisticado e resistente' },
];

const seedProducts = [
  {
    id: '1',
    category: 'sofas',
    name: 'Sofá Zeus',
    description: 'Imponência e conforto em perfeita harmonia. O Zeus combina estrutura robusta com design arrojado, ideal para salas amplas que pedem personalidade e sofisticação.',
    price: 'Sob consulta',
    image: '/assets/sofas/Zeus.png',
    images: ['/assets/sofas/Zeus.png'],
    features: ['Sob encomenda', 'Estrutura reforçada', 'Design arrojado', 'Diversos tecidos disponíveis', 'Medidas personalizadas'],
    isSofa: true,
    isCustomOrder: true,
    sofaModel: 'Zeus',
    fabrics: seedSofaFabrics,
  },
  {
    id: '2',
    category: 'sofas',
    name: 'Sofá Chronos',
    description: 'O tempo parou quando o Chronos chegou. Linhas clean e elegantes que criam um ambiente de modernidade atemporal — perfeito para quem valoriza o detalhe.',
    price: 'Sob consulta',
    image: '/assets/sofas/Chronos.png',
    images: ['/assets/sofas/Chronos.png'],
    features: ['Sob encomenda', 'Design atemporal', 'Linhas clean', 'Diversos tecidos disponíveis', 'Medidas personalizadas'],
    isSofa: true,
    isCustomOrder: true,
    sofaModel: 'Chronos',
    fabrics: seedSofaFabrics,
  },
  {
    id: '3',
    category: 'sofas',
    name: 'Sofá Roma',
    description: 'A nobreza do design italiano em cada detalhe. O Roma traz capitonê elegante, pés torneados e um acabamento que transforma qualquer sala num ambiente de luxo.',
    price: 'Sob consulta',
    image: '/assets/sofas/Roma.png',
    images: ['/assets/sofas/Roma.png'],
    features: ['Sob encomenda', 'Estilo clássico', 'Capitonê disponível', 'Diversos tecidos disponíveis', 'Medidas personalizadas'],
    isSofa: true,
    isCustomOrder: true,
    sofaModel: 'Roma',
    fabrics: seedSofaFabrics,
  },
  {
    id: '4',
    category: 'sofas',
    name: 'Sofá RC',
    description: 'Versatilidade e praticidade sem abrir mão do estilo. O RC é retrátil e reclinável, ideal para quem busca o máximo conforto para relaxar com a família.',
    price: 'Sob consulta',
    image: '/assets/sofas/RC.png',
    images: ['/assets/sofas/RC.png'],
    features: ['Sob encomenda', 'Retrátil e reclinável', 'Alta durabilidade', 'Diversos tecidos disponíveis', 'Medidas personalizadas'],
    isSofa: true,
    isCustomOrder: true,
    sofaModel: 'RC',
    fabrics: seedSofaFabrics,
  },
  {
    id: '5',
    category: 'sofas',
    name: 'Sofá Orgânico',
    description: 'Curvas que abraçam. O Orgânico tem formas fluidas e envolventes que evocam natureza e acolhimento — para quem quer um sofá com alma e personalidade únicas.',
    price: 'Sob consulta',
    image: '/assets/sofas/Organico.png',
    images: ['/assets/sofas/Organico.png'],
    features: ['Sob encomenda', 'Design orgânico', 'Formas fluidas', 'Diversos tecidos disponíveis', 'Medidas personalizadas'],
    isSofa: true,
    isCustomOrder: true,
    sofaModel: 'Orgânico',
    fabrics: seedSofaFabrics,
  },
  {
    id: '6',
    category: 'sofas',
    name: 'Sofá Sem Caixa',
    description: 'Sofisticação sem comprometer a sala. O Sem Caixa tem estrutura elevada e leveza visual, ideal para ambientes menores ou quem prefere um visual mais moderno e arejado.',
    price: 'Sob consulta',
    image: '/assets/sofas/SemCaixa.png',
    images: ['/assets/sofas/SemCaixa.png'],
    features: ['Sob encomenda', 'Visual leve e arejado', 'Estrutura elevada', 'Diversos tecidos disponíveis', 'Medidas personalizadas'],
    isSofa: true,
    isCustomOrder: true,
    sofaModel: 'Sem Caixa',
    fabrics: seedSofaFabrics,
  },
  {
    id: '7',
    category: 'sofas',
    name: 'Chaise',
    description: "Elegância e conforto em uma peça só. A Chaise M'Martin combina encosto reclinável com assento amplo, perfeita para relaxar com estilo em qualquer ambiente.",
    price: 'Sob consulta',
    image: '/assets/sofas/Chaise.png',
    images: ['/assets/sofas/Chaise.png'],
    features: ['Sob encomenda', 'Visual leve e arejado', 'Estrutura elevada', 'Diversos tecidos disponíveis', 'Medidas personalizadas'],
    isSofa: true,
    isCustomOrder: true,
    sofaModel: 'Chaise',
    fabrics: seedSofaFabrics,
  },
  {
    id: '13',
    category: 'almofadas',
    name: 'Kit Refil de Almofada 45x45 ou 50x50',
    description: "Linha Premium M'Martin com fibra siliconada 500g — a tecnologia que garante maciez e conforto duradouros. O enchimento especial mantém o formato, não embola e proporciona sustentação ideal. Renove seus sofás e ambientes com elegância e bem-estar.",
    price: 'R$ 349,50',
    priceCash: 'R$ 349,50',
    priceInstallment: 'R$ 69,90',
    installments: 5,
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600',
    features: ['Kit com 5 unidades', 'Tecido Oxford premium', 'Fibra siliconada 500g', 'Não embola', 'Alta durabilidade', 'Escolha cada cor'],
    isKit: true,
    kitQuantity: 5,
  },
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const results = { categories: false, sofaFabrics: false, products: 0 };

    // Seed categories
    const catSetting = await sql`SELECT key FROM settings WHERE key = 'categories'`;
    if (catSetting.rows.length === 0) {
      await sql`
        INSERT INTO settings (key, value, updated_at)
        VALUES ('categories', ${JSON.stringify(seedCategories)}, NOW())
      `;
      results.categories = true;
    }

    // Seed sofaFabrics
    const fabSetting = await sql`SELECT key FROM settings WHERE key = 'sofaFabrics'`;
    if (fabSetting.rows.length === 0) {
      await sql`
        INSERT INTO settings (key, value, updated_at)
        VALUES ('sofaFabrics', ${JSON.stringify(seedSofaFabrics)}, NOW())
      `;
      results.sofaFabrics = true;
    }

    // Upsert ALL products so they're always restored to the real products table
    for (const p of seedProducts) {
      await sql`
        INSERT INTO products (
          id, name, category, description, price, image, images, features,
          is_sofa, is_custom_order, sofa_model, is_kit, kit_quantity,
          price_cash, price_installment, installments, fabrics
        ) VALUES (
          ${p.id},
          ${p.name},
          ${p.category},
          ${p.description ?? null},
          ${p.price ?? null},
          ${p.image ?? null},
          ${JSON.stringify(p.images ?? [])}::jsonb,
          ${JSON.stringify(p.features ?? [])}::jsonb,
          ${p.isSofa ?? false},
          ${p.isCustomOrder ?? false},
          ${p.sofaModel ?? null},
          ${p.isKit ?? false},
          ${p.kitQuantity ?? null},
          ${p.priceCash ?? null},
          ${p.priceInstallment ?? null},
          ${p.installments ?? null},
          ${JSON.stringify(p.fabrics ?? [])}::jsonb
        )
        ON CONFLICT (id) DO UPDATE SET
          name              = EXCLUDED.name,
          category          = EXCLUDED.category,
          description       = EXCLUDED.description,
          price             = EXCLUDED.price,
          image             = EXCLUDED.image,
          images            = EXCLUDED.images,
          features          = EXCLUDED.features,
          is_sofa           = EXCLUDED.is_sofa,
          is_custom_order   = EXCLUDED.is_custom_order,
          sofa_model        = EXCLUDED.sofa_model,
          is_kit            = EXCLUDED.is_kit,
          kit_quantity      = EXCLUDED.kit_quantity,
          price_cash        = EXCLUDED.price_cash,
          price_installment = EXCLUDED.price_installment,
          installments      = EXCLUDED.installments,
          fabrics           = EXCLUDED.fabrics,
          updated_at        = NOW()
      `;
      results.products += 1;
    }

    return res.status(200).json({ ok: true, seeded: results });
  } catch (err) {
    console.error('[api/seed-data]', err);
    return res.status(500).json({ error: err.message });
  }
}
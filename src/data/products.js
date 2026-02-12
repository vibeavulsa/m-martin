// Product categories for M'Martin catalog
export const categories = [
  {
    id: 'sofas',
    name: 'Sofás',
    description: 'Estofados finos para sua sala de estar',
    iconName: 'IconArmchair'
  },
  {
    id: 'almofadas',
    name: 'Almofadas',
    description: 'Conforto e decoração para seus ambientes',
    iconName: 'IconPalette'
  },
  {
    id: 'travesseiros',
    name: 'Travesseiros',
    description: 'Qualidade para um sono tranquilo',
    iconName: 'IconMoon'
  },
  {
    id: 'homecare-hospitalar',
    name: 'Homecare e Hospitalar',
    description: 'Linha especializada para cama e travesseiro',
    iconName: 'IconHeartbeat'
  },
  {
    id: 'pet',
    name: 'Pet',
    description: 'Conforto e qualidade para seu melhor amigo',
    iconName: 'IconPaw'
  }
];

// Sample products data
export const products = [
  // Sofás
  {
    id: 1,
    category: 'sofas',
    name: 'Sofá Premium 3 Lugares',
    description: 'Sofá elegante com acabamento fino e conforto excepcional',
    price: 'R$ 3.500,00',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
    features: ['Tecido premium', 'Estrutura reforçada', 'Design moderno']
  },
  {
    id: 2,
    category: 'sofas',
    name: 'Sofá Retrátil Confort',
    description: 'Sofá retrátil com reclinável para máximo conforto',
    price: 'R$ 4.200,00',
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600',
    features: ['Retrátil e reclinável', 'Espuma D33', 'Acabamento impecável']
  },
  {
    id: 3,
    category: 'sofas',
    name: 'Sofá de Canto Modular',
    description: 'Sofá de canto com configuração modular',
    price: 'R$ 5.800,00',
    image: 'https://images.unsplash.com/photo-1550254478-ead40cc54513?w=600',
    features: ['Modular', 'Alta durabilidade', 'Design contemporâneo']
  },
  
  // Almofadas
  {
    id: 4,
    category: 'almofadas',
    name: 'Almofada Decorativa Veludo',
    description: 'Almofada em veludo com design sofisticado',
    price: 'R$ 120,00',
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600',
    features: ['Veludo premium', 'Diversas cores', 'Acabamento luxuoso']
  },
  {
    id: 5,
    category: 'almofadas',
    name: 'Almofada Ortopédica',
    description: 'Almofada com suporte ortopédico para postura',
    price: 'R$ 180,00',
    image: 'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?w=600',
    features: ['Suporte ortopédico', 'Tecido respirável', 'Lavável']
  },
  {
    id: 6,
    category: 'almofadas',
    name: 'Kit Almofadas Estampadas',
    description: 'Conjunto de 4 almofadas com estampas modernas',
    price: 'R$ 380,00',
    image: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=600',
    features: ['Kit com 4 peças', 'Estampas exclusivas', 'Alta qualidade']
  },
  
  // Travesseiros
  {
    id: 7,
    category: 'travesseiros',
    name: 'Travesseiro Viscoelástico',
    description: 'Travesseiro de espuma viscoelástica para conforto ideal',
    price: 'R$ 280,00',
    image: 'https://images.unsplash.com/photo-1592789705501-f9ae4278a9e9?w=600',
    features: ['Viscoelástico', 'Anatômico', 'Anti-alérgico']
  },
  {
    id: 8,
    category: 'travesseiros',
    name: 'Travesseiro Plumas Premium',
    description: 'Travesseiro com enchimento de plumas naturais',
    price: 'R$ 350,00',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600',
    features: ['Plumas naturais', 'Capa 100% algodão', 'Luxuoso']
  },
  {
    id: 9,
    category: 'travesseiros',
    name: 'Travesseiro Cervical',
    description: 'Travesseiro ergonômico para alívio cervical',
    price: 'R$ 240,00',
    image: 'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?w=600',
    features: ['Ergonômico', 'Suporte cervical', 'Terapêutico']
  },
  
  // Homecare e Hospitalar
  {
    id: 10,
    category: 'homecare-hospitalar',
    name: 'Colchão Hospitalar D45',
    description: 'Colchão hospitalar de alta densidade para uso contínuo',
    price: 'R$ 1.800,00',
    image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600',
    features: ['Densidade D45', 'Impermeável', 'Anti-escaras']
  },
  {
    id: 11,
    category: 'homecare-hospitalar',
    name: 'Travesseiro Anti-Refluxo',
    description: 'Travesseiro especial para homecare e uso hospitalar',
    price: 'R$ 320,00',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600',
    features: ['Anti-refluxo', 'Inclinação ideal', 'Material hospitalar']
  },
  {
    id: 12,
    category: 'homecare-hospitalar',
    name: 'Kit Cama Hospitalar Completo',
    description: 'Kit completo com colchão, travesseiro e proteção',
    price: 'R$ 2.500,00',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600',
    features: ['Kit completo', 'Normas ANVISA', 'Alta durabilidade']
  },

  // Refil de Almofada - Kit de 5
  {
    id: 13,
    category: 'almofadas',
    name: 'Kit Refil de Almofada 45x45 ou 50x50',
    description: "Linha Premium M'Martin com fibra siliconada 500g - Tecnologia que garante maciez e conforto duradouros. O enchimento especial mantém o formato, não embola e proporciona sustentação ideal. Perfeito para renovar seus sofás e ambientes com elegância e bem-estar.",
    price: 'R$ 329,50',
    priceInstallment: 'R$ 349,50',
    installments: 5,
    priceCash: 'R$ 329,50',
    unitPriceCash: 'R$ 65,90',
    unitPriceInstallment: 'R$ 69,90',
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600',
    features: ['Kit com 5 unidades', 'Tecido Oxford premium', 'Fibra siliconada 500g', 'Não embola', 'Alta durabilidade', 'Cores variadas'],
    isKit: true,
    kitQuantity: 5,
    sizes: ['45x45', '50x50'],
    colors: ['Preto', 'Branco', 'Azul Royal', 'Cinza Rato', 'Malva', 'Terracota', 'Bege', 'Bordô', 'Pink']
  },

  // Colchão para Acamados
  {
    id: 14,
    category: 'homecare-hospitalar',
    name: 'Colchão para Acamados 1,88x88x14',
    description: 'Colchão especial para acamados com espuma D33 ou soft D30, capa com zíper em courino azul padrão da indústria',
    price: 'R$ 807,90',
    priceInstallment: 'R$ 179,90',
    installments: 5,
    priceCash: 'R$ 807,90',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600',
    features: ['1,88m x 88cm x 14cm', 'Espuma D33 ou D30 soft', 'Capa courino azul', 'Zíper para fácil limpeza', 'Padrão industrial'],
    foamOptions: ['D33', 'D30 Soft']
  },

  // Cama para Pet
  {
    id: 15,
    category: 'pet',
    name: 'Cama para Pet 70x90',
    description: 'Cama confortável para seu pet com material sintético, fácil limpeza, 500g de isopor moído e zíper',
    price: 'R$ 130,00',
    priceInstallment: 'R$ 139,90',
    installments: 5,
    priceCash: 'R$ 130,00',
    image: 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=600',
    features: ['70cm x 90cm', 'Material sintético', 'Fácil limpeza', '500g isopor moído', 'Zíper removível']
  }
];

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
    image: '/placeholder-sofa-1.jpg',
    features: ['Tecido premium', 'Estrutura reforçada', 'Design moderno']
  },
  {
    id: 2,
    category: 'sofas',
    name: 'Sofá Retrátil Confort',
    description: 'Sofá retrátil com reclinável para máximo conforto',
    price: 'R$ 4.200,00',
    image: '/placeholder-sofa-2.jpg',
    features: ['Retrátil e reclinável', 'Espuma D33', 'Acabamento impecável']
  },
  {
    id: 3,
    category: 'sofas',
    name: 'Sofá de Canto Modular',
    description: 'Sofá de canto com configuração modular',
    price: 'R$ 5.800,00',
    image: '/placeholder-sofa-3.jpg',
    features: ['Modular', 'Alta durabilidade', 'Design contemporâneo']
  },
  
  // Almofadas
  {
    id: 4,
    category: 'almofadas',
    name: 'Almofada Decorativa Veludo',
    description: 'Almofada em veludo com design sofisticado',
    price: 'R$ 120,00',
    image: '/placeholder-cushion-1.jpg',
    features: ['Veludo premium', 'Diversas cores', 'Acabamento luxuoso']
  },
  {
    id: 5,
    category: 'almofadas',
    name: 'Almofada Ortopédica',
    description: 'Almofada com suporte ortopédico para postura',
    price: 'R$ 180,00',
    image: '/placeholder-cushion-2.jpg',
    features: ['Suporte ortopédico', 'Tecido respirável', 'Lavável']
  },
  {
    id: 6,
    category: 'almofadas',
    name: 'Kit Almofadas Estampadas',
    description: 'Conjunto de 4 almofadas com estampas modernas',
    price: 'R$ 380,00',
    image: '/placeholder-cushion-3.jpg',
    features: ['Kit com 4 peças', 'Estampas exclusivas', 'Alta qualidade']
  },
  
  // Travesseiros
  {
    id: 7,
    category: 'travesseiros',
    name: 'Travesseiro Viscoelástico',
    description: 'Travesseiro de espuma viscoelástica para conforto ideal',
    price: 'R$ 280,00',
    image: '/placeholder-pillow-1.jpg',
    features: ['Viscoelástico', 'Anatômico', 'Anti-alérgico']
  },
  {
    id: 8,
    category: 'travesseiros',
    name: 'Travesseiro Plumas Premium',
    description: 'Travesseiro com enchimento de plumas naturais',
    price: 'R$ 350,00',
    image: '/placeholder-pillow-2.jpg',
    features: ['Plumas naturais', 'Capa 100% algodão', 'Luxuoso']
  },
  {
    id: 9,
    category: 'travesseiros',
    name: 'Travesseiro Cervical',
    description: 'Travesseiro ergonômico para alívio cervical',
    price: 'R$ 240,00',
    image: '/placeholder-pillow-3.jpg',
    features: ['Ergonômico', 'Suporte cervical', 'Terapêutico']
  },
  
  // Homecare e Hospitalar
  {
    id: 10,
    category: 'homecare-hospitalar',
    name: 'Colchão Hospitalar D45',
    description: 'Colchão hospitalar de alta densidade para uso contínuo',
    price: 'R$ 1.800,00',
    image: '/placeholder-hospital-1.jpg',
    features: ['Densidade D45', 'Impermeável', 'Anti-escaras']
  },
  {
    id: 11,
    category: 'homecare-hospitalar',
    name: 'Travesseiro Anti-Refluxo',
    description: 'Travesseiro especial para homecare e uso hospitalar',
    price: 'R$ 320,00',
    image: '/placeholder-hospital-2.jpg',
    features: ['Anti-refluxo', 'Inclinação ideal', 'Material hospitalar']
  },
  {
    id: 12,
    category: 'homecare-hospitalar',
    name: 'Kit Cama Hospitalar Completo',
    description: 'Kit completo com colchão, travesseiro e proteção',
    price: 'R$ 2.500,00',
    image: '/placeholder-hospital-3.jpg',
    features: ['Kit completo', 'Normas ANVISA', 'Alta durabilidade']
  }
];

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconPalette,
  IconCheck,
  IconShoppingCartPlus,
  IconBrandWhatsapp,
  IconX,
  IconSparkles,
} from '@tabler/icons-react';
import { useCart } from '../context/CartContext';
import CushionKitSelector from './CushionKitSelector';
import './CushionKitBanner.css';

const defaultColors = ['Preto', 'Branco', 'Azul Marinho', 'Cinza Rato', 'Rosê', 'Terracota', 'Bege', 'Bordô'];
const defaultSizes = ['45x45', '50x50'];

const defaultKitProduct = {
  id: 'cushion-kit',
  category: 'almofadas',
  name: 'Kit Refil de Almofada 45x45 ou 50x50',
  description: 'Kit com 5 almofadas em tecido Oxford, fibra siliconada 500g. Escolha as cores de cada uma!',
  price: 'R$ 48,00',
  priceInstallment: 'R$ 53,90',
  installments: 5,
  priceCash: 'R$ 48,00',
  image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600',
  features: ['Kit com 5 unidades', 'Tecido Oxford', 'Fibra siliconada 500g', 'Cores variadas'],
  isKit: true,
  kitQuantity: 5,
};

const colorGradients = {
  'Preto': 'linear-gradient(135deg, #2c2c2c 0%, #000000 100%)',
  'Branco': 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
  'Azul Marinho': 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
  'Cinza Rato': 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
  'Rosê': 'linear-gradient(135deg, #fda4af 0%, #fb7185 100%)',
  'Terracota': 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
  'Bege': 'linear-gradient(135deg, #e7d4b5 0%, #d4b896 100%)',
  'Bordô': 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)',
};

const CushionKitBanner = ({ kitConfig }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cushionColors, setCushionColors] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const colors = kitConfig?.colors || defaultColors;
  const sizes = kitConfig?.sizes || defaultSizes;
  const kitProduct = kitConfig?.product || defaultKitProduct;

  useEffect(() => {
    setSelectedSize(sizes[0]);
  }, [sizes]);

  const handleOpenDialog = () => {
    setDialogOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    document.body.style.overflow = '';
  };

  const handleAddToCart = () => {
    const itemData = {
      ...kitProduct,
      selectedSize,
      cushionColors: cushionColors.length > 0 ? cushionColors : undefined,
    };
    addItem(itemData);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Gostaria de montar meu Kit de Almofadas Personalizáveis (${selectedSize}). Podem me ajudar?`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') handleCloseDialog();
    };
    if (dialogOpen) {
      document.addEventListener('keydown', handleKey);
    }
    return () => document.removeEventListener('keydown', handleKey);
  }, [dialogOpen]);

  const previewColors = colors.slice(0, 6);

  return (
    <>
      <motion.div
        className="cushion-kit-banner"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="cushion-kit-banner-content">
          <span className="cushion-kit-banner-badge">
            <IconSparkles size={12} stroke={2} /> Personalizável
          </span>
          <h2 className="cushion-kit-banner-title">
            Almofadas <span>personalizáveis</span>,<br />
            encaixe no seu sofá!
          </h2>
          <p className="cushion-kit-banner-description">
            {kitProduct.description}
          </p>
          <div className="cushion-kit-banner-price">
            A partir de <strong>{kitProduct.priceCash || kitProduct.price}</strong>{' '}
            {kitProduct.installments && kitProduct.priceInstallment && (
              <>ou {kitProduct.installments}x de {kitProduct.priceInstallment}</>
            )}
          </div>
          <div className="cushion-kit-banner-features">
            {kitProduct.features.map((feature, i) => (
              <span key={i} className="cushion-kit-feature-tag">
                <IconCheck size={12} stroke={3} />
                {feature}
              </span>
            ))}
          </div>
          <motion.button
            className="cushion-kit-banner-cta"
            onClick={handleOpenDialog}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <IconPalette size={20} stroke={2} />
            Montar Meu Kit
          </motion.button>
        </div>
        <div className="cushion-kit-banner-visual">
          {previewColors.map((color, i) => (
            <motion.div
              key={color}
              className="cushion-preview-item"
              style={{ background: colorGradients[color] || '#999' }}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            />
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {dialogOpen && (
          <motion.div
            className="cushion-kit-dialog-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleCloseDialog}
          >
            <motion.div
              className="cushion-kit-dialog"
              initial={{ opacity: 0, scale: 0.92, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="cushion-kit-dialog-close"
                onClick={handleCloseDialog}
                aria-label="Fechar"
              >
                <IconX size={18} stroke={2} />
              </button>

              <div className="cushion-kit-dialog-header">
                <h2>Monte Seu Kit de Almofadas</h2>
                <p>Escolha o tamanho e as cores para cada almofada</p>
              </div>

              {sizes.length > 0 && (
                <div className="cushion-kit-dialog-size">
                  <h4>Tamanho</h4>
                  <div className="cushion-kit-dialog-size-options">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        className={`cushion-kit-size-btn ${selectedSize === size ? 'active' : ''}`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <CushionKitSelector
                colors={colors}
                onChange={setCushionColors}
              />

              <div className="cushion-kit-dialog-actions">
                <button
                  className={`btn-add-kit ${added ? 'added' : ''}`}
                  onClick={handleAddToCart}
                >
                  <IconShoppingCartPlus size={18} stroke={2} />
                  {added ? 'Adicionado!' : 'Adicionar ao Carrinho'}
                </button>
                <button
                  className="btn-whatsapp-kit"
                  onClick={handleWhatsApp}
                >
                  <IconBrandWhatsapp size={18} stroke={2} />
                  WhatsApp
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CushionKitBanner;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import {
  IconX,
  IconPackage,
  IconShoppingCartPlus,
  IconMinus,
  IconPlus,
  IconTruck,
  IconShieldCheck,
  IconBrandWhatsapp,
  IconCheck,
  IconStar,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import { useCart } from '../context/CartContext';
import CushionKitSelector from './CushionKitSelector';
import './ProductDialog.css';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 40,
    transition: { duration: 0.2 }
  }
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.12 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
};

const featureVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.25 } }
};

const DialogInner = ({ product, onClose }) => {
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes ? product.sizes[0] : null);
  const [selectedFoam, setSelectedFoam] = useState(product.foamOptions ? product.foamOptions[0] : null);
  const [cushionColors, setCushionColors] = useState([]);
  const [paymentType, setPaymentType] = useState('cash');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem } = useCart();

  // Get images array (support both single image and multiple images)
  const images = product.images && product.images.length > 0 
    ? product.images 
    : product.image 
      ? [product.image] 
      : [];

  // Reset states when product changes
  useEffect(() => {
    setSelectedSize(product.sizes ? product.sizes[0] : null);
    setSelectedFoam(product.foamOptions ? product.foamOptions[0] : null);
    setCushionColors([]);
    setPaymentType('cash');
    setQuantity(1);
    setImageError(false);
    setCurrentImageIndex(0);
  }, [product]);

  // Reset image index if it exceeds the current images array length
  useEffect(() => {
    if (currentImageIndex >= images.length && images.length > 0) {
      setCurrentImageIndex(0);
    }
  }, [images.length, currentImageIndex]);

  const handleAddToCart = () => {
    const itemData = {
      ...product,
      selectedSize,
      selectedFoam,
      cushionColors: cushionColors.length > 0 ? cushionColors : undefined,
      paymentType
    };
    addItem(itemData, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    const itemData = {
      ...product,
      selectedSize,
      selectedFoam,
      cushionColors: cushionColors.length > 0 ? cushionColors : undefined,
      paymentType
    };
    addItem(itemData, quantity);
    onClose();
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Gostaria de mais informações sobre o produto: *${product.name}* (${product.price})`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const decrementQty = () => setQuantity((q) => Math.max(1, q - 1));
  const incrementQty = () => setQuantity((q) => Math.min(99, q + 1));

  return (
    <motion.div
      className="dialog-content"
      variants={dialogVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={(e) => e.stopPropagation()}
    >
      <motion.button
        className="dialog-close"
        onClick={onClose}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Fechar"
      >
        <IconX size={18} stroke={2} />
      </motion.button>

      <div className="dialog-layout">
        <motion.div
          className="dialog-image-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="dialog-image">
            {images.length > 0 && !imageError ? (
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex]}
                  alt={`${product.name} - Imagem ${currentImageIndex + 1}`}
                  onError={() => setImageError(true)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
            ) : (
              <div className="dialog-image-placeholder">
                <IconPackage size={72} stroke={1.5} className="placeholder-icon" />
              </div>
            )}
          </div>

          {images.length > 1 && !imageError && (
            <>
              <motion.button
                className="dialog-image-nav dialog-image-nav-prev"
                onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Imagem anterior"
              >
                <IconChevronLeft size={24} stroke={2} />
              </motion.button>
              <motion.button
                className="dialog-image-nav dialog-image-nav-next"
                onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Próxima imagem"
              >
                <IconChevronRight size={24} stroke={2} />
              </motion.button>
              
              <div className="dialog-image-thumbnails">
                {images.map((img, index) => (
                  <motion.button
                    key={index}
                    className={`dialog-image-thumbnail ${index === currentImageIndex ? 'thumbnail-active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={`Ver imagem ${index + 1}`}
                  >
                    <img src={img} alt={`Miniatura ${index + 1}`} />
                  </motion.button>
                ))}
              </div>
            </>
          )}
        </motion.div>

        <motion.div
          className="dialog-body"
          variants={contentVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="dialog-header-section" variants={itemVariants}>
            <div className="dialog-category-badge">{product.category}</div>
            <h2 className="dialog-title">{product.name}</h2>
            <div className="dialog-rating">
              {[...Array(5)].map((_, i) => (
                <IconStar key={i} size={14} stroke={1.5} fill={i < 4 ? '#d9b154' : 'none'} color="#d9b154" />
              ))}
              <span className="dialog-rating-text">4.0</span>
            </div>
          </motion.div>

          <motion.p className="dialog-description" variants={itemVariants}>
            {product.description}
          </motion.p>

          <motion.div className="dialog-features" variants={itemVariants}>
            <h4 className="dialog-section-label">Características</h4>
            <div className="dialog-features-list">
              {product.features.map((feature, index) => (
                <motion.span
                  key={index}
                  className="dialog-feature-tag"
                  variants={featureVariants}
                >
                  <IconCheck size={12} stroke={3} />
                  {feature}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Size selection for cushions */}
          {product.sizes && (
            <motion.div className="dialog-options-section" variants={itemVariants}>
              <h4 className="dialog-section-label">Tamanho</h4>
              <div className="dialog-option-buttons">
                {product.sizes.map((size) => (
                  <motion.button
                    key={size}
                    className={`dialog-option-btn ${selectedSize === size ? 'option-btn-active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Foam selection for mattress */}
          {product.foamOptions && (
            <motion.div className="dialog-options-section" variants={itemVariants}>
              <h4 className="dialog-section-label">Tipo de Espuma</h4>
              <div className="dialog-option-buttons">
                {product.foamOptions.map((foam) => (
                  <motion.button
                    key={foam}
                    className={`dialog-option-btn ${selectedFoam === foam ? 'option-btn-active' : ''}`}
                    onClick={() => setSelectedFoam(foam)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {foam}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Cushion kit color selector */}
          {product.isKit && product.colors && (
            <motion.div variants={itemVariants}>
              <CushionKitSelector
                colors={product.colors}
                onChange={setCushionColors}
              />
            </motion.div>
          )}

          <motion.div className="dialog-price-section" variants={itemVariants}>
            {product.priceInstallment ? (
              <div className="dialog-price-options">
                <div 
                  className={`dialog-price-option ${paymentType === 'cash' ? 'price-option-active' : ''}`}
                  onClick={() => setPaymentType('cash')}
                >
                  <span className="price-option-label">À vista</span>
                  <span className="dialog-price">{product.priceCash || product.price}</span>
                </div>
                <div 
                  className={`dialog-price-option ${paymentType === 'installment' ? 'price-option-active' : ''}`}
                  onClick={() => setPaymentType('installment')}
                >
                  <span className="price-option-label">Parcelado</span>
                  <span className="dialog-price">{product.installments}x {product.priceInstallment}</span>
                </div>
              </div>
            ) : (
              <>
                <span className="dialog-price">{product.price}</span>
                <span className="dialog-installments">
                  ou até 10x sem juros
                </span>
              </>
            )}
          </motion.div>

          <motion.div className="dialog-quantity-section" variants={itemVariants}>
            <h4 className="dialog-section-label">Quantidade</h4>
            <div className="dialog-quantity-control">
              <motion.button
                className="dialog-qty-btn"
                onClick={decrementQty}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={quantity <= 1}
              >
                <IconMinus size={16} stroke={2} />
              </motion.button>
              <span className="dialog-qty-value">{quantity}</span>
              <motion.button
                className="dialog-qty-btn"
                onClick={incrementQty}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <IconPlus size={16} stroke={2} />
              </motion.button>
            </div>
          </motion.div>

          <motion.div className="dialog-actions" variants={itemVariants}>
            <motion.button
              className={`dialog-btn-cart ${added ? 'dialog-btn-cart-added' : ''}`}
              onClick={handleAddToCart}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <IconShoppingCartPlus size={18} stroke={2} />
              {added ? 'Adicionado!' : 'Adicionar ao Carrinho'}
            </motion.button>
            <motion.button
              className="dialog-btn-buy"
              onClick={handleBuyNow}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Comprar Agora
            </motion.button>
          </motion.div>

          <motion.button
            className="dialog-btn-whatsapp"
            onClick={handleWhatsApp}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <IconBrandWhatsapp size={18} stroke={2} />
            Consultar via WhatsApp
          </motion.button>

          <motion.div className="dialog-trust-badges" variants={itemVariants}>
            <div className="trust-badge">
              <IconTruck size={18} stroke={1.5} />
              <span>Entrega para todo Brasil</span>
            </div>
            <div className="trust-badge">
              <IconShieldCheck size={18} stroke={1.5} />
              <span>Garantia de fábrica</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const ProductDialog = ({ product, isOpen, onClose }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && product && (
        <motion.div
          className="dialog-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <DialogInner key={product.id} product={product} onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductDialog;

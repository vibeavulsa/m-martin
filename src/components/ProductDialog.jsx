import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { IconX, IconPackage, IconShoppingCartPlus } from '@tabler/icons-react';
import { useCart } from '../context/CartContext';
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
    transition: { staggerChildren: 0.08, delayChildren: 0.15 }
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
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

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

      <motion.div
        className="dialog-image"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {!imageError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="dialog-image-placeholder">
            <IconPackage size={72} stroke={1.5} className="placeholder-icon" />
          </div>
        )}
      </motion.div>

      <motion.div
        className="dialog-body"
        variants={contentVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 className="dialog-title" variants={itemVariants}>
          {product.name}
        </motion.h2>

        <motion.p className="dialog-description" variants={itemVariants}>
          {product.description}
        </motion.p>

        <motion.div className="dialog-features" variants={itemVariants}>
          {product.features.map((feature, index) => (
            <motion.span
              key={index}
              className="dialog-feature-tag"
              variants={featureVariants}
            >
              {feature}
            </motion.span>
          ))}
        </motion.div>

        <motion.div className="dialog-footer" variants={itemVariants}>
          <span className="dialog-price">{product.price}</span>
          <motion.button
            className={`dialog-cta ${added ? 'dialog-cta-added' : ''}`}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAddToCart}
          >
            <IconShoppingCartPlus size={18} stroke={2} />
            {added ? 'Adicionado!' : 'Adicionar ao Carrinho'}
          </motion.button>
        </motion.div>
      </motion.div>
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

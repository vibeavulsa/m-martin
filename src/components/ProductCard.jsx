import React, { useState } from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { IconPackage, IconShoppingCartPlus, IconEye } from '@tabler/icons-react';
import { useCart } from '../context/CartContext';
import ProductDialog from './ProductDialog';
import './ProductCard.css';

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const ProductCard = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const hasMultipleImages = product.images && product.images.length > 1;
  const displayImage = product.images && product.images.length > 0 ? product.images[0] : product.image;

  return (
    <>
      <motion.div
        className="product-card"
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        whileHover={{ y: -7, boxShadow: '0 18px 38px rgba(0,0,0,0.38), 0 0 18px rgba(217,177,84,0.12)' }}
        transition={{ duration: 0.28 }}
      >
        <div className="product-image">
          {!imageError && displayImage ? (
            <>
              <img 
                src={displayImage} 
                alt={product.name}
                className="product-img"
                onError={() => setImageError(true)}
              />
              {hasMultipleImages && (
                <div className="product-image-badge">
                  <IconPackage size={14} stroke={2} />
                  <span>{product.images.length} fotos</span>
                </div>
              )}
            </>
          ) : (
            <div className="image-placeholder">
              <IconPackage size={64} stroke={1.5} className="placeholder-icon" />
            </div>
          )}
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-description">{product.description}</p>
          <div className="product-features">
            {product.features.map((feature, index) => (
              <span key={index} className="feature-tag">
                {feature}
              </span>
            ))}
          </div>
          <div className="product-footer">
            <span className="product-price">{product.price}</span>
            <div className="product-actions">
              <motion.button
                className={`btn-add-cart ${added ? 'btn-added' : ''}`}
                onClick={handleAddToCart}
                title="Adicionar ao carrinho"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconShoppingCartPlus size={18} stroke={2} />
              </motion.button>
              <motion.button
                className="btn-contact"
                onClick={() => setDialogOpen(true)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
              >
                <IconEye size={16} stroke={2} />
                Ver Detalhes
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
      <ProductDialog
        product={product}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
};

export default ProductCard;

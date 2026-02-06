import React, { useState } from 'react';
import { IconPackage, IconShoppingCartPlus } from '@tabler/icons-react';
import { useCart } from '../context/CartContext';
import ProductDialog from './ProductDialog';
import './ProductCard.css';

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

  return (
    <>
      <div className="product-card">
        <div className="product-image">
          {!imageError ? (
            <img 
              src={product.image} 
              alt={product.name}
              className="product-img"
              onError={() => setImageError(true)}
            />
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
              <button
                className={`btn-add-cart ${added ? 'btn-added' : ''}`}
                onClick={handleAddToCart}
                title="Adicionar ao carrinho"
              >
                <IconShoppingCartPlus size={18} stroke={2} />
              </button>
              <button className="btn-contact" onClick={() => setDialogOpen(true)}>Consultar</button>
            </div>
          </div>
        </div>
      </div>
      <ProductDialog
        product={product}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
};

export default ProductCard;

import React from 'react';
import LiquidGlass from 'liquid-glass-react';
import { IconPackage } from '@tabler/icons-react';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  return (
    <LiquidGlass className="product-card">
      <div className="product-image">
        <div className="image-placeholder">
          <IconPackage size={64} stroke={1.5} className="placeholder-icon" />
        </div>
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
          <button className="btn-contact">Consultar</button>
        </div>
      </div>
    </LiquidGlass>
  );
};

export default ProductCard;

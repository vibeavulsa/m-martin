import React from 'react';
import { IconShoppingCart } from '@tabler/icons-react';
import { useCart } from '../context/CartContext';
import './Header.css';
import logo from '../assets/logo.png';

const Header = ({ onCartClick }) => {
  const { totalItems } = useCart();

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <img src={logo} alt="M'Martin" className="logo-image" />
          <p className="tagline">ESTOFADOS FINOS</p>
        </div>
        <nav className="nav">
          <a href="#sofas" className="nav-link">Sofás</a>
          <a href="#almofadas" className="nav-link">Almofadas</a>
          <a href="#travesseiros" className="nav-link">Travesseiros</a>
          <a href="#homecare-hospitalar" className="nav-link">Homecare</a>
          <button className="nav-cart-btn" onClick={onCartClick} aria-label="Abrir carrinho">
            <IconShoppingCart size={22} stroke={1.8} />
            {totalItems > 0 && (
              <span className="cart-badge">{totalItems}</span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;

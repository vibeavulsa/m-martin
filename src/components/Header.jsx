import React from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { IconShoppingCart, IconUser, IconSettings } from '@tabler/icons-react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import './Header.css';
import logo from '../assets/logo.png';

const Header = ({ onCartClick, onProfileClick, onSettingsClick }) => {
  const { totalItems } = useCart();
  const { isLoggedIn, profile } = useUser();

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <motion.header
      className="header"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <div className="header-container">
        <div className="logo">
          <img src={logo} alt="M'Martin" className="logo-image" />
        </div>
        <nav className="nav">
          <a href="#sofas" className="nav-link" onClick={(e) => handleNavClick(e, 'sofas')}>Sofás</a>
          <a href="#almofadas" className="nav-link" onClick={(e) => handleNavClick(e, 'almofadas')}>Almofadas</a>
          <a href="#travesseiros" className="nav-link" onClick={(e) => handleNavClick(e, 'travesseiros')}>Travesseiros</a>
          <a href="#puffs-chaise" className="nav-link" onClick={(e) => handleNavClick(e, 'puffs-chaise')}>Puffs & Chaise</a>
          <a href="#homecare-hospitalar" className="nav-link" onClick={(e) => handleNavClick(e, 'homecare-hospitalar')}>Para Acamados</a>
          <div className="nav-actions">
            <motion.button
              className={`nav-icon-btn ${isLoggedIn ? 'nav-icon-btn-active' : ''}`}
              onClick={onProfileClick}
              aria-label="Perfil do usuário"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <IconUser size={20} stroke={1.8} />
              {isLoggedIn && (
                <motion.span
                  className="user-indicator"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                  title={profile.name}
                />
              )}
            </motion.button>
            <motion.button
              className="nav-icon-btn"
              onClick={onSettingsClick}
              aria-label="Configurações"
              whileHover={{ scale: 1.1, rotate: 45 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <IconSettings size={20} stroke={1.8} />
            </motion.button>
            <motion.button
              className="nav-cart-btn"
              onClick={onCartClick}
              aria-label="Abrir carrinho"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <IconShoppingCart size={22} stroke={1.8} />
              {totalItems > 0 && (
                <motion.span
                  className="cart-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                  key={totalItems}
                >
                  {totalItems}
                </motion.span>
              )}
            </motion.button>
          </div>
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;

import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>M'Martin</h1>
          <p className="tagline">Estofados Finos</p>
        </div>
        <nav className="nav">
          <a href="#sofas" className="nav-link">Sofás</a>
          <a href="#almofadas" className="nav-link">Almofadas</a>
          <a href="#travesseiros" className="nav-link">Travesseiros</a>
          <a href="#homecare-hospitalar" className="nav-link">Homecare</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;

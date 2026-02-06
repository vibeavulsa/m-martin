import React from 'react';
import './Hero.css';
import logo from '../assets/logo.png';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <img src={logo} alt="M'Martin" className="hero-logo" />
        <p className="hero-subtitle">Estofados Finos</p>
        <p className="hero-description">
          Catálogo moderno de sofás, almofadas, travesseiros e produtos para homecare e hospitalar.
          Qualidade e conforto para seu lar e bem-estar.
        </p>
        <div className="hero-buttons">
          <a href="#sofas" className="btn-primary">Ver Catálogo</a>
          <a href="#homecare-hospitalar" className="btn-secondary">Linha Hospitalar</a>
        </div>
      </div>
      <div className="hero-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>
    </section>
  );
};

export default Hero;

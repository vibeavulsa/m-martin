import React from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import './Hero.css';
import logo from '../assets/logo.png';

const heroVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.18, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const Hero = () => {
  return (
    <section className="hero">
      <motion.div
        className="hero-content"
        variants={heroVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.img
          src={logo}
          alt="M'Martin"
          className="hero-logo"
          variants={itemVariants}
        />
        <motion.h1 className="hero-slogan" variants={itemVariants}>
          Conforto e Elegância em Cada Detalhe
        </motion.h1>
        <motion.p className="hero-description" variants={itemVariants}>
          Descubra a sofisticação dos estofados M&apos;Martin. Sofás com acabamento artesanal, 
          almofadas com fibra siliconada 500g e uma linha completa para acamados e hospitalar.
          Transforme seus ambientes com qualidade que você sente ao toque.
        </motion.p>
        <motion.div className="hero-trust-badges" variants={itemVariants}>
          <div className="trust-badge">
            <span className="trust-number">100%</span>
            <span className="trust-label">Qualidade Premium</span>
          </div>
          <div className="trust-divider" />
          <div className="trust-badge">
            <span className="trust-number">5x</span>
            <span className="trust-label">Sem Juros</span>
          </div>
          <div className="trust-divider" />
          <div className="trust-badge">
            <span className="trust-number">500g</span>
            <span className="trust-label">Fibra Siliconada</span>
          </div>
        </motion.div>
        <motion.div className="hero-buttons" variants={itemVariants}>
          <motion.a
            href="#sofas"
            className="btn-primary"
            whileHover={{ y: -3, boxShadow: '0 11px 28px rgba(0,0,0,0.38), 0 0 18px rgba(217,177,84,0.42)' }}
            whileTap={{ scale: 0.97 }}
          >
            Explorar Catálogo
          </motion.a>
          <motion.a
            href="#homecare-hospitalar"
            className="btn-secondary"
            whileHover={{ y: -3, backgroundColor: 'rgba(217,177,84,0.24)' }}
            whileTap={{ scale: 0.97 }}
          >
            Linha Hospitalar
          </motion.a>
        </motion.div>
      </motion.div>
      <div className="hero-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>
    </section>
  );
};

export default Hero;

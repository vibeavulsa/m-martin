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
        <motion.p className="hero-subtitle" variants={itemVariants}>
          Estofados Finos
        </motion.p>
        <motion.p className="hero-description" variants={itemVariants}>
          Catálogo moderno de sofás, almofadas, travesseiros e produtos para homecare e hospitalar.
          Qualidade e conforto para seu lar e bem-estar.
        </motion.p>
        <motion.div className="hero-buttons" variants={itemVariants}>
          <motion.a
            href="#sofas"
            className="btn-primary"
            whileHover={{ y: -3, boxShadow: '0 11px 28px rgba(0,0,0,0.38), 0 0 18px rgba(217,177,84,0.42)' }}
            whileTap={{ scale: 0.97 }}
          >
            Ver Catálogo
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

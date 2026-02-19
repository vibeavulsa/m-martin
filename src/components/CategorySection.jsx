import React from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { IconArmchair, IconPalette, IconMoon, IconHeartbeat, IconPaw, IconArmchair2 } from '@tabler/icons-react';
import './CategorySection.css';

const mapeadorDeIcones = {
  IconArmchair: IconArmchair,
  IconPalette: IconPalette,
  IconMoon: IconMoon,
  IconHeartbeat: IconHeartbeat,
  IconPaw: IconPaw,
  IconArmchair2: IconArmchair2
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const iconVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }
  }
};

const CategorySection = ({ category }) => {
  const ComponenteIcone = mapeadorDeIcones[category.iconName];
  
  return (
    <motion.div
      className="category-section"
      id={category.id}
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
    >
      <div className="category-header">
        <motion.span
          className="category-icon"
          variants={iconVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          whileHover={{ scale: 1.08, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {ComponenteIcone && <ComponenteIcone size={48} stroke={1.5} />}
        </motion.span>
        <div className="category-text">
          <h2 className="category-name">{category.name}</h2>
          <p className="category-description">{category.description}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default CategorySection;

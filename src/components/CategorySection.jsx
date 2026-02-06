import React from 'react';
import { IconArmchair, IconPalette, IconMoon, IconHeartbeat } from '@tabler/icons-react';
import './CategorySection.css';

const mapeadorDeIcones = {
  IconArmchair: IconArmchair,
  IconPalette: IconPalette,
  IconMoon: IconMoon,
  IconHeartbeat: IconHeartbeat
};

const CategorySection = ({ category }) => {
  const ComponenteIcone = mapeadorDeIcones[category.iconName];
  
  return (
    <div className="category-section" id={category.id}>
      <div className="category-header">
        <span className="category-icon">
          {ComponenteIcone && <ComponenteIcone size={48} stroke={1.5} />}
        </span>
        <div className="category-text">
          <h2 className="category-name">{category.name}</h2>
          <p className="category-description">{category.description}</p>
        </div>
      </div>
    </div>
  );
};

export default CategorySection;

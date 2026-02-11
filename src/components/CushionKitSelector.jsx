import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCheck } from '@tabler/icons-react';
import './CushionKitSelector.css';

const CushionKitSelector = ({ colors, onChange }) => {
  const [selectedCushion, setSelectedCushion] = useState(null);
  const [cushionColors, setCushionColors] = useState(Array(5).fill(null));

  const handleCushionClick = (index) => {
    setSelectedCushion(index);
  };

  const handleColorSelect = (color) => {
    if (selectedCushion !== null) {
      const newColors = [...cushionColors];
      newColors[selectedCushion] = color;
      setCushionColors(newColors);
      if (onChange) {
        onChange(newColors);
      }
    }
  };

  return (
    <div className="cushion-kit-selector">
      <h4 className="cushion-kit-title">Selecione as cores (toque em cada almofada)</h4>
      
      <div className="cushion-grid">
        {[0, 1, 2, 3, 4].map((index) => (
          <motion.div
            key={index}
            className={`cushion-item ${selectedCushion === index ? 'cushion-selected' : ''}`}
            onClick={() => handleCushionClick(index)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <AnimatePresence mode="wait">
              {cushionColors[index] ? (
                <motion.div
                  key="colored"
                  className="cushion-colored"
                  style={{ 
                    background: getColorGradient(cushionColors[index])
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="cushion-cover-overlay">
                    <span className="cushion-color-label">{cushionColors[index]}</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="uncovered"
                  className="cushion-uncovered"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="cushion-filling" />
                  <span className="cushion-number">{index + 1}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedCushion !== null && (
          <motion.div
            className="color-palette"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="color-palette-title">
              Escolha a cor para almofada {selectedCushion + 1}:
            </p>
            <div className="color-options">
              {colors.map((color) => (
                <motion.button
                  key={color}
                  className={`color-option ${cushionColors[selectedCushion] === color ? 'color-selected' : ''}`}
                  style={{ background: getColorGradient(color) }}
                  onClick={() => handleColorSelect(color)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title={color}
                >
                  {cushionColors[selectedCushion] === color && (
                    <motion.div
                      className="color-check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <IconCheck size={16} stroke={3} />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="cushion-summary">
        <p className="cushion-summary-text">
          {cushionColors.filter(c => c !== null).length} de 5 almofadas selecionadas
        </p>
      </div>
    </div>
  );
};

// Helper function to get color gradients
const getColorGradient = (colorName) => {
  const colorMap = {
    'Preto': 'linear-gradient(135deg, #2c2c2c 0%, #000000 100%)',
    'Branco': 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
    'Azul Marinho': 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
    'Cinza Rato': 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
    'Rosê': 'linear-gradient(135deg, #fda4af 0%, #fb7185 100%)',
    'Terracota': 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
    'Bege': 'linear-gradient(135deg, #e7d4b5 0%, #d4b896 100%)',
    'Bordô': 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)',
  };
  return colorMap[colorName] || '#999';
};

export default CushionKitSelector;

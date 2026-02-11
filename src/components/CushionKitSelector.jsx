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
    'Azul': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'Verde': 'linear-gradient(135deg, #5ecc7b 0%, #0ba360 100%)',
    'Vermelho': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'Amarelo': 'linear-gradient(135deg, #fad961 0%, #f76b1c 100%)',
    'Rosa': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'Cinza': 'linear-gradient(135deg, #a8a8a8 0%, #5a5a5a 100%)',
    'Bege': 'linear-gradient(135deg, #e0c3a3 0%, #c9a27b 100%)',
    'Preto': 'linear-gradient(135deg, #434343 0%, #000000 100%)'
  };
  return colorMap[colorName] || '#999';
};

export default CushionKitSelector;

import React, { useState } from 'react';
// motion and AnimatePresence are used in JSX, eslint doesn't detect JSX usage
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { IconCheck } from '@tabler/icons-react';
import './CushionKitSelector.css';

// Import texture images
import blackTexture from '../assets/almofadas/black.png';
import begeTexture from '../assets/almofadas/bege.png';
import azulRoyalTexture from '../assets/almofadas/azul-royal.png';
import malvaTexture from '../assets/almofadas/malve.png';
import terracotaTexture from '../assets/almofadas/terra.png';
import offWhiteTexture from '../assets/almofadas/off-white.png';
import cinzaTexture from '../assets/almofadas/cinza-rato.png';
import bordoTexture from '../assets/almofadas/bordô.png';

// Map color names to texture images
const colorTextureMap = {
  'Preto': blackTexture,
  'Branco': offWhiteTexture,
  'Azul Royal': azulRoyalTexture,
  'Cinza Rato': cinzaTexture,
  'Malva': malvaTexture,
  'Terracota': terracotaTexture,
  'Bege': begeTexture,
  'Bordô': bordoTexture,
  'Pink': 'pink-gradient', // Temporary gradient until pink.png is added
  // Keep backward compatibility with old names
  'Azul Marinho': azulRoyalTexture,
  'Rosê': malvaTexture,
};

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
                (() => {
                  const colorTexture = getColorTexture(cushionColors[index]);
                  return (
                    <motion.div
                      key="colored"
                      className="cushion-colored"
                      style={{ 
                        backgroundImage: colorTexture.startsWith('linear-gradient') 
                          ? colorTexture
                          : `url(${colorTexture})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
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
                  );
                })()
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
              {colors.map((color) => {
                const colorTexture = getColorTexture(color);
                return (
                  <motion.button
                    key={color}
                    className={`color-option ${cushionColors[selectedCushion] === color ? 'color-selected' : ''}`}
                    style={{ 
                      backgroundImage: colorTexture.startsWith('linear-gradient') 
                        ? colorTexture
                        : `url(${colorTexture})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
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
                );
              })}
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

// Helper function to get color texture images
const getColorTexture = (colorName) => {
  const texture = colorTextureMap[colorName];
  // If it's the pink gradient marker, return a gradient string
  if (texture === 'pink-gradient') {
    return 'linear-gradient(135deg, #ff69b4 0%, #ff1493 50%, #c71585 100%)';
  }
  return texture || blackTexture;
};

export default CushionKitSelector;

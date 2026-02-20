import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCheck, IconRuler, IconChevronRight, IconChevronLeft } from '@tabler/icons-react';
import './SofaConfigurator.css';

const STEPS = ['tecido', 'dimensoes'];

const fabricColors = {
  'suede': '#c8a882',
  'veludo': '#7b5ea7',
  'linho': '#d4c5a9',
  'courino': '#4a3728',
  'chenille': '#b5a08a',
  'boucle': '#e8e0d5',
  'couro-natural': '#8b6914',
  'couro-sintetico': '#3d3d3d',
  'veludo-cotelê': '#5c6bc0',
  'jacquard': '#9c7c5c',
};

const SofaConfigurator = ({ sofaModel, fabrics, onChange }) => {
  const [step, setStep] = useState(0);
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [dimensions, setDimensions] = useState({ largura: '', altura: '', profundidade: '' });

  const notifyChange = (fabric, dims) => {
    if (onChange) {
      onChange({ fabric, dimensions: dims });
    }
  };

  const handleFabricSelect = (fabric) => {
    setSelectedFabric(fabric);
    notifyChange(fabric, dimensions);
  };

  const handleDimensionChange = (field, value) => {
    const updated = { ...dimensions, [field]: value };
    setDimensions(updated);
    notifyChange(selectedFabric, updated);
  };

  const canAdvance = step === 0 ? selectedFabric !== null : true;

  return (
    <div className="sofa-configurator">
      <div className="sofa-config-header">
        <h4 className="sofa-config-title">Personalize seu {sofaModel}</h4>
        <div className="sofa-config-steps">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <button
                className={`sofa-step-dot ${i === step ? 'sofa-step-active' : ''} ${i < step ? 'sofa-step-done' : ''}`}
                onClick={() => i < step && setStep(i)}
                aria-label={s}
                disabled={i > step}
              >
                {i < step ? <IconCheck size={10} stroke={3} /> : i + 1}
              </button>
              {i < STEPS.length - 1 && (
                <div className={`sofa-step-line ${i < step ? 'sofa-step-line-done' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="fabric"
            className="sofa-step-content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <p className="sofa-step-label">
              <span className="sofa-step-number">1</span> Escolha o tecido
            </p>
            <div className="sofa-fabric-grid">
              {fabrics.map((fabric) => (
                <motion.button
                  key={fabric.id}
                  className={`sofa-fabric-btn ${selectedFabric?.id === fabric.id ? 'sofa-fabric-selected' : ''}`}
                  onClick={() => handleFabricSelect(fabric)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  title={fabric.description}
                >
                  <div
                    className="sofa-fabric-swatch"
                    style={{ background: fabricColors[fabric.id] || '#888' }}
                  >
                    {selectedFabric?.id === fabric.id && (
                      <motion.div
                        className="sofa-fabric-check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <IconCheck size={14} stroke={3} />
                      </motion.div>
                    )}
                  </div>
                  <span className="sofa-fabric-name">{fabric.name}</span>
                  <span className="sofa-fabric-desc">{fabric.description}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="dimensions"
            className="sofa-step-content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <p className="sofa-step-label">
              <span className="sofa-step-number">2</span> Informe as dimensões desejadas
            </p>
            <p className="sofa-step-hint">
              <IconRuler size={14} stroke={1.8} /> Deixe em branco para usar dimensões padrão do modelo.
            </p>
            <div className="sofa-dims-grid">
              {[
                { field: 'largura', label: 'Largura', placeholder: 'ex: 220' },
                { field: 'altura', label: 'Altura', placeholder: 'ex: 85' },
                { field: 'profundidade', label: 'Profundidade', placeholder: 'ex: 95' },
              ].map(({ field, label, placeholder }) => (
                <div key={field} className="sofa-dim-field">
                  <label className="sofa-dim-label" htmlFor={`sofa-dim-${field}`}>{label}</label>
                  <div className="sofa-dim-input-wrap">
                    <input
                      id={`sofa-dim-${field}`}
                      className="sofa-dim-input"
                      type="number"
                      min="1"
                      placeholder={placeholder}
                      value={dimensions[field]}
                      onChange={(e) => handleDimensionChange(field, e.target.value)}
                    />
                    <span className="sofa-dim-unit">cm</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="sofa-config-summary">
              <p className="sofa-summary-title">Resumo da personalização:</p>
              <div className="sofa-summary-row">
                <span className="sofa-summary-key">Modelo:</span>
                <span className="sofa-summary-val">{sofaModel}</span>
              </div>
              <div className="sofa-summary-row">
                <span className="sofa-summary-key">Tecido:</span>
                <span className="sofa-summary-val">{selectedFabric?.name}</span>
              </div>
              {(dimensions.largura || dimensions.altura || dimensions.profundidade) && (
                <div className="sofa-summary-row">
                  <span className="sofa-summary-key">Dimensões:</span>
                  <span className="sofa-summary-val">
                    {[
                      dimensions.largura && `L ${dimensions.largura}cm`,
                      dimensions.altura && `A ${dimensions.altura}cm`,
                      dimensions.profundidade && `P ${dimensions.profundidade}cm`,
                    ].filter(Boolean).join(' × ')}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sofa-config-nav">
        {step > 0 && (
          <motion.button
            className="sofa-nav-btn sofa-nav-back"
            onClick={() => setStep((s) => s - 1)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <IconChevronLeft size={16} stroke={2} />
            Voltar
          </motion.button>
        )}
        {step < STEPS.length - 1 && (
          <motion.button
            className={`sofa-nav-btn sofa-nav-next ${!canAdvance ? 'sofa-nav-disabled' : ''}`}
            onClick={() => canAdvance && setStep((s) => s + 1)}
            whileHover={canAdvance ? { scale: 1.03 } : {}}
            whileTap={canAdvance ? { scale: 0.97 } : {}}
            disabled={!canAdvance}
          >
            Próximo
            <IconChevronRight size={16} stroke={2} />
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default SofaConfigurator;

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { IconX, IconSettings, IconRefresh } from '@tabler/icons-react';
import { useUser } from '../context/UserContext';
import './SettingsDialog.css';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const dialogVariants = {
  hidden: { opacity: 0, x: 300 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  },
  exit: {
    opacity: 0,
    x: 300,
    transition: { duration: 0.2 }
  }
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } }
};

const SettingsDialog = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetSettings } = useUser();

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleToggle = (key) => {
    updateSettings({ [key]: !settings[key] });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="settings-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="settings-panel"
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="settings-header">
              <div className="settings-header-title">
                <IconSettings size={24} stroke={1.5} />
                <h2>Configurações</h2>
              </div>
              <motion.button
                className="settings-close"
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Fechar"
              >
                <IconX size={18} stroke={2} />
              </motion.button>
            </div>

            <motion.div
              className="settings-body"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div className="settings-section" variants={itemVariants}>
                <h3 className="settings-section-title">Aparência</h3>

                <div className="settings-item">
                  <div className="settings-item-info">
                    <span className="settings-item-label">Animações</span>
                    <span className="settings-item-desc">Ativar efeitos de transição e animação</span>
                  </div>
                  <motion.button
                    className={`settings-toggle ${settings.animationsEnabled ? 'active' : ''}`}
                    onClick={() => handleToggle('animationsEnabled')}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.span
                      className="toggle-knob"
                      layout
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </motion.button>
                </div>
              </motion.div>

              <motion.div className="settings-section" variants={itemVariants}>
                <h3 className="settings-section-title">Notificações</h3>

                <div className="settings-item">
                  <div className="settings-item-info">
                    <span className="settings-item-label">Notificações de pedidos</span>
                    <span className="settings-item-desc">Receber atualizações sobre pedidos realizados</span>
                  </div>
                  <motion.button
                    className={`settings-toggle ${settings.notificationsEnabled ? 'active' : ''}`}
                    onClick={() => handleToggle('notificationsEnabled')}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.span
                      className="toggle-knob"
                      layout
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </motion.button>
                </div>
              </motion.div>

              <motion.div className="settings-section" variants={itemVariants}>
                <h3 className="settings-section-title">Preferências</h3>

                <div className="settings-item">
                  <div className="settings-item-info">
                    <span className="settings-item-label">Idioma</span>
                    <span className="settings-item-desc">Idioma de exibição do catálogo</span>
                  </div>
                  <select
                    className="settings-select"
                    value={settings.language}
                    onChange={(e) => updateSettings({ language: e.target.value })}
                  >
                    <option value="pt-BR">Português (BR)</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>

                <div className="settings-item">
                  <div className="settings-item-info">
                    <span className="settings-item-label">Moeda</span>
                    <span className="settings-item-desc">Moeda de exibição dos preços</span>
                  </div>
                  <select
                    className="settings-select"
                    value={settings.currency}
                    onChange={(e) => updateSettings({ currency: e.target.value })}
                  >
                    <option value="BRL">R$ (BRL)</option>
                    <option value="USD">$ (USD)</option>
                    <option value="EUR">€ (EUR)</option>
                  </select>
                </div>
              </motion.div>

              <motion.div className="settings-footer" variants={itemVariants}>
                <motion.button
                  className="btn-reset-settings"
                  onClick={resetSettings}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <IconRefresh size={16} stroke={2} />
                  Restaurar Padrões
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsDialog;

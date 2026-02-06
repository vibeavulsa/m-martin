import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { IconX, IconCircleCheck, IconConfetti } from '@tabler/icons-react';
import './OrderConfirmationDialog.css';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', damping: 20, stiffness: 300 }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 40,
    transition: { duration: 0.2 }
  }
};

const checkVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', damping: 12, stiffness: 200, delay: 0.3 }
  }
};

const OrderConfirmationDialog = ({ isOpen, onClose, orderNumber }) => {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="confirmation-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="confirmation-dialog"
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              className="confirmation-close"
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Fechar"
            >
              <IconX size={18} stroke={2} />
            </motion.button>

            <div className="confirmation-body">
              <motion.div
                className="confirmation-check"
                variants={checkVariants}
                initial="hidden"
                animate="visible"
              >
                <IconCircleCheck size={72} stroke={1.5} />
              </motion.div>

              <motion.div
                className="confirmation-confetti"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <IconConfetti size={28} stroke={1.5} />
              </motion.div>

              <motion.h2
                className="confirmation-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Pedido Confirmado!
              </motion.h2>

              <motion.p
                className="confirmation-message"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Seu pedido foi realizado com sucesso. Em breve entraremos em contato para confirmar os detalhes.
              </motion.p>

              {orderNumber && (
                <motion.div
                  className="confirmation-order-number"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <span className="order-label">Número do Pedido</span>
                  <span className="order-value">#{orderNumber}</span>
                </motion.div>
              )}

              <motion.button
                className="confirmation-btn"
                onClick={onClose}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Continuar Comprando
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderConfirmationDialog;

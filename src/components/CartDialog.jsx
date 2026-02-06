import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { IconX, IconTrash, IconMinus, IconPlus, IconShoppingCart } from '@tabler/icons-react';
import { useCart } from '../context/CartContext';
import './CartDialog.css';

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

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

const CartDialog = ({ isOpen, onClose, onCheckout }) => {
  const { items, removeItem, updateQuantity, totalPrice, formatPrice, parsePrice } = useCart();

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
          className="cart-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="cart-panel"
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cart-header">
              <div className="cart-header-title">
                <IconShoppingCart size={24} stroke={1.5} />
                <h2>Meu Carrinho</h2>
              </div>
              <motion.button
                className="cart-close"
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Fechar"
              >
                <IconX size={18} stroke={2} />
              </motion.button>
            </div>

            <div className="cart-items">
              <AnimatePresence mode="popLayout">
                {items.length === 0 ? (
                  <motion.div
                    className="cart-empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key="empty"
                  >
                    <IconShoppingCart size={64} stroke={1} className="cart-empty-icon" />
                    <p>Seu carrinho está vazio</p>
                    <span>Adicione produtos para continuar</span>
                  </motion.div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={item.id}
                      className="cart-item"
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                    >
                      <div className="cart-item-info">
                        <h4 className="cart-item-name">{item.name}</h4>
                        <span className="cart-item-price">{item.price}</span>
                      </div>
                      <div className="cart-item-actions">
                        <div className="cart-quantity">
                          <motion.button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <IconMinus size={14} />
                          </motion.button>
                          <span className="qty-value">{item.quantity}</span>
                          <motion.button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <IconPlus size={14} />
                          </motion.button>
                        </div>
                        <span className="cart-item-subtotal">
                          {formatPrice(parsePrice(item.price) * item.quantity)}
                        </span>
                        <motion.button
                          className="cart-item-remove"
                          onClick={() => removeItem(item.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <IconTrash size={16} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {items.length > 0 && (
              <motion.div
                className="cart-footer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="cart-total">
                  <span>Total</span>
                  <span className="cart-total-value">{formatPrice(totalPrice)}</span>
                </div>
                <motion.button
                  className="cart-checkout-btn"
                  onClick={onCheckout}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Finalizar Compra
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartDialog;

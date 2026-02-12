import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { IconX, IconCheck, IconUser, IconMapPin, IconPhone, IconBrandWhatsapp } from '@tabler/icons-react';
import { useCart } from '../context/CartContext';
import './CheckoutDialog.css';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 40,
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
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
};

const WHATSAPP_NUMBER = '5500000000000';

const CheckoutDialog = ({ isOpen, onClose, onConfirm, onBack }) => {
  const { items, customer, totalPrice, formatPrice, parsePrice } = useCart();

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

  const handleWhatsAppCheckout = () => {
    if (!customer || !customer.name?.trim() || !customer.phone?.trim() || !customer.address?.trim()) {
      alert('Por favor, preencha os campos de Nome, Telefone e Endereço antes de finalizar.');
      return;
    }

    const itemLines = items.map((item) => {
      const subtotal = parsePrice(item.price) * item.quantity;
      return `• ${item.name} x${item.quantity} (${formatPrice(parsePrice(item.price))}) = ${formatPrice(subtotal)}`;
    });

    const messageParts = [
      "Olá, M'Martin! Gostaria de finalizar meu pedido:",
      '',
      '*Itens do Pedido:*',
      ...itemLines,
      '',
      `*Total: ${formatPrice(totalPrice)}*`,
      '',
      '*Dados de Entrega:*',
      `Nome: ${customer.name}`,
      `Telefone: ${customer.phone}`,
      `Endereço: ${customer.address}${customer.city ? ', ' + customer.city : ''}`,
    ];

    if (customer.notes) {
      messageParts.push(`Observações: ${customer.notes}`);
    }

    const message = encodeURIComponent(messageParts.join('\n'));
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');

    onConfirm();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="checkout-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="checkout-dialog"
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              className="checkout-close"
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Fechar"
            >
              <IconX size={18} stroke={2} />
            </motion.button>

            <motion.div
              className="checkout-body"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div className="checkout-header-section" variants={itemVariants}>
                <IconCheck size={32} stroke={1.5} className="checkout-icon" />
                <h2>Resumo do Pedido</h2>
                <p>Confira seus dados e itens antes de confirmar</p>
              </motion.div>

              {customer && (
                <motion.div className="checkout-customer" variants={itemVariants}>
                  <h3>Dados do Cliente</h3>
                  <div className="customer-detail">
                    <IconUser size={16} />
                    <span>{customer.name}</span>
                  </div>
                  <div className="customer-detail">
                    <span className="detail-label">Email:</span>
                    <span>{customer.email}</span>
                  </div>
                  <div className="customer-detail">
                    <IconPhone size={16} />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="customer-detail">
                    <IconMapPin size={16} />
                    <span>{customer.address}, {customer.city}</span>
                  </div>
                  {customer.notes && (
                    <div className="customer-notes">
                      <span className="detail-label">Obs:</span> {customer.notes}
                    </div>
                  )}
                </motion.div>
              )}

              <motion.div className="checkout-items" variants={itemVariants}>
                <h3>Itens do Pedido</h3>
                {items.map((item) => (
                  <div key={item.id} className="checkout-item">
                    <div className="checkout-item-info">
                      <span className="checkout-item-name">{item.name}</span>
                      <span className="checkout-item-qty">x{item.quantity}</span>
                    </div>
                    <span className="checkout-item-subtotal">
                      {formatPrice(parsePrice(item.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </motion.div>

              <motion.div className="checkout-total-section" variants={itemVariants}>
                <span>Total do Pedido</span>
                <span className="checkout-total-value">{formatPrice(totalPrice)}</span>
              </motion.div>

              <motion.div className="checkout-actions" variants={itemVariants}>
                <button type="button" className="btn-back" onClick={onBack}>
                  Voltar
                </button>
                <motion.button
                  className="btn-confirm btn-whatsapp-checkout"
                  onClick={handleWhatsAppCheckout}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <IconBrandWhatsapp size={20} stroke={2} />
                  Enviar Pedido via WhatsApp
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CheckoutDialog;

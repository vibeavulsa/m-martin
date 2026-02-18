import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { IconX, IconCheck, IconUser, IconMapPin, IconPhone, IconBrandWhatsapp, IconLoader2, IconQrcode, IconCreditCard, IconWallet } from '@tabler/icons-react';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orderService';
import { generateWhatsAppLink } from '../utils/whatsappGenerator';
import { processPayment } from '../services/paymentService';
import PaymentMethodSelector from './PaymentMethodSelector';
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

const CheckoutDialog = ({ isOpen, onClose, onConfirm, onBack }) => {
  const { items, customer, totalPrice, totalItems, formatPrice, parsePrice } = useCart();
  const [loading, setLoading] = useState(false);
  const [stockError, setStockError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('whatsapp_checkout');
  const [pixCode, setPixCode] = useState(null);

  useEffect(() => {
    setPixCode(null);
  }, [paymentMethod]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
      setStockError(null);
      setPixCode(null);
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, loading]);

  const buildOrderData = () => {
    const orderItems = items.map((item) => {
      const unitPrice = parsePrice(item.price);
      return {
        productId: item.id,
        name: item.name,
        price: unitPrice,
        quantity: item.quantity,
        imageUrl: item.image || item.imageUrl || '',
        subtotal: unitPrice * item.quantity,
      };
    });

    return {
      customer: {
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone,
        address: customer.address,
        city: customer.city || '',
        notes: customer.notes || '',
      },
      items: orderItems,
      totalItems,
      totalPrice,
      status: 'pending',
      paymentMethod,
    };
  };

  const handleWhatsAppCheckout = async (orderData) => {
    const orderId = await createOrder(orderData);
    const whatsappUrl = generateWhatsAppLink(
      { ...orderData, createdAt: new Date() },
      orderId
    );
    window.open(whatsappUrl, '_blank');
    onConfirm(orderId);
  };

  const handleGatewayCheckout = async (orderData) => {
    const orderId = await createOrder(orderData);
    const amountCents = Math.round(totalPrice * 100);

    const result = await processPayment({
      orderId,
      paymentMethod,
      amountCents,
      customer: {
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone,
      },
    });

    if (!result.success) {
      throw new Error(result.error || 'Falha no pagamento.');
    }

    if (result.pixCode) {
      setPixCode(result.pixCode);
    }

    if (result.redirectUrl) {
      window.open(result.redirectUrl, '_blank');
    }

    onConfirm(orderId);
  };

  const handleConfirmCheckout = async () => {
    if (!customer || !customer.name?.trim() || !customer.phone?.trim() || !customer.address?.trim()) {
      alert('Por favor, preencha os campos de Nome, Telefone e Endereço antes de finalizar.');
      return;
    }

    setLoading(true);
    setStockError(null);

    try {
      const orderData = buildOrderData();

      if (paymentMethod === 'whatsapp_checkout') {
        await handleWhatsAppCheckout(orderData);
      } else {
        await handleGatewayCheckout(orderData);
      }
    } catch (error) {
      console.error('[CheckoutDialog] Falha no checkout:', error);
      if (error instanceof Error && error.message.includes('Estoque insuficiente')) {
        setStockError(error.message);
      } else {
        alert(error instanceof Error ? error.message : 'Erro ao registrar o pedido. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmButtonLabel = () => {
    if (loading) return null;
    switch (paymentMethod) {
      case 'pix':
        return (
          <>
            <IconQrcode size={20} stroke={2} />
            Pagar com PIX
          </>
        );
      case 'credit_card':
        return (
          <>
            <IconCreditCard size={20} stroke={2} />
            Pagar com Cartão
          </>
        );
      case 'mercado_pago':
        return (
          <>
            <IconWallet size={20} stroke={2} />
            Pagar com Mercado Pago
          </>
        );
      default:
        return (
          <>
            <IconBrandWhatsapp size={20} stroke={2} />
            Finalizar Pedido
          </>
        );
    }
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
              <motion.div className="checkout-steps" variants={itemVariants}>
                <div className="checkout-step completed">
                  <span className="step-number"><IconCheck size={14} stroke={2.5} /></span>
                  <span className="step-label">Carrinho</span>
                </div>
                <div className="step-connector completed" />
                <div className="checkout-step completed">
                  <span className="step-number"><IconCheck size={14} stroke={2.5} /></span>
                  <span className="step-label">Dados</span>
                </div>
                <div className="step-connector active" />
                <div className="checkout-step active">
                  <span className="step-number">3</span>
                  <span className="step-label">Pagamento</span>
                </div>
              </motion.div>

              <motion.div className="checkout-header-section" variants={itemVariants}>
                <h2>Resumo do Pedido</h2>
                <p>Confira seus dados e itens antes de confirmar</p>
              </motion.div>

              {stockError && (
                <motion.div 
                  className="checkout-stock-error" 
                  variants={itemVariants}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <strong>⚠️ Atenção:</strong> {stockError}
                </motion.div>
              )}

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

              <motion.div variants={itemVariants}>
                <PaymentMethodSelector
                  selected={paymentMethod}
                  onChange={setPaymentMethod}
                />
              </motion.div>

              {pixCode && (
                <motion.div className="checkout-pix-section" variants={itemVariants}>
                  <h3>Código PIX</h3>
                  <p className="pix-instructions">Copie o código abaixo e cole no app do seu banco:</p>
                  <div className="pix-code-box">
                    <code>{pixCode}</code>
                  </div>
                </motion.div>
              )}

              <motion.div className="checkout-actions" variants={itemVariants}>
                <button type="button" className="btn-back" onClick={onBack} disabled={loading}>
                  Voltar
                </button>
                <motion.button
                  className={`btn-confirm${paymentMethod === 'whatsapp_checkout' ? ' btn-whatsapp-checkout' : ''}`}
                  onClick={handleConfirmCheckout}
                  whileHover={loading ? {} : { scale: 1.03 }}
                  whileTap={loading ? {} : { scale: 0.97 }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <IconLoader2 size={20} stroke={2} className="spin-icon" />
                      Processando...
                    </>
                  ) : (
                    confirmButtonLabel()
                  )}
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

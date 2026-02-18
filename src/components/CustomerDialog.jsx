import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { IconX, IconUser, IconCheck, IconShoppingCart } from '@tabler/icons-react';
import { useCart } from '../context/CartContext';
import './CustomerDialog.css';

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

const defaultForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  notes: ''
};

const CustomerDialog = ({ isOpen, onClose, onSubmit }) => {
  const { customer } = useCart();
  const [form, setForm] = useState(() => customer || defaultForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm(customer || defaultForm); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [isOpen, customer]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!form.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'E-mail inválido';
    }
    if (!form.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }
    if (!form.address.trim()) newErrors.address = 'Endereço é obrigatório';
    if (!form.city.trim()) newErrors.city = 'Cidade é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(form);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="customer-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="customer-dialog"
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              className="customer-close"
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Fechar"
            >
              <IconX size={18} stroke={2} />
            </motion.button>

            <motion.div
              className="customer-body"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div className="checkout-steps" variants={itemVariants}>
                <div className="checkout-step completed">
                  <span className="step-number"><IconCheck size={14} stroke={2.5} /></span>
                  <span className="step-label">Carrinho</span>
                </div>
                <div className="step-connector active" />
                <div className="checkout-step active">
                  <span className="step-number">2</span>
                  <span className="step-label">Dados</span>
                </div>
                <div className="step-connector" />
                <div className="checkout-step">
                  <span className="step-number">3</span>
                  <span className="step-label">Pagamento</span>
                </div>
              </motion.div>

              <motion.div className="customer-header-section" variants={itemVariants}>
                <h2>Seus Dados</h2>
                <p>Preencha seus dados para finalizar a compra</p>
              </motion.div>

              <form onSubmit={handleSubmit} className="customer-form">
                <motion.div className="form-group" variants={itemVariants}>
                  <label htmlFor="customer-name">Nome completo *</label>
                  <input
                    id="customer-name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    className={errors.name ? 'input-error' : ''}
                  />
                  {errors.name && <span className="error-msg">{errors.name}</span>}
                </motion.div>

                <motion.div className="form-row" variants={itemVariants}>
                  <div className="form-group">
                    <label htmlFor="customer-email">E-mail *</label>
                    <input
                      id="customer-email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      className={errors.email ? 'input-error' : ''}
                    />
                    {errors.email && <span className="error-msg">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="customer-phone">Telefone *</label>
                    <input
                      id="customer-phone"
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="(00) 00000-0000"
                      className={errors.phone ? 'input-error' : ''}
                    />
                    {errors.phone && <span className="error-msg">{errors.phone}</span>}
                  </div>
                </motion.div>

                <motion.div className="form-row" variants={itemVariants}>
                  <div className="form-group">
                    <label htmlFor="customer-address">Endereço *</label>
                    <input
                      id="customer-address"
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Rua, número, complemento"
                      className={errors.address ? 'input-error' : ''}
                    />
                    {errors.address && <span className="error-msg">{errors.address}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="customer-city">Cidade *</label>
                    <input
                      id="customer-city"
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Sua cidade"
                      className={errors.city ? 'input-error' : ''}
                    />
                    {errors.city && <span className="error-msg">{errors.city}</span>}
                  </div>
                </motion.div>

                <motion.div className="form-group" variants={itemVariants}>
                  <label htmlFor="customer-notes">Observações</label>
                  <textarea
                    id="customer-notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Alguma observação sobre o pedido?"
                    rows={3}
                  />
                </motion.div>

                <motion.div className="customer-form-actions" variants={itemVariants}>
                  <button type="button" className="btn-cancel" onClick={onClose}>
                    Voltar
                  </button>
                  <motion.button
                    type="submit"
                    className="btn-submit"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Ir para Pagamento
                  </motion.button>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomerDialog;

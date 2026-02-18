import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { IconBrandWhatsapp, IconQrcode, IconCreditCard, IconWallet } from '@tabler/icons-react';
import './PaymentMethodSelector.css';

const methods = [
  {
    id: 'whatsapp_checkout',
    label: 'WhatsApp',
    description: 'Finalize pelo WhatsApp',
    Icon: IconBrandWhatsapp,
  },
  {
    id: 'mercado_pago',
    label: 'Mercado Pago',
    description: 'Pague com Mercado Pago',
    Icon: IconWallet,
  },
  {
    id: 'pix',
    label: 'PIX',
    description: 'Pagamento instantâneo',
    Icon: IconQrcode,
  },
  {
    id: 'credit_card',
    label: 'Cartão de Crédito',
    description: 'Pague com cartão',
    Icon: IconCreditCard,
  },
];

const PaymentMethodSelector = ({ selected, onChange }) => {
  return (
    <div className="payment-methods">
      <h3>Forma de Pagamento</h3>
      <div className="payment-methods-grid">
        {methods.map((method) => (
          <motion.button
            key={method.id}
            type="button"
            className={`payment-method-option${selected === method.id ? ' selected' : ''}`}
            onClick={() => onChange(method.id)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <method.Icon size={24} stroke={1.5} />
            <span className="payment-method-label">{method.label}</span>
            <span className="payment-method-desc">{method.description}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;

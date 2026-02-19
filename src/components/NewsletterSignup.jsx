import { useState } from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { IconMail, IconBell, IconTag, IconCheck } from '@tabler/icons-react';
import './NewsletterSignup.css';

function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real implementation, this would send to a backend/email service
    // TODO: Integrate with email service API (e.g., Mailchimp, SendGrid)
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setName('');
      setSubscribed(false);
    }, 3000);
  };

  if (subscribed) {
    return (
      <motion.section
        className="newsletter-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="newsletter-container">
          <motion.div
            className="newsletter-success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <IconCheck size={48} className="success-icon" />
            <h3>Inscrição Realizada com Sucesso!</h3>
            <p>Você receberá nossas ofertas exclusivas em breve.</p>
          </motion.div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="newsletter-section"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
    >
      <div className="newsletter-container">
        <div className="newsletter-content">
          <div className="newsletter-info">
            <h2 className="newsletter-title">
              Fique por Dentro das Novidades
            </h2>
            <p className="newsletter-description">
              Cadastre-se e receba ofertas exclusivas, lançamentos e dicas de decoração direto no seu e-mail
            </p>

            <div className="newsletter-benefits">
              <div className="newsletter-benefit">
                <IconBell size={20} className="benefit-icon-small" />
                <span>Lançamentos em primeira mão</span>
              </div>
              <div className="newsletter-benefit">
                <IconTag size={20} className="benefit-icon-small" />
                <span>Descontos exclusivos</span>
              </div>
              <div className="newsletter-benefit">
                <IconMail size={20} className="benefit-icon-small" />
                <span>Dicas de decoração</span>
              </div>
            </div>
          </div>

          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="newsletter-input"
            />
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="newsletter-input"
            />
            <motion.button
              type="submit"
              className="newsletter-button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Quero Receber Ofertas
            </motion.button>
            <p className="newsletter-privacy">
              Não enviamos spam. Você pode cancelar a qualquer momento.
            </p>
          </form>
        </div>
      </div>
    </motion.section>
  );
}

export default NewsletterSignup;

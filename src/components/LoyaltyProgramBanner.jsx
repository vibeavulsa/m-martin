import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { IconGift, IconStar, IconTrophy, IconCrown } from '@tabler/icons-react';
import './LoyaltyProgramBanner.css';

function LoyaltyProgramBanner() {
  const benefits = [
    {
      icon: IconGift,
      title: 'Bônus de Boas-Vindas',
      description: '10% de desconto na primeira compra'
    },
    {
      icon: IconStar,
      title: 'Pontos em Compras',
      description: 'Acumule 1 ponto a cada R$ 10 gastos'
    },
    {
      icon: IconTrophy,
      title: 'Descontos Exclusivos',
      description: 'Ofertas especiais para membros'
    },
    {
      icon: IconCrown,
      title: 'Atendimento VIP',
      description: 'Prioridade em entregas e suporte'
    }
  ];

  return (
    <motion.section
      className="loyalty-banner"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="loyalty-content">
        <div className="loyalty-left-frame">
          <div className="loyalty-header">
            <h2 className="loyalty-title">
              <IconCrown size={32} className="loyalty-crown" />
              Programa de Fidelidade M'Martin
            </h2>
            <p className="loyalty-subtitle">
              Cadastre-se e aproveite benefícios exclusivos em todas as suas compras
            </p>
          </div>

          <motion.button
            className="loyalty-cta-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // TODO: Implement loyalty program registration
              // Could open a modal or navigate to registration page
              alert('Funcionalidade de cadastro será implementada em breve. Entre em contato pelo WhatsApp para se cadastrar no programa de fidelidade!');
            }}
          >
            Cadastre-se Gratuitamente
          </motion.button>
        </div>

        <div className="loyalty-right-frame">
          <div className="loyalty-benefits">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="benefit-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <benefit.icon size={28} className="benefit-icon" />
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default LoyaltyProgramBanner;

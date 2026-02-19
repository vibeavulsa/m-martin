import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { IconStarFilled, IconQuote } from '@tabler/icons-react';
import './TestimonialsSection.css';

function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Maria Silva',
      location: 'São Paulo, SP',
      rating: 5,
      text: 'Comprei um sofá retrátil e estou encantada! O conforto é excepcional e a qualidade do acabamento é impecável. Além disso, o atendimento foi super atencioso.',
      product: 'Sofá Retrátil Confort'
    },
    {
      name: 'João Santos',
      location: 'Rio de Janeiro, RJ',
      rating: 5,
      text: 'Os travesseiros viscoelásticos mudaram minha qualidade de sono. Acabaram as dores no pescoço! Recomendo de olhos fechados.',
      product: 'Travesseiro Viscoelástico'
    },
    {
      name: 'Ana Oliveira',
      location: 'Belo Horizonte, MG',
      rating: 5,
      text: 'Precisava de um colchão hospitalar para minha mãe e a M\'Martin foi perfeita. Produto de alta qualidade e entrega rápida. Muito obrigada!',
      product: 'Colchão Hospitalar D45'
    },
    {
      name: 'Carlos Ferreira',
      location: 'Curitiba, PR',
      rating: 5,
      text: 'As almofadas decorativas deram um toque especial na minha sala. A fibra siliconada realmente não embola e mantém o formato. Excelente!',
      product: 'Kit Almofadas Premium'
    }
  ];

  return (
    <motion.section
      className="testimonials-section"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
    >
      <div className="testimonials-container">
        <div className="testimonials-header">
          <h2 className="testimonials-title">O Que Nossos Clientes Dizem</h2>
          <p className="testimonials-subtitle">
            Depoimentos reais de quem já experimentou a qualidade M'Martin
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="testimonial-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="testimonial-header">
                <IconQuote size={32} className="quote-icon" />
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <IconStarFilled key={i} size={16} className="star-icon" />
                  ))}
                </div>
              </div>

              <p className="testimonial-text">{testimonial.text}</p>

              <div className="testimonial-footer">
                <div className="testimonial-author">
                  <strong>{testimonial.name}</strong>
                  <span className="testimonial-location">{testimonial.location}</span>
                </div>
                <span className="testimonial-product">{testimonial.product}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default TestimonialsSection;

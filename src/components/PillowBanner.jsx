import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconCheck, IconShoppingCartPlus, IconBrandWhatsapp, IconSparkles } from '@tabler/icons-react';
import { useCart } from '../context/CartContext';
import './PillowBanner.css';

const PillowBanner = ({ product }) => {
    const { addItem } = useCart();
    const [added, setAdded] = useState(false);

    // Fallback product details if product isn't passed or we just want generic
    const pillowProduct = product || {
        id: 'travesseiro-premium',
        category: 'travesseiros',
        name: "Travesseiro Premium M'Martin",
        description: 'Noites de sono perfeitas com o suporte e a maciez ideal. Fibra siliconada que não deforma, garantindo bem-estar.',
        price: 'Sob Consulta',
        features: ['Fibra siliconada 500g', 'Não deforma', 'Maior conforto térmico', 'Alta durabilidade'],
        image: '/assets/travesseiro/travesseiro.png'
    };

    const handleAddToCart = () => {
        addItem(pillowProduct);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const handleWhatsApp = () => {
        const message = encodeURIComponent(`Olá! Tenho interesse no Travesseiro Premium M'Martin. Podem me verificar valores?`);
        window.open(`https://wa.me/?text=${message}`, '_blank');
    };

    const isSobConsulta = pillowProduct.price && pillowProduct.price.toLowerCase().includes('consulta');

    return (
        <motion.div
            className="pillow-banner"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            <div className="pillow-banner-content">
                <span className="pillow-banner-badge">
                    <IconSparkles size={12} stroke={2} /> O Sono Perfeito
                </span>
                <h2 className="pillow-banner-title">
                    Travesseiros <span>M'Martin</span><br />
                    Conforto e sustentação
                </h2>
                <p className="pillow-banner-description">
                    {pillowProduct.description}
                </p>

                <div className="pillow-banner-price">
                    {pillowProduct.installments && pillowProduct.priceInstallment ? (
                        <>{pillowProduct.installments}x de <strong>{pillowProduct.priceInstallment}</strong> <span style={{ fontSize: '0.85em', color: '#bfb3a2' }}>(total à vista {pillowProduct.priceCash || pillowProduct.price})</span></>
                    ) : (
                        <strong>{pillowProduct.price || 'Sob Consulta'}</strong>
                    )}
                </div>

                <div className="pillow-banner-features">
                    {(pillowProduct.features || []).map((feature, i) => (
                        <span key={i} className="pillow-feature-tag">
                            <IconCheck size={12} stroke={3} />
                            {feature}
                        </span>
                    ))}
                </div>

                <div className="pillow-banner-actions">
                    {!isSobConsulta ? (
                        <motion.button
                            className={`pillow-btn-add ${added ? 'added' : ''}`}
                            onClick={handleAddToCart}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            {added ? <IconCheck size={20} /> : <IconShoppingCartPlus size={20} />}
                            {added ? 'Adicionado' : 'Comprar Agora'}
                        </motion.button>
                    ) : (
                        <motion.button
                            className="pillow-btn-whatsapp"
                            onClick={handleWhatsApp}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <IconBrandWhatsapp size={20} stroke={2.5} />
                            Ver Preços e Modelos
                        </motion.button>
                    )}
                </div>
            </div>

            <div className="pillow-banner-visual">
                <div className="pillow-video-container">
                    <video
                        className="pillow-video"
                        src="/assets/travesseiro/travesseiro.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                    <div className="pillow-video-overlay">
                        <h3 className="pillow-video-text">
                            SINTA<br />A MACIEZ
                        </h3>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PillowBanner;

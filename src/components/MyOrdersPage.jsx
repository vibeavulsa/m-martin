import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { IconPackage, IconArrowLeft, IconClock, IconCheck, IconTruck, IconX as IconCancelled, IconLoader2, IconReceipt } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import { fetchMyOrders } from '../services/dbService';
import './MyOrdersPage.css';

const STATUS_CONFIG = {
    pendente: { label: 'Pendente', icon: IconClock, color: '#e6a817' },
    processando: { label: 'Processando', icon: IconLoader2, color: '#2196F3' },
    enviado: { label: 'Enviado', icon: IconTruck, color: '#9c27b0' },
    entregue: { label: 'Entregue', icon: IconCheck, color: '#4caf50' },
    cancelado: { label: 'Cancelado', icon: IconCancelled, color: '#f44336' },
};

const STATUS_STEPS = ['pendente', 'processando', 'enviado', 'entregue'];

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    }),
};

const MyOrdersPage = ({ onBack }) => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        async function loadOrders() {
            try {
                const data = await fetchMyOrders(user.uid);
                setOrders(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('[MyOrdersPage] Failed to fetch orders:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadOrders();
    }, [user?.uid]);

    const formatCurrency = (value) => {
        const num = typeof value === 'number' ? value : parseFloat(value);
        if (isNaN(num)) return 'R$ 0,00';
        return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const formatDate = (dateStr) => {
        try {
            return new Date(dateStr).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateStr;
        }
    };

    const getStepIndex = (status) => {
        const idx = STATUS_STEPS.indexOf(status);
        return idx >= 0 ? idx : 0;
    };

    if (!user) {
        return (
            <div className="my-orders-page">
                <div className="my-orders-empty">
                    <IconPackage size={64} stroke={1} />
                    <h2>Faça login para ver seus pedidos</h2>
                    <p>Entre com sua conta para acompanhar o status dos seus pedidos.</p>
                    <button className="my-orders-back-btn" onClick={onBack}>
                        <IconArrowLeft size={18} /> Voltar à Loja
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="my-orders-page">
            <motion.div
                className="my-orders-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <button className="my-orders-back-btn" onClick={onBack}>
                    <IconArrowLeft size={18} /> Voltar
                </button>
                <div className="my-orders-title">
                    <IconReceipt size={28} stroke={1.5} />
                    <h1>Meus Pedidos</h1>
                </div>
                <p className="my-orders-subtitle">Acompanhe o status e histórico dos seus pedidos</p>
            </motion.div>

            {loading && (
                <div className="my-orders-loading">
                    <IconLoader2 size={32} stroke={1.5} className="spin-icon" />
                    <p>Carregando seus pedidos...</p>
                </div>
            )}

            {error && (
                <div className="my-orders-error">
                    <p>Erro ao carregar pedidos: {error}</p>
                    <button className="my-orders-back-btn" onClick={onBack}>
                        Voltar à Loja
                    </button>
                </div>
            )}

            {!loading && !error && orders.length === 0 && (
                <motion.div
                    className="my-orders-empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <IconPackage size={64} stroke={1} />
                    <h2>Nenhum pedido ainda</h2>
                    <p>Quando você fizer seu primeiro pedido, ele aparecerá aqui.</p>
                    <button className="my-orders-back-btn" onClick={onBack}>
                        <IconArrowLeft size={18} /> Ir para a Loja
                    </button>
                </motion.div>
            )}

            {!loading && !error && orders.length > 0 && (
                <div className="my-orders-list">
                    {orders.map((order, i) => {
                        const statusConf = STATUS_CONFIG[order.status] || STATUS_CONFIG.pendente;
                        const StatusIcon = statusConf.icon;
                        const currentStep = getStepIndex(order.status);
                        const isCancelled = order.status === 'cancelado';

                        return (
                            <motion.div
                                key={order.id}
                                className="my-order-card"
                                custom={i}
                                initial="hidden"
                                animate="visible"
                                variants={cardVariants}
                                onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                            >
                                <div className="my-order-card-header">
                                    <div className="my-order-id">
                                        <span className="order-hash">#</span>
                                        <span>{order.id}</span>
                                    </div>
                                    <span
                                        className="my-order-status"
                                        style={{ '--status-color': statusConf.color }}
                                    >
                                        <StatusIcon size={14} stroke={2} />
                                        {statusConf.label}
                                    </span>
                                </div>

                                <div className="my-order-meta">
                                    <span className="my-order-date">{formatDate(order.date)}</span>
                                    <span className="my-order-total">{formatCurrency(order.total)}</span>
                                </div>

                                <div className="my-order-items-preview">
                                    {(order.items || []).slice(0, 3).map((item, idx) => (
                                        <span key={idx} className="my-order-item-pill">
                                            {item.name} x{item.quantity}
                                        </span>
                                    ))}
                                    {(order.items || []).length > 3 && (
                                        <span className="my-order-item-pill more">
                                            +{order.items.length - 3} mais
                                        </span>
                                    )}
                                </div>

                                {/* Progress tracker */}
                                {!isCancelled && (
                                    <div className="my-order-progress">
                                        {STATUS_STEPS.map((step, stepIdx) => {
                                            const conf = STATUS_CONFIG[step];
                                            const isActive = stepIdx <= currentStep;
                                            return (
                                                <div key={step} className={`progress-step ${isActive ? 'active' : ''}`}>
                                                    <div className="progress-dot" />
                                                    {stepIdx < STATUS_STEPS.length - 1 && (
                                                        <div className={`progress-line ${stepIdx < currentStep ? 'filled' : ''}`} />
                                                    )}
                                                    <span className="progress-label">{conf.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Expanded details */}
                                <AnimatePresence>
                                    {selectedOrder?.id === order.id && (
                                        <motion.div
                                            className="my-order-details"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="my-order-details-inner">
                                                <h4>Itens do Pedido</h4>
                                                <div className="my-order-items-list">
                                                    {(order.items || []).map((item, idx) => (
                                                        <div key={idx} className="my-order-detail-item">
                                                            <div className="detail-item-info">
                                                                <span className="detail-item-name">{item.name}</span>
                                                                <span className="detail-item-qty">x{item.quantity}</span>
                                                            </div>
                                                            <span className="detail-item-price">
                                                                {formatCurrency(item.subtotal || item.price * item.quantity)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="my-order-detail-total">
                                                    <span>Total</span>
                                                    <span>{formatCurrency(order.total)}</span>
                                                </div>

                                                {order.paymentMethod && (
                                                    <div className="my-order-detail-meta">
                                                        <span>Pagamento:</span>
                                                        <span>{order.paymentMethod.replace('_', ' ')}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyOrdersPage;

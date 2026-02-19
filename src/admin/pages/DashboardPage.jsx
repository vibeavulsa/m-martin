import {
  IconPackage,
  IconBoxSeam,
  IconReceipt,
  IconAlertTriangle,
  IconCurrencyReal,
  IconPackageOff,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useAdmin } from '../context/AdminContext';
import '../Admin.css';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  }),
};

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } },
};

const DashboardPage = () => {
  const { products, stock, orders, getLowStockProducts, getOutOfStockProducts, getTotalStockValue } = useAdmin();

  const totalProducts = products.length;
  const totalStock = Object.values(stock).reduce((sum, s) => sum + s.quantity, 0);
  const lowStockProducts = getLowStockProducts();
  const outOfStockProducts = getOutOfStockProducts();
  const totalStockValue = getTotalStockValue();

  const formatCurrency = (value) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const kpis = [
    { icon: <IconPackage size={24} stroke={1.6} />, className: 'gold', label: 'Produtos', value: totalProducts },
    { icon: <IconBoxSeam size={24} stroke={1.6} />, className: 'green', label: 'Itens em Estoque', value: totalStock },
    { icon: <IconReceipt size={24} stroke={1.6} />, className: 'blue', label: 'Pedidos', value: orders.length },
    { icon: <IconCurrencyReal size={24} stroke={1.6} />, className: 'red', label: 'Valor em Estoque', value: formatCurrency(totalStockValue) },
    { icon: <IconAlertTriangle size={24} stroke={1.6} />, style: { background: 'rgba(255, 152, 0, 0.15)', color: '#ff9800' }, label: 'Estoque Baixo', value: lowStockProducts.length },
    { icon: <IconPackageOff size={24} stroke={1.6} />, style: { background: 'rgba(244, 67, 54, 0.15)', color: '#f44336' }, label: 'Sem Estoque', value: outOfStockProducts.length },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p>Visão geral do sistema M&apos;Martin Estofados</p>
      </div>

      <div className="dashboard-kpis">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} className="kpi-card" custom={i} initial="hidden" animate="visible" variants={cardVariants}>
            <div className={`kpi-icon${kpi.className ? ` ${kpi.className}` : ''}`} style={kpi.style}>
              {kpi.icon}
            </div>
            <div className="kpi-info">
              <h3>{kpi.label}</h3>
              <div className="kpi-value">{kpi.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="dashboard-sections">
        <motion.div className="dashboard-section" initial="hidden" animate="visible" variants={sectionVariants} transition={{ delay: 0.35 }}>
          <h2>
            <IconAlertTriangle size={18} stroke={1.6} style={{ verticalAlign: 'middle', marginRight: '0.4rem', color: '#f44336' }} />
            Estoque Baixo
          </h2>
          {lowStockProducts.length === 0 ? (
            <p className="empty-state">Todos os produtos estão com estoque adequado.</p>
          ) : (
            lowStockProducts.map((p, i) => (
              <motion.div key={p.id} className="low-stock-item" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }}>
                <span className="item-name">{p.name}</span>
                <span className="item-qty">{stock[p.id]?.quantity ?? 0} un.</span>
              </motion.div>
            ))
          )}
        </motion.div>

        <motion.div className="dashboard-section" initial="hidden" animate="visible" variants={sectionVariants} transition={{ delay: 0.45 }}>
          <h2>
            <IconReceipt size={18} stroke={1.6} style={{ verticalAlign: 'middle', marginRight: '0.4rem', color: '#2196f3' }} />
            Pedidos Recentes
          </h2>
          {orders.length === 0 ? (
            <p className="empty-state">Nenhum pedido registrado ainda.</p>
          ) : (
            orders.slice(0, 5).map((o, i) => (
              <motion.div key={o.id} className="recent-order-item" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }}>
                <div>
                  <span className="order-id">#{o.id}</span>
                  <span className="order-date"> — {new Date(o.date).toLocaleDateString('pt-BR')}</span>
                </div>
                <span className={`order-status ${o.status}`}>{o.status}</span>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;

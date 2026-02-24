import {
  IconPackage,
  IconBoxSeam,
  IconReceipt,
  IconAlertTriangle,
  IconCurrencyReal,
  IconPackageOff,
  IconTrendingUp,
  IconClock,
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../context/AdminContext';
import '../Admin.css';

const kpiVariants = {
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

const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.15 + i * 0.03, duration: 0.35, ease: [0.4, 0, 0.2, 1] },
  }),
  exit: { opacity: 0, x: 12, transition: { duration: 0.2 } },
};

const DashboardPage = () => {
  const { products, stock, orders, getLowStockProducts, getOutOfStockProducts, getTotalStockValue, dbError } = useAdmin();

  const totalProducts = products.length;
  const totalStock = Object.values(stock).reduce((sum, s) => sum + s.quantity, 0);
  const lowStockProducts = getLowStockProducts();
  const outOfStockProducts = getOutOfStockProducts();
  const totalStockValue = getTotalStockValue();
  const outOfStockTotal = outOfStockProducts.length; // Assuming this is what 'outOfStockTotal' refers to

  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pendente').length;
  const avgTicket = orders.length > 0 ? totalRevenue / orders.length : 0;

  const formatCurrency = (value) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const kpis = [
    { icon: <IconTrendingUp size={24} stroke={1.6} />, className: 'green', label: 'Faturamento Total', value: formatCurrency(totalRevenue) },
    { icon: <IconReceipt size={24} stroke={1.6} />, className: 'blue', label: 'Pedidos Realizados', value: orders.length },
    { icon: <IconClock size={24} stroke={1.6} />, style: { background: 'rgba(255, 152, 0, 0.15)', color: '#ff9800' }, label: 'Pedidos Pendentes', value: pendingOrders },
    { icon: <IconCurrencyReal size={24} stroke={1.6} />, className: 'gold', label: 'Ticket Médio', value: formatCurrency(avgTicket) },
    { icon: <IconBoxSeam size={24} stroke={1.6} />, style: { background: 'rgba(156, 39, 176, 0.15)', color: '#9c27b0' }, label: 'Itens em Estoque', value: totalStock },
    { icon: <IconAlertTriangle size={24} stroke={1.6} />, className: 'red', label: 'Sem Estoque', value: outOfStockTotal },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="admin-page-header">
        <h1>Dashboard Corporativo</h1>
        <p>Visão geral da evolução de vendas, M'Martin Estofados</p>
      </div>

      <AnimatePresence>
        {dbError && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <IconAlertTriangle size={24} stroke={2} />
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 600 }}>Erro de Conexão com o Servidor Neon Postgres</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
                O sistema não conectou ao banco de dados e está usando o armazenamento local do navegador para evitar perda de dados.
                As alterações realizadas <strong>não estão indo para o banco de dados online</strong>.<br />
                <em>Sinal de erro: {dbError}</em>. Verifique a chave DATABASE_URL / POSTGRES_URL.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="dashboard-kpis">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} className="kpi-card" custom={i} initial="hidden" animate="visible" variants={kpiVariants}>
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
        <motion.div className="dashboard-section" initial="hidden" animate="visible" variants={sectionVariants} transition={{ delay: 0.45 }}>
          <h2>
            <IconReceipt size={18} stroke={1.6} style={{ verticalAlign: 'middle', marginRight: '0.4rem', color: '#2196f3' }} />
            Pedidos Recentes
          </h2>
          {orders.length === 0 ? (
            <p className="empty-state">Nenhum pedido registrado ainda.</p>
          ) : (
            orders.slice(0, 6).map((o, i) => (
              <motion.div key={o.id} className="recent-order-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div>
                    <span className="order-id">#{o.id}</span>
                    <span className="order-date" style={{ marginLeft: 8, color: '#888', fontSize: '0.85rem' }}>{new Date(o.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <span style={{ fontSize: '0.9rem', color: '#555', marginTop: '4px' }}>{o.customer?.name || 'Cliente Não Identificado'}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <span style={{ fontWeight: 'bold', color: '#333' }}>{formatCurrency(o.total || 0)}</span>
                  <span className={`order-status ${o.status}`}>{o.status}</span>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        <motion.div className="dashboard-section" initial="hidden" animate="visible" variants={sectionVariants} transition={{ delay: 0.35 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>
              <IconAlertTriangle size={18} stroke={1.6} style={{ verticalAlign: 'middle', marginRight: '0.4rem', color: '#f44336' }} />
              Atenção no Estoque
            </h2>
            <span style={{ fontSize: '0.85rem', color: '#888' }}>
              Capital imobilizado: {formatCurrency(totalStockValue)}
            </span>
          </div>
          {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
            <p className="empty-state">Todos os produtos estão com estoque adequado.</p>
          ) : (
            <>
              {outOfStockProducts.map((p, i) => (
                <motion.div key={`out-${p.id}`} className="low-stock-item" style={{ background: 'rgba(244, 67, 54, 0.05)', borderLeft: '3px solid #f44336' }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }}>
                  <span className="item-name" style={{ color: '#d32f2f', fontWeight: 500 }}>{p.name} (Esgotado)</span>
                  <span className="item-qty" style={{ color: '#d32f2f' }}>0 un.</span>
                </motion.div>
              ))}
              {lowStockProducts.map((p, i) => (
                <motion.div key={`low-${p.id}`} className="low-stock-item" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }}>
                  <span className="item-name">{p.name}</span>
                  <span className="item-qty" style={{ color: '#ff9800', fontWeight: 500 }}>{stock[p.id]?.quantity ?? 0} un.</span>
                </motion.div>
              ))}
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;

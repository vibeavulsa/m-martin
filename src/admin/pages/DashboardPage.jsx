import {
  IconPackage,
  IconBoxSeam,
  IconReceipt,
  IconAlertTriangle,
  IconCurrencyReal,
} from '@tabler/icons-react';
import { useAdmin } from '../context/AdminContext';
import '../Admin.css';

const DashboardPage = () => {
  const { products, stock, orders, getLowStockProducts, getTotalStockValue } = useAdmin();

  const totalProducts = products.length;
  const totalStock = Object.values(stock).reduce((sum, s) => sum + s.quantity, 0);
  const lowStockProducts = getLowStockProducts();
  const totalStockValue = getTotalStockValue();

  const formatCurrency = (value) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <>
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p>Visão geral do sistema M&apos;Martin Estofados</p>
      </div>

      <div className="dashboard-kpis">
        <div className="kpi-card">
          <div className="kpi-icon gold">
            <IconPackage size={24} stroke={1.6} />
          </div>
          <div className="kpi-info">
            <h3>Produtos</h3>
            <div className="kpi-value">{totalProducts}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon green">
            <IconBoxSeam size={24} stroke={1.6} />
          </div>
          <div className="kpi-info">
            <h3>Itens em Estoque</h3>
            <div className="kpi-value">{totalStock}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon blue">
            <IconReceipt size={24} stroke={1.6} />
          </div>
          <div className="kpi-info">
            <h3>Pedidos</h3>
            <div className="kpi-value">{orders.length}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon red">
            <IconCurrencyReal size={24} stroke={1.6} />
          </div>
          <div className="kpi-info">
            <h3>Valor em Estoque</h3>
            <div className="kpi-value">{formatCurrency(totalStockValue)}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h2>
            <IconAlertTriangle size={18} stroke={1.6} style={{ verticalAlign: 'middle', marginRight: '0.4rem', color: '#f44336' }} />
            Estoque Baixo
          </h2>
          {lowStockProducts.length === 0 ? (
            <p className="empty-state">Todos os produtos estão com estoque adequado.</p>
          ) : (
            lowStockProducts.map((p) => (
              <div key={p.id} className="low-stock-item">
                <span className="item-name">{p.name}</span>
                <span className="item-qty">{stock[p.id]?.quantity ?? 0} un.</span>
              </div>
            ))
          )}
        </div>

        <div className="dashboard-section">
          <h2>
            <IconReceipt size={18} stroke={1.6} style={{ verticalAlign: 'middle', marginRight: '0.4rem', color: '#2196f3' }} />
            Pedidos Recentes
          </h2>
          {orders.length === 0 ? (
            <p className="empty-state">Nenhum pedido registrado ainda.</p>
          ) : (
            orders.slice(0, 5).map((o) => (
              <div key={o.id} className="recent-order-item">
                <div>
                  <span className="order-id">#{o.id}</span>
                  <span className="order-date"> — {new Date(o.date).toLocaleDateString('pt-BR')}</span>
                </div>
                <span className={`order-status ${o.status}`}>{o.status}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardPage;

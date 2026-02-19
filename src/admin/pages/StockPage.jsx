import { useState, useMemo } from 'react';
import {
  IconMinus,
  IconPlus,
  IconSearch,
  IconAlertTriangle,
  IconBoxSeam,
  IconPackageOff,
  IconCurrencyReal,
  IconCheck,
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

const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.15 + i * 0.03, duration: 0.35, ease: [0.4, 0, 0.2, 1] },
  }),
  exit: { opacity: 0, x: 12, transition: { duration: 0.2 } },
};

const StockPage = () => {
  const { products, categories, stock, updateStock, updateMinStock, cushionKit, getLowStockProducts, getOutOfStockProducts, getTotalStockValue } = useAdmin();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const allProducts = useMemo(() => {
    const list = [...products];
    const hasCushionKit = products.some(p => p.id === 'cushion-kit' || (p.isKit && p.category === 'almofadas'));
    if (!hasCushionKit && cushionKit?.product) {
      list.push({ ...cushionKit.product, id: cushionKit.product.id || 'cushion-kit' });
    }
    return list;
  }, [products, cushionKit]);

  const totalStock = useMemo(() => Object.values(stock).reduce((sum, s) => sum + s.quantity, 0), [stock]);
  const lowStockCount = getLowStockProducts().length;
  const outOfStockCount = getOutOfStockProducts().length;
  const totalValue = getTotalStockValue();

  const filtered = useMemo(() => {
    let list = allProducts;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (filterCategory !== 'all') {
      list = list.filter((p) => p.category === filterCategory);
    }
    if (filterStatus === 'low') {
      list = list.filter((p) => {
        const s = stock[p.id];
        return s && s.quantity > 0 && s.quantity <= s.minStock;
      });
    } else if (filterStatus === 'ok') {
      list = list.filter((p) => {
        const s = stock[p.id];
        return s && s.quantity > s.minStock;
      });
    } else if (filterStatus === 'out') {
      list = list.filter((p) => {
        const s = stock[p.id];
        return !s || s.quantity <= 0;
      });
    }
    return list;
  }, [allProducts, search, filterCategory, filterStatus, stock]);

  const formatCurrency = (value) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const getCategoryName = (id) => {
    const cat = categories.find((c) => c.id === id);
    return cat ? cat.name : id;
  };

  const getStockClass = (productId) => {
    const s = stock[productId];
    if (!s) return '';
    if (s.quantity <= 0) return 'stock-low';
    if (s.quantity <= s.minStock) return 'stock-warning';
    return 'stock-ok';
  };

  const getStockFillClass = (productId) => {
    const s = stock[productId];
    if (!s) return 'stock-fill-low';
    if (s.quantity <= 0) return 'stock-fill-low';
    if (s.quantity <= s.minStock) return 'stock-fill-warning';
    return 'stock-fill-ok';
  };

  const getStockPercent = (productId) => {
    const s = stock[productId];
    if (!s || s.minStock <= 0) return 0;
    const maxRef = s.minStock * 3;
    return Math.min(100, Math.round((s.quantity / maxRef) * 100));
  };

  const kpis = [
    { icon: <IconBoxSeam size={24} stroke={1.6} />, className: 'green', label: 'Total em Estoque', value: totalStock },
    { icon: <IconAlertTriangle size={24} stroke={1.6} />, style: { background: 'rgba(255, 152, 0, 0.15)', color: '#ff9800' }, label: 'Estoque Baixo', value: lowStockCount },
    { icon: <IconPackageOff size={24} stroke={1.6} />, className: 'red', label: 'Sem Estoque', value: outOfStockCount },
    { icon: <IconCurrencyReal size={24} stroke={1.6} />, className: 'gold', label: 'Valor Total', value: formatCurrency(totalValue) },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="admin-page-header">
        <h1>Gerenciamento de Estoque</h1>
        <p>Controle de estoque e alertas de reposição</p>
      </div>

      <div className="dashboard-kpis" style={{ marginBottom: '1.5rem' }}>
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

      <motion.div className="admin-toolbar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.35 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <IconSearch size={16} stroke={1.8} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#bfb3a2' }} />
          <input
            className="admin-search"
            style={{ paddingLeft: '2.2rem' }}
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="admin-search"
          style={{ maxWidth: 180 }}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">Todas Categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          className="admin-search"
          style={{ maxWidth: 180 }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Todos Status</option>
          <option value="low">Estoque Baixo</option>
          <option value="out">Sem Estoque</option>
          <option value="ok">Estoque OK</option>
        </select>
      </motion.div>

      <motion.div className="admin-table-wrapper" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Quantidade</th>
              <th>Nível</th>
              <th>Mín.</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <AnimatePresence mode="popLayout">
            <tbody>
              {filtered.map((p, i) => {
                const s = stock[p.id] || { quantity: 0, minStock: 5 };
                return (
                  <motion.tr key={p.id} custom={i} initial="hidden" animate="visible" exit="exit" variants={rowVariants} layout>
                    <td data-label="Produto">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="product-thumb" />
                        ) : (
                          <div className="product-thumb" style={{ background: 'rgba(217,177,84,0.1)' }} />
                        )}
                        <span>{p.name}</span>
                      </div>
                    </td>
                    <td data-label="Categoria"><span className="category-badge">{getCategoryName(p.category)}</span></td>
                    <td data-label="Quantidade">
                      <div className="stock-controls">
                        <button onClick={() => updateStock(p.id, s.quantity - 1)} aria-label="Diminuir quantidade em estoque">
                          <IconMinus size={14} stroke={2} />
                        </button>
                        <span className={`stock-value ${getStockClass(p.id)}`}>{s.quantity}</span>
                        <button onClick={() => updateStock(p.id, s.quantity + 1)} aria-label="Aumentar quantidade em estoque">
                          <IconPlus size={14} stroke={2} />
                        </button>
                      </div>
                    </td>
                    <td data-label="Nível">
                      <div className="stock-progress-wrapper">
                        <div className="stock-progress-bar">
                          <div
                            className={`stock-progress-fill ${getStockFillClass(p.id)}`}
                            style={{ width: `${getStockPercent(p.id)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td data-label="Mínimo">
                      <div className="stock-controls">
                        <button onClick={() => updateMinStock(p.id, s.minStock - 1)} aria-label="Diminuir estoque mínimo">
                          <IconMinus size={14} stroke={2} />
                        </button>
                        <span className="stock-value">{s.minStock}</span>
                        <button onClick={() => updateMinStock(p.id, s.minStock + 1)} aria-label="Aumentar estoque mínimo">
                          <IconPlus size={14} stroke={2} />
                        </button>
                      </div>
                    </td>
                    <td data-label="Status">
                      {s.quantity <= 0 ? (
                        <span className="stock-status-badge badge-out">
                          <IconPackageOff size={14} stroke={2} />
                          Sem Estoque
                        </span>
                      ) : s.quantity <= s.minStock ? (
                        <span className="stock-status-badge badge-warning">
                          <IconAlertTriangle size={14} stroke={2} />
                          Baixo
                        </span>
                      ) : (
                        <span className="stock-status-badge badge-ok">
                          <IconCheck size={14} stroke={2} />
                          OK
                        </span>
                      )}
                    </td>
                    <td data-label="Definir Qtd.">
                      <input
                        type="number"
                        min="0"
                        className="stock-direct-input"
                        placeholder="Qtd"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val)) {
                              updateStock(p.id, val);
                              e.target.value = '';
                            }
                          }
                        }}
                      />
                    </td>
                  </motion.tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#bfb3a2', padding: '2rem' }}>
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </AnimatePresence>
        </table>
      </motion.div>
    </motion.div>
  );
};

export default StockPage;

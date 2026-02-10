import { useState, useMemo } from 'react';
import {
  IconMinus,
  IconPlus,
  IconSearch,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { useAdmin } from '../context/AdminContext';
import '../Admin.css';

const StockPage = () => {
  const { products, categories, stock, updateStock, updateMinStock } = useAdmin();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = useMemo(() => {
    let list = products;
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
        return s && s.quantity <= s.minStock;
      });
    } else if (filterStatus === 'ok') {
      list = list.filter((p) => {
        const s = stock[p.id];
        return s && s.quantity > s.minStock;
      });
    }
    return list;
  }, [products, search, filterCategory, filterStatus, stock]);

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

  return (
    <>
      <div className="admin-page-header">
        <h1>Gerenciamento de Estoque</h1>
        <p>Controle de estoque e alertas de reposição</p>
      </div>

      <div className="admin-toolbar">
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
          <option value="ok">Estoque OK</option>
        </select>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Quantidade</th>
              <th>Mín.</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const s = stock[p.id] || { quantity: 0, minStock: 5 };
              const isLow = s.quantity <= s.minStock;
              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="product-thumb" />
                      ) : (
                        <div className="product-thumb" style={{ background: 'rgba(217,177,84,0.1)' }} />
                      )}
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td><span className="category-badge">{getCategoryName(p.category)}</span></td>
                  <td>
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
                  <td>
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
                  <td>
                    {isLow ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#f44336', fontSize: '0.8rem', fontWeight: 600 }}>
                        <IconAlertTriangle size={14} stroke={2} />
                        Baixo
                      </span>
                    ) : (
                      <span style={{ color: '#4caf50', fontSize: '0.8rem', fontWeight: 600 }}>
                        OK
                      </span>
                    )}
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      style={{
                        width: '80px',
                        padding: '0.35rem 0.5rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(217,177,84,0.15)',
                        borderRadius: '8px',
                        color: '#e8e1d4',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
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
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: '#bfb3a2', padding: '2rem' }}>
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default StockPage;

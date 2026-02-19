import { useState, useMemo } from 'react';
import { IconSearch } from '@tabler/icons-react';
import { useAdmin } from '../context/AdminContext';
import '../Admin.css';

const ORDER_STATUSES = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'processando', label: 'Processando' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'entregue', label: 'Entregue' },
  { value: 'cancelado', label: 'Cancelado' },
];

const OrdersPage = () => {
  const { orders, updateOrderStatus } = useAdmin();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = useMemo(() => {
    let list = orders;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          String(o.id).includes(q) ||
          (o.customer?.name || '').toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'all') {
      list = list.filter((o) => o.status === filterStatus);
    }
    return list;
  }, [orders, search, filterStatus]);

  return (
    <>
      <div className="admin-page-header">
        <h1>Pedidos</h1>
        <p>Acompanhe e gerencie os pedidos realizados</p>
      </div>

      <div className="admin-toolbar">
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <IconSearch size={16} stroke={1.8} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#bfb3a2' }} />
          <input
            className="admin-search"
            style={{ paddingLeft: '2.2rem' }}
            placeholder="Buscar pedido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="admin-search"
          style={{ maxWidth: 200 }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Todos os Status</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Data</th>
              <th>Cliente</th>
              <th>Itens</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id}>
                <td data-label="ID" style={{ fontWeight: 600 }}>#{o.id}</td>
                <td data-label="Data">{new Date(o.date).toLocaleDateString('pt-BR')}</td>
                <td data-label="Cliente">{o.customer?.name || '—'}</td>
                <td data-label="Itens">{o.items?.length || 0} itens</td>
                <td data-label="Status">
                  <span className={`order-status ${o.status}`}>{o.status}</span>
                </td>
                <td data-label="Alterar Status">
                  <select
                    className="admin-search"
                    style={{ maxWidth: 160, padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                    value={o.status}
                    onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: '#bfb3a2', padding: '2rem' }}>
                  Nenhum pedido encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default OrdersPage;

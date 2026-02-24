import { useState, useMemo } from 'react';
import { IconSearch, IconX, IconEye, IconReceipt, IconPrinter } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../context/AdminContext';
import '../Admin.css';

const ORDER_STATUSES = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'processando', label: 'Processando' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'entregue', label: 'Entregue' },
  { value: 'cancelado', label: 'Cancelado' },
];

const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.1 + i * 0.04, duration: 0.35, ease: [0.4, 0, 0.2, 1] },
  }),
  exit: { opacity: 0, x: 12, transition: { duration: 0.2 } },
};

const OrdersPage = () => {
  const { orders, updateOrderStatus } = useAdmin();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    document.body.style.overflow = 'hidden';
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    document.body.style.overflow = '';
  };

  const formatCurrency = (value) =>
    typeof value === 'number' ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="admin-page-header">
        <h1>Pedidos</h1>
        <p>Acompanhe e gerencie os pedidos realizados</p>
      </div>

      <motion.div className="admin-toolbar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.35 }}>
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
      </motion.div>

      <motion.div className="admin-table-wrapper" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}>
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
          <AnimatePresence mode="popLayout">
            <tbody>
              {filtered.map((o, i) => (
                <motion.tr key={o.id} custom={i} initial="hidden" animate="visible" exit="exit" variants={rowVariants} layout>
                  <td data-label="ID" style={{ fontWeight: 600 }}>#{o.id}</td>
                  <td data-label="Data">{new Date(o.date).toLocaleDateString('pt-BR')}</td>
                  <td data-label="Cliente">{o.customer?.name || '—'}</td>
                  <td data-label="Itens">{o.items?.length || 0} itens</td>
                  <td data-label="Status">
                    <span className={`order-status ${o.status}`}>{o.status}</span>
                  </td>
                  <td data-label="Ações">
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <select
                        className="admin-search"
                        style={{ maxWidth: 140, padding: '0.35rem 0.5rem', fontSize: '0.8rem', minHeight: '32px' }}
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <button
                        className="admin-btn secondary"
                        style={{ padding: '0.35rem 0.75rem', minHeight: '32px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => openOrderDetails(o)}
                        title="Ver Detalhes do Pedido"
                      >
                        <IconEye size={16} /> Detalhes
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: '#bfb3a2', padding: '2rem' }}>
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </AnimatePresence>
        </table>
      </motion.div>

      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            className="admin-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOrderDetails}
          >
            <motion.div
              className="admin-modal"
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #efeae4' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <IconReceipt size={24} style={{ color: '#8c7d6c' }} />
                  <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>Pedido #{selectedOrder.id}</h2>
                  <span className={`order-status ${selectedOrder.status}`} style={{ fontSize: '0.8rem' }}>{selectedOrder.status}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="admin-btn secondary" onClick={handlePrint} title="Imprimir Pedido" style={{ padding: '0.5rem' }}>
                    <IconPrinter size={20} />
                  </button>
                  <button className="admin-modal-close" onClick={closeOrderDetails} style={{ position: 'relative', top: 'auto', right: 'auto' }}>
                    <IconX size={24} />
                  </button>
                </div>
              </div>

              <div className="order-details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div className="order-details-section">
                  <h3 style={{ fontSize: '1.1rem', color: '#555', marginBottom: '1rem', borderBottom: '1px dashed #ddd', paddingBottom: '0.5rem' }}>Dados do Cliente</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <p><strong>Nome:</strong> {selectedOrder.customer?.name || 'Não informado'}</p>
                    <p><strong>Email:</strong> {selectedOrder.customer?.email || 'Não informado'}</p>
                    <p><strong>Telefone:</strong> {selectedOrder.customer?.phone || 'Não informado'}</p>
                    <p><strong>Documento:</strong> {selectedOrder.customer?.document || 'Não informado'}</p>
                  </div>
                </div>

                <div className="order-details-section">
                  <h3 style={{ fontSize: '1.1rem', color: '#555', marginBottom: '1rem', borderBottom: '1px dashed #ddd', paddingBottom: '0.5rem' }}>Endereço de Entrega</h3>
                  {selectedOrder.customer?.address ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', lineHeight: '1.4' }}>
                      <p>
                        {selectedOrder.customer.address.street}, {selectedOrder.customer.address.number}
                        {selectedOrder.customer.address.complement && ` - ${selectedOrder.customer.address.complement}`}
                      </p>
                      <p>{selectedOrder.customer.address.neighborhood}</p>
                      <p>{selectedOrder.customer.address.city} - {selectedOrder.customer.address.state}</p>
                      <p><strong>CEP:</strong> {selectedOrder.customer.address.zipCode}</p>
                    </div>
                  ) : (
                    <p>Endereço não informado.</p>
                  )}
                </div>
              </div>

              <div className="order-details-section" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#555', marginBottom: '1rem', borderBottom: '1px dashed #ddd', paddingBottom: '0.5rem' }}>Itens do Pedido</h3>

                <div style={{ border: '1px solid #efeae4', borderRadius: '8px', overflow: 'hidden' }}>
                  <table className="admin-table" style={{ margin: 0 }}>
                    <thead style={{ background: '#f8f6f4' }}>
                      <tr>
                        <th>Produto</th>
                        <th>Opções</th>
                        <th style={{ textAlign: 'center' }}>Qtd</th>
                        <th style={{ textAlign: 'right' }}>Preço Unit.</th>
                        <th style={{ textAlign: 'right' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {item.image && <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />}
                              <span style={{ fontWeight: 500 }}>{item.name}</span>
                            </div>
                          </td>
                          <td style={{ fontSize: '0.85rem', color: '#666' }}>
                            {item.coverType === 'com-capa' && 'Com Capa'}
                            {item.coverType === 'refil-only' && 'Apenas Refil'}
                            {item.fabricName && <div>Tecido: {item.fabricName}</div>}
                            {item.selectedSize && <div>Tamanho: {item.selectedSize}</div>}
                            {item.cushionColors && item.cushionColors.length > 0 && <div>Cores: {item.cushionColors.join(', ')}</div>}
                            {item.dimensionOptions && <div>Dimensões: {item.dimensionOptions.label || 'Padrão'}</div>}
                          </td>
                          <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                          <td style={{ textAlign: 'right' }}>{formatCurrency(item.price)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.subtotal || item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="order-details-footer" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', background: '#fbfaf8', padding: '1.5rem', borderRadius: '8px' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#555' }}>Detalhes do Pagamento e Observações</h4>
                  <p style={{ margin: '0 0 0.5rem 0' }}><strong>Método:</strong> {selectedOrder.paymentMethod || 'Não informado'}</p>
                  <p style={{ margin: '0 0 0.5rem 0' }}><strong>Data da Compra:</strong> {new Date(selectedOrder.date).toLocaleString('pt-BR')}</p>
                  {selectedOrder.notes && (
                    <div style={{ marginTop: '1rem', background: '#fff', padding: '1rem', borderLeft: '4px solid #8c7d6c', borderRadius: '4px' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem' }}><em>"{selectedOrder.notes}"</em></p>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                    <span>Subtotal dos itens:</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                    <span>Frete:</span>
                    <span>A Combinar</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', color: '#333', borderTop: '1px solid #ddd', paddingTop: '0.8rem', marginTop: 'auto' }}>
                    <span>Total do Pedido:</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Print Only Styles */}
              <style>{`
                @media print {
                  body * { visibility: hidden; }
                  .admin-modal, .admin-modal * { visibility: visible; }
                  .admin-modal { position: absolute; left: 0; top: 0; width: 100%; border: none; box-shadow: none; padding: 0; }
                  .admin-modal-close, button { display: none !important; }
                  .admin-modal-header { padding-top: 0; }
                  select.admin-search { -webkit-appearance: none; appearance: none; border: none; background: transparent; padding: 0; pointer-events: none; }
                }
              `}</style>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrdersPage;

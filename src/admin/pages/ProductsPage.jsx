import { useState, useMemo } from 'react';
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconSearch,
} from '@tabler/icons-react';
import { useAdmin } from '../context/AdminContext';
import '../Admin.css';

const emptyProduct = {
  name: '',
  category: 'sofas',
  description: '',
  price: '',
  image: '',
  features: '',
  stockQuantity: 50,
  minStock: 5,
};

const ProductsPage = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct, stock } = useAdmin();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [products, search]);

  const openNew = () => {
    setEditing(null);
    setForm(emptyProduct);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product.id);
    setForm({
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      image: product.image,
      features: Array.isArray(product.features) ? product.features.join(', ') : product.features || '',
      stockQuantity: stock[product.id]?.quantity ?? 0,
      minStock: stock[product.id]?.minStock ?? 5,
    });
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduct(id);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const featuresArr = form.features
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    const productData = {
      name: form.name,
      category: form.category,
      description: form.description,
      price: form.price,
      image: form.image,
      features: featuresArr,
      stockQuantity: parseInt(form.stockQuantity, 10) || 0,
      minStock: parseInt(form.minStock, 10) || 5,
    };

    if (editing !== null) {
      updateProduct(editing, productData);
    } else {
      addProduct(productData);
    }
    setModalOpen(false);
  };

  const getCategoryName = (id) => {
    const cat = categories.find((c) => c.id === id);
    return cat ? cat.name : id;
  };

  return (
    <>
      <div className="admin-page-header">
        <h1>Produtos</h1>
        <p>Gerencie o catálogo de produtos da M&apos;Martin</p>
      </div>

      <div className="admin-toolbar">
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <IconSearch size={16} stroke={1.8} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#bfb3a2' }} />
          <input
            className="admin-search"
            style={{ paddingLeft: '2.2rem' }}
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={openNew}>
          <IconPlus size={18} stroke={2} />
          Novo Produto
        </button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Imagem</th>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const s = stock[p.id];
              const qty = s?.quantity ?? 0;
              const isLow = s && qty <= s.minStock;
              return (
                <tr key={p.id}>
                  <td>
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="product-thumb" />
                    ) : (
                      <div className="product-thumb" style={{ background: 'rgba(217,177,84,0.1)' }} />
                    )}
                  </td>
                  <td>{p.name}</td>
                  <td><span className="category-badge">{getCategoryName(p.category)}</span></td>
                  <td>{p.price}</td>
                  <td>
                    <span className={isLow ? 'stock-low' : 'stock-ok'}>
                      {qty} un.
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button title="Editar" onClick={() => openEdit(p)}>
                        <IconPencil size={16} stroke={1.6} />
                      </button>
                      <button title="Excluir" className="delete" onClick={() => handleDelete(p.id)}>
                        <IconTrash size={16} stroke={1.6} />
                      </button>
                    </div>
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

      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing !== null ? 'Editar Produto' : 'Novo Produto'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="prod-name">Nome do Produto</label>
                <input id="prod-name" name="name" value={form.name} onChange={handleChange} required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="prod-category">Categoria</label>
                  <select id="prod-category" name="category" value={form.category} onChange={handleChange}>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="prod-price">Preço</label>
                  <input id="prod-price" name="price" value={form.price} onChange={handleChange} placeholder="R$ 0,00" required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="prod-desc">Descrição</label>
                <textarea id="prod-desc" name="description" value={form.description} onChange={handleChange} rows="3" />
              </div>

              <div className="form-group">
                <label htmlFor="prod-image">URL da Imagem</label>
                <input id="prod-image" name="image" value={form.image} onChange={handleChange} placeholder="https://..." />
              </div>

              <div className="form-group">
                <label htmlFor="prod-features">Características (separadas por vírgula)</label>
                <input id="prod-features" name="features" value={form.features} onChange={handleChange} placeholder="Tecido premium, Design moderno" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="prod-stock">Quantidade em Estoque</label>
                  <input id="prod-stock" name="stockQuantity" type="number" min="0" value={form.stockQuantity} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="prod-min">Estoque Mínimo</label>
                  <input id="prod-min" name="minStock" type="number" min="0" value={form.minStock} onChange={handleChange} />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">{editing !== null ? 'Salvar' : 'Cadastrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductsPage;

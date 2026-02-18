import { useState, useMemo } from 'react';
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconSearch,
  IconX,
  IconPackage,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { useAdmin } from '../context/AdminContext';
import '../Admin.css';

const emptyProduct = {
  name: '',
  category: 'sofas',
  description: '',
  price: '',
  image: '',
  additionalImages: '',
  features: '',
  material: '',
  dimensions: '',
  weight: '',
  stockQuantity: 50,
  minStock: 5,
};

const ProductsPage = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct, stock } = useAdmin();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [confirmDelete, setConfirmDelete] = useState(null);

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
      additionalImages: Array.isArray(product.additionalImages) ? product.additionalImages.join(', ') : product.additionalImages || '',
      features: Array.isArray(product.features) ? product.features.join(', ') : product.features || '',
      material: product.material || '',
      dimensions: product.dimensions || '',
      weight: product.weight || '',
      stockQuantity: stock[product.id]?.quantity ?? 0,
      minStock: stock[product.id]?.minStock ?? 5,
    });
    setModalOpen(true);
  };

  const handleDelete = (product) => {
    setConfirmDelete(product);
  };

  const confirmDeleteProduct = () => {
    if (confirmDelete) {
      deleteProduct(confirmDelete.id);
      setConfirmDelete(null);
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

    const additionalImagesArr = form.additionalImages
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean);

    const productData = {
      name: form.name,
      category: form.category,
      description: form.description,
      price: form.price,
      image: form.image,
      additionalImages: additionalImagesArr,
      features: featuresArr,
      material: form.material,
      dimensions: form.dimensions,
      weight: form.weight,
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
                      <button title="Editar" aria-label="Editar produto" onClick={() => openEdit(p)}>
                        <IconPencil size={16} stroke={1.6} />
                      </button>
                      <button title="Excluir" aria-label="Excluir produto" className="delete" onClick={() => handleDelete(p)}>
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
            <button className="admin-modal-close" onClick={() => setModalOpen(false)} aria-label="Fechar">
              <IconX size={18} stroke={2} />
            </button>
            <div className="admin-modal-body">
              <div className="admin-modal-header">
                <IconPackage size={32} stroke={1.5} className="modal-header-icon" />
                <h2>{editing !== null ? 'Editar Produto' : 'Novo Produto'}</h2>
                <p>{editing !== null ? 'Atualize as informações do produto' : 'Preencha os dados para cadastrar um novo produto'}</p>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="prod-name">Nome do Produto</label>
                  <input id="prod-name" name="name" value={form.name} onChange={handleChange} placeholder="Ex: Sofá Premium" required />
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
                  <textarea id="prod-desc" name="description" value={form.description} onChange={handleChange} rows="3" placeholder="Descreva o produto..." />
                </div>

                <div className="form-group">
                  <label htmlFor="prod-image">URL da Imagem Principal</label>
                  <input id="prod-image" name="image" value={form.image} onChange={handleChange} placeholder="https://..." />
                </div>

                <div className="form-group">
                  <label htmlFor="prod-additional-images">Fotos Adicionais (URLs separadas por vírgula)</label>
                  <textarea id="prod-additional-images" name="additionalImages" value={form.additionalImages} onChange={handleChange} rows="2" placeholder="https://foto2.jpg, https://foto3.jpg, https://foto4.jpg" />
                </div>

                {(form.image || form.additionalImages) && (
                  <div className="form-group">
                    <label style={{ marginBottom: '0.5rem' }}>Pré-visualização das Fotos</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {form.image && (
                        <img src={form.image} alt="Principal" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '2px solid rgba(217, 177, 84, 0.3)' }} />
                      )}
                      {form.additionalImages && form.additionalImages.split(',').map((url, i) => {
                        const trimmed = url.trim();
                        return trimmed ? (
                          <img key={i} src={trimmed} alt={`Foto ${i + 2}`} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(217, 177, 84, 0.15)' }} />
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="prod-material">Material</label>
                    <input id="prod-material" name="material" value={form.material} onChange={handleChange} placeholder="Ex: Tecido Suede, Couro" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="prod-weight">Peso</label>
                    <input id="prod-weight" name="weight" value={form.weight} onChange={handleChange} placeholder="Ex: 45kg" />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="prod-dimensions">Dimensões</label>
                  <input id="prod-dimensions" name="dimensions" value={form.dimensions} onChange={handleChange} placeholder="Ex: 220cm x 95cm x 85cm (L x P x A)" />
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
                  <button type="submit" className="btn-primary">{editing !== null ? 'Salvar Alterações' : 'Cadastrar Produto'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="admin-confirm-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="admin-confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="admin-confirm-body">
              <IconAlertTriangle size={48} stroke={1.5} className="confirm-icon" />
              <h3>Excluir Produto</h3>
              <p>Tem certeza que deseja excluir <strong>{confirmDelete.name}</strong>? Esta ação não pode ser desfeita.</p>
              <div className="admin-confirm-actions">
                <button className="btn-cancel" onClick={() => setConfirmDelete(null)}>Cancelar</button>
                <button className="btn-delete" onClick={confirmDeleteProduct}>Excluir</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductsPage;

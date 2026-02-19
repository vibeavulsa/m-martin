import { useState, useMemo } from 'react';
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconSearch,
  IconX,
  IconPackage,
  IconAlertTriangle,
  IconInfoCircle,
  IconCurrencyDollar,
  IconStack2,
  IconPhoto,
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../context/AdminContext';
import ImagePasteArea from '../components/ImagePasteArea';
import '../Admin.css';

const emptyProduct = {
  name: '',
  category: 'sofas',
  description: '',
  price: '',
  image: '',
  images: [],
  features: '',
  stockQuantity: 50,
  minStock: 5,
  barcode: '',
  supplier: '',
  unit: 'UNIDADE',
  costPrice: '',
  wholesalePrice: '',
  maxStock: '',
};

const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.1 + i * 0.03, duration: 0.35, ease: [0.4, 0, 0.2, 1] },
  }),
  exit: { opacity: 0, x: 12, transition: { duration: 0.2 } },
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
    // Support both old single image and new multiple images format
    const productImages = product.images && product.images.length > 0 
      ? product.images 
      : product.image 
        ? [product.image] 
        : [];
    setForm({
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      image: product.image,
      images: productImages,
      features: Array.isArray(product.features) ? product.features.join(', ') : product.features || '',
      stockQuantity: stock[product.id]?.quantity ?? 0,
      minStock: stock[product.id]?.minStock ?? 5,
      barcode: product.barcode || '',
      supplier: product.supplier || '',
      unit: product.unit || 'UNIDADE',
      costPrice: product.costPrice || '',
      wholesalePrice: product.wholesalePrice || '',
      maxStock: product.maxStock || '',
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

    const productData = {
      name: form.name,
      category: form.category,
      description: form.description,
      price: form.price,
      // Keep backward compatibility: set image to first image or empty
      image: form.images && form.images.length > 0 ? form.images[0] : form.image,
      // Add images array for multi-image support
      images: form.images && form.images.length > 0 ? form.images : undefined,
      features: featuresArr,
      stockQuantity: parseInt(form.stockQuantity, 10) || 0,
      minStock: parseInt(form.minStock, 10) || 5,
      barcode: form.barcode,
      supplier: form.supplier,
      unit: form.unit,
      costPrice: form.costPrice,
      wholesalePrice: form.wholesalePrice,
      maxStock: form.maxStock ? parseInt(form.maxStock, 10) : '',
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="admin-page-header">
        <h1>Produtos</h1>
        <p>Gerencie o catálogo de produtos da M&apos;Martin</p>
      </div>

      <motion.div className="admin-toolbar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.35 }}>
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
      </motion.div>

      <motion.div className="admin-table-wrapper" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}>
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
          <AnimatePresence mode="popLayout">
            <tbody>
              {filtered.map((p, i) => {
                const s = stock[p.id];
                const qty = s?.quantity ?? 0;
                const isLow = s && qty <= s.minStock;
                return (
                  <motion.tr key={p.id} custom={i} initial="hidden" animate="visible" exit="exit" variants={rowVariants} layout>
                    <td data-label="Imagem">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="product-thumb" />
                      ) : (
                        <div className="product-thumb" style={{ background: 'rgba(217,177,84,0.1)' }} />
                      )}
                    </td>
                    <td data-label="Nome">{p.name}</td>
                    <td data-label="Categoria"><span className="category-badge">{getCategoryName(p.category)}</span></td>
                    <td data-label="Preço">{p.price}</td>
                    <td data-label="Estoque">
                      <span className={isLow ? 'stock-low' : 'stock-ok'}>
                        {qty} un.
                      </span>
                    </td>
                    <td data-label="Ações">
                      <div className="table-actions">
                        <button title="Editar" aria-label="Editar produto" onClick={() => openEdit(p)}>
                          <IconPencil size={16} stroke={1.6} />
                        </button>
                        <button title="Excluir" aria-label="Excluir produto" className="delete" onClick={() => handleDelete(p)}>
                          <IconTrash size={16} stroke={1.6} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
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
          </AnimatePresence>
        </table>
      </motion.div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div className="admin-modal-overlay" onClick={() => setModalOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <motion.div className="admin-modal admin-modal-wide" onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, scale: 0.92, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 24 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>
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
                <div className="product-form-layout">
                  {/* Left Column - Product Information */}
                  <div className="product-form-column">
                    <div className="product-form-section">
                      <div className="product-form-section-header">
                        <IconInfoCircle size={20} stroke={1.8} />
                        <h3>Informações do Produto</h3>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="prod-name">Nome do Produto</label>
                        <input id="prod-name" name="name" value={form.name} onChange={handleChange} placeholder="Ex: Sofá Premium" required />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="prod-barcode">Código de Barras / SKU</label>
                          <input id="prod-barcode" name="barcode" value={form.barcode} onChange={handleChange} placeholder="Ex: 7891234567890" />
                        </div>
                        <div className="form-group">
                          <label htmlFor="prod-category">Categoria</label>
                          <select id="prod-category" name="category" value={form.category} onChange={handleChange}>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="prod-supplier">Fornecedor</label>
                          <input id="prod-supplier" name="supplier" value={form.supplier} onChange={handleChange} placeholder="Nome do fornecedor" />
                        </div>
                        <div className="form-group">
                          <label htmlFor="prod-unit">Unidade</label>
                          <select id="prod-unit" name="unit" value={form.unit} onChange={handleChange}>
                            <option value="UNIDADE">Unidade</option>
                            <option value="KG">Quilograma (KG)</option>
                            <option value="METRO">Metro</option>
                            <option value="PEÇA">Peça</option>
                            <option value="CAIXA">Caixa</option>
                            <option value="PACOTE">Pacote</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="prod-desc">Descrição</label>
                        <textarea id="prod-desc" name="description" value={form.description} onChange={handleChange} rows="3" placeholder="Descreva o produto..." />
                      </div>

                      <div className="form-group">
                        <label htmlFor="prod-features">Características (separadas por vírgula)</label>
                        <input id="prod-features" name="features" value={form.features} onChange={handleChange} placeholder="Tecido premium, Design moderno" />
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Price, Stock, Image */}
                  <div className="product-form-column">
                    {/* Price Section */}
                    <div className="product-form-section">
                      <div className="product-form-section-header">
                        <IconCurrencyDollar size={20} stroke={1.8} />
                        <h3>Preço</h3>
                      </div>
                      
                      <div className="form-row-3">
                        <div className="form-group">
                          <label htmlFor="prod-cost">Custo</label>
                          <input id="prod-cost" name="costPrice" value={form.costPrice} onChange={handleChange} placeholder="R$ 0,00" />
                        </div>
                        <div className="form-group">
                          <label htmlFor="prod-price">Varejo</label>
                          <input id="prod-price" name="price" value={form.price} onChange={handleChange} placeholder="R$ 0,00" required />
                        </div>
                        <div className="form-group">
                          <label htmlFor="prod-wholesale">Atacado</label>
                          <input id="prod-wholesale" name="wholesalePrice" value={form.wholesalePrice} onChange={handleChange} placeholder="R$ 0,00" />
                        </div>
                      </div>
                    </div>

                    {/* Stock Section */}
                    <div className="product-form-section">
                      <div className="product-form-section-header">
                        <IconStack2 size={20} stroke={1.8} />
                        <h3>Estoque</h3>
                      </div>
                      
                      <div className="form-row-3">
                        <div className="form-group">
                          <label htmlFor="prod-max">Máximo</label>
                          <input id="prod-max" name="maxStock" type="number" min="0" value={form.maxStock} onChange={handleChange} placeholder="100" />
                        </div>
                        <div className="form-group">
                          <label htmlFor="prod-min">Mínimo</label>
                          <input id="prod-min" name="minStock" type="number" min="0" value={form.minStock} onChange={handleChange} placeholder="5" />
                        </div>
                        <div className="form-group">
                          <label htmlFor="prod-stock">Atual</label>
                          <input id="prod-stock" name="stockQuantity" type="number" min="0" value={form.stockQuantity} onChange={handleChange} placeholder="50" />
                        </div>
                      </div>
                    </div>

                    {/* Image Section */}
                    <div className="product-form-section">
                      <div className="product-form-section-header">
                        <IconPhoto size={20} stroke={1.8} />
                        <h3>Imagens do Produto</h3>
                      </div>
                      
                      <ImagePasteArea
                        images={form.images}
                        onChange={(newImages) => setForm((prev) => ({ ...prev, images: newImages }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                  <button type="submit" className="btn-primary">{editing !== null ? 'Salvar Alterações' : 'Cadastrar Produto'}</button>
                </div>
              </form>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete && (
          <motion.div className="admin-confirm-overlay" onClick={() => setConfirmDelete(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <motion.div className="admin-confirm-dialog" onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, scale: 0.92, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 24 }} transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}>
              <div className="admin-confirm-body">
                <IconAlertTriangle size={48} stroke={1.5} className="confirm-icon" />
                <h3>Excluir Produto</h3>
                <p>Tem certeza que deseja excluir <strong>{confirmDelete.name}</strong>? Esta ação não pode ser desfeita.</p>
                <div className="admin-confirm-actions">
                  <button className="btn-cancel" onClick={() => setConfirmDelete(null)}>Cancelar</button>
                  <button className="btn-delete" onClick={confirmDeleteProduct}>Excluir</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductsPage;

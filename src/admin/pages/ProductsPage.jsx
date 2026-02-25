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
  IconChevronRight,
  IconChevronLeft,
  IconCheck,
  IconSparkles,
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../context/AdminContext';
import ImagePasteArea from '../components/ImagePasteArea';
import '../Admin.css';

const SOFA_MODELS = ['Zeus', 'Chronos', 'Roma', 'RC', 'Orgânico', 'Sem Caixa', 'Chaise'];

const ALL_CATEGORIES = [
  { id: 'sofas', name: 'Sofás' },
  { id: 'almofadas', name: 'Almofadas' },
  { id: 'travesseiros', name: 'Travesseiros' },
  { id: 'puffs-chaise', name: 'Puffs e Chaise' },
  { id: 'homecare-hospitalar', name: 'Homecare / Hospitalar' },
  { id: 'pet', name: 'Linha Pet' },
];

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
  sofaModel: '',
  isCustomOrder: false,
};

const STEPS = [
  { id: 'info', label: 'Informações', icon: IconInfoCircle },
  { id: 'pricing', label: 'Preço e Estoque', icon: IconCurrencyDollar },
  { id: 'media', label: 'Imagens', icon: IconPhoto },
];

const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.1 + i * 0.03, duration: 0.35, ease: [0.4, 0, 0.2, 1] },
  }),
  exit: { opacity: 0, x: 12, transition: { duration: 0.2 } },
};

const stepContentVariants = {
  enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

const ProductsPage = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct, stock } = useAdmin();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [step, setStep] = useState(0);
  const [stepDir, setStepDir] = useState(1);

  // Merge DB categories with fallback static categories
  const mergedCategories = useMemo(() => {
    if (categories && categories.length > 0) {
      // Add any missing categories from ALL_CATEGORIES
      const catIds = new Set(categories.map(c => c.id));
      const merged = [...categories];
      for (const cat of ALL_CATEGORIES) {
        if (!catIds.has(cat.id)) {
          merged.push(cat);
        }
      }
      return merged;
    }
    return ALL_CATEGORIES;
  }, [categories]);

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
    setStep(0);
    setStepDir(1);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product.id);
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
      sofaModel: product.sofaModel || '',
      isCustomOrder: product.isCustomOrder || false,
    });
    setStep(0);
    setStepDir(1);
    setModalOpen(true);
  };

  const handleDelete = (product) => setConfirmDelete(product);

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

  const goNext = () => {
    if (step < STEPS.length - 1) {
      setStepDir(1);
      setStep(s => s + 1);
    }
  };

  const goPrev = () => {
    if (step > 0) {
      setStepDir(-1);
      setStep(s => s - 1);
    }
  };

  const goToStep = (idx) => {
    setStepDir(idx > step ? 1 : -1);
    setStep(idx);
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
      description: form.description || null,
      price: form.price,
      image: form.images && form.images.length > 0 ? form.images[0] : form.image || null,
      images: form.images && form.images.length > 0 ? form.images : [],
      features: featuresArr,
      stockQuantity: parseInt(form.stockQuantity, 10) || 0,
      minStock: parseInt(form.minStock, 10) || 5,
      barcode: form.barcode || null,
      supplier: form.supplier || null,
      unit: form.unit || null,
      costPrice: form.costPrice || null,
      wholesalePrice: form.wholesalePrice || null,
      maxStock: form.maxStock ? parseInt(form.maxStock, 10) : null,
      ...(form.category === 'sofas' && {
        sofaModel: form.sofaModel || null,
        isSofa: true,
        isCustomOrder: true,
      }),
    };

    if (editing !== null) {
      updateProduct(editing, productData);
    } else {
      addProduct(productData);
    }
    setModalOpen(false);
  };

  const getCategoryName = (id) => {
    const cat = mergedCategories.find((c) => c.id === id);
    return cat ? cat.name : id;
  };

  const canProceed = () => {
    if (step === 0) return form.name.trim() !== '' && form.category !== '';
    if (step === 1) return form.price.trim() !== '';
    return true;
  };

  // Stepper sub-components
  const renderStepInfo = () => (
    <div className="product-step-content">
      <div className="form-group">
        <label htmlFor="prod-name">Nome do Produto *</label>
        <input id="prod-name" name="name" value={form.name} onChange={handleChange} placeholder="Ex: Sofá Premium" required />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="prod-category">Categoria *</label>
          <select id="prod-category" name="category" value={form.category} onChange={handleChange}>
            {mergedCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="prod-barcode">Código / SKU</label>
          <input id="prod-barcode" name="barcode" value={form.barcode} onChange={handleChange} placeholder="7891234567890" />
        </div>
      </div>

      {form.category === 'sofas' && (
        <div className="form-group">
          <label htmlFor="prod-sofa-model">Modelo do Sofá</label>
          <select id="prod-sofa-model" name="sofaModel" value={form.sofaModel} onChange={handleChange}>
            <option value="">Selecione o modelo</option>
            {SOFA_MODELS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      )}

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
  );

  const renderStepPricing = () => (
    <div className="product-step-content">
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
            <label htmlFor="prod-price">Varejo *</label>
            <input id="prod-price" name="price" value={form.price} onChange={handleChange} placeholder="R$ 0,00" required />
          </div>
          <div className="form-group">
            <label htmlFor="prod-wholesale">Atacado</label>
            <input id="prod-wholesale" name="wholesalePrice" value={form.wholesalePrice} onChange={handleChange} placeholder="R$ 0,00" />
          </div>
        </div>
      </div>

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
    </div>
  );

  const renderStepMedia = () => (
    <div className="product-step-content">
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
  );

  const stepRenderers = [renderStepInfo, renderStepPricing, renderStepMedia];

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

      {/* Product Modal with Stepper */}
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

                {/* Stepper Indicator */}
                <div className="stepper-container">
                  {STEPS.map((s, idx) => {
                    const StepIcon = s.icon;
                    const isActive = idx === step;
                    const isCompleted = idx < step;
                    return (
                      <div key={s.id} className="stepper-item-wrapper">
                        <motion.button
                          type="button"
                          className={`stepper-item ${isActive ? 'stepper-active' : ''} ${isCompleted ? 'stepper-completed' : ''}`}
                          onClick={() => goToStep(idx)}
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.div
                            className="stepper-circle"
                            animate={{
                              background: isActive
                                ? 'linear-gradient(135deg, #d9b154, #c49a3c)'
                                : isCompleted
                                  ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                                  : 'rgba(255,255,255,0.06)',
                              boxShadow: isActive ? '0 0 16px rgba(217,177,84,0.4)' : 'none',
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            {isCompleted ? (
                              <IconCheck size={16} stroke={2.5} />
                            ) : (
                              <StepIcon size={16} stroke={1.8} />
                            )}
                          </motion.div>
                          <span className="stepper-label">{s.label}</span>
                        </motion.button>
                        {idx < STEPS.length - 1 && (
                          <div className={`stepper-connector ${isCompleted ? 'stepper-connector-done' : ''}`} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Step content with animated transitions */}
                <form onSubmit={handleSubmit}>
                  <div className="stepper-body">
                    <AnimatePresence mode="wait" custom={stepDir}>
                      <motion.div
                        key={step}
                        custom={stepDir}
                        variants={stepContentVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      >
                        {stepRenderers[step]()}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="stepper-actions">
                    <div className="stepper-actions-left">
                      {step > 0 && (
                        <motion.button
                          type="button"
                          className="btn-secondary"
                          onClick={goPrev}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <IconChevronLeft size={16} stroke={2} />
                          Voltar
                        </motion.button>
                      )}
                    </div>
                    <div className="stepper-actions-right">
                      {step < STEPS.length - 1 ? (
                        <motion.button
                          type="button"
                          className="btn-primary"
                          onClick={goNext}
                          disabled={!canProceed()}
                          whileHover={canProceed() ? { scale: 1.03 } : {}}
                          whileTap={canProceed() ? { scale: 0.97 } : {}}
                        >
                          Próximo
                          <IconChevronRight size={16} stroke={2} />
                        </motion.button>
                      ) : (
                        <motion.button
                          type="submit"
                          className="btn-primary btn-success"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <IconSparkles size={16} stroke={2} />
                          {editing !== null ? 'Salvar Alterações' : 'Cadastrar Produto'}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
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

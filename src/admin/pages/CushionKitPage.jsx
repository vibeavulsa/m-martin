import { useState, useMemo } from 'react';
import {
  IconPalette,
  IconPlus,
  IconTrash,
  IconDeviceFloppy,
  IconCheck,
  IconMinus,
  IconBoxSeam,
  IconAlertTriangle,
  IconCurrencyDollar,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useAdmin } from '../context/AdminContext';
import '../Admin.css';

const colorGradients = {
  'Preto': 'linear-gradient(135deg, #2c2c2c 0%, #000000 100%)',
  'Branco': 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
  'Azul Marinho': 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
  'Cinza Rato': 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
  'Rosê': 'linear-gradient(135deg, #fda4af 0%, #fb7185 100%)',
  'Terracota': 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
  'Bege': 'linear-gradient(135deg, #e7d4b5 0%, #d4b896 100%)',
  'Bordô': 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)',
};

const LOW_STOCK_THRESHOLD_COVERS = 5;
const LOW_STOCK_THRESHOLD_REFILLS = 10;

const getStockClassName = (stock, threshold) => {
  if (stock <= 0) return 'stock-low';
  if (stock <= threshold) return 'stock-warning';
  return 'stock-ok';
};

const CushionKitPage = () => {
  const { cushionKit, updateCushionKit, updateCapaStock, updateRefilStock } = useAdmin();
  const [newColor, setNewColor] = useState('');
  const [saved, setSaved] = useState(false);
  const [productForm, setProductForm] = useState({
    name: cushionKit.product.name,
    description: cushionKit.product.description,
    price: cushionKit.product.price,
    priceCash: cushionKit.product.priceCash || cushionKit.product.price,
    priceInstallment: cushionKit.product.priceInstallment || '',
    installments: cushionKit.product.installments || 5,
    image: cushionKit.product.image || '',
    features: cushionKit.product.features.join(', '),
  });
  const [sizesText, setSizesText] = useState(cushionKit.sizes.join(', '));
  const [pricingCapasForm, setPricingCapasForm] = useState({
    priceCash: cushionKit.pricingCapas?.priceCash || '',
    priceInstallment: cushionKit.pricingCapas?.priceInstallment || '',
    installments: cushionKit.pricingCapas?.installments || 5,
  });
  const [pricingRefisForm, setPricingRefisForm] = useState({
    priceCash: cushionKit.pricingRefis?.priceCash || '',
    priceInstallment: cushionKit.pricingRefis?.priceInstallment || '',
    installments: cushionKit.pricingRefis?.installments || 5,
  });
  const [savedPricing, setSavedPricing] = useState(false);

  // Memoize stock alerts to avoid recalculating on every render
  const stockAlerts = useMemo(() => {
    const outOfStockColors = Object.entries(cushionKit.stockCapas)
      .filter(([, stock]) => stock <= 0)
      .map(([color]) => color);
    
    const lowStockColors = Object.entries(cushionKit.stockCapas)
      .filter(([, stock]) => stock > 0 && stock <= LOW_STOCK_THRESHOLD_COVERS)
      .map(([color]) => color);

    return { outOfStockColors, lowStockColors };
  }, [cushionKit.stockCapas]);

  const handleAddColor = () => {
    const color = newColor.trim();
    if (color && !cushionKit.colors.includes(color)) {
      updateCushionKit({ colors: [...cushionKit.colors, color] });
      setNewColor('');
    }
  };

  const handleRemoveColor = (color) => {
    updateCushionKit({ colors: cushionKit.colors.filter(c => c !== color) });
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePricingCapasChange = (e) => {
    const { name, value } = e.target;
    setPricingCapasForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePricingRefisChange = (e) => {
    const { name, value } = e.target;
    setPricingRefisForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSavePricing = (e) => {
    e.preventDefault();
    updateCushionKit({
      pricingCapas: {
        priceCash: pricingCapasForm.priceCash,
        priceInstallment: pricingCapasForm.priceInstallment,
        installments: parseInt(pricingCapasForm.installments, 10) || 5,
      },
      pricingRefis: {
        priceCash: pricingRefisForm.priceCash,
        priceInstallment: pricingRefisForm.priceInstallment,
        installments: parseInt(pricingRefisForm.installments, 10) || 5,
      },
    });
    setSavedPricing(true);
    setTimeout(() => setSavedPricing(false), 2000);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    const featuresArr = productForm.features
      .split(',')
      .map(f => f.trim())
      .filter(Boolean);

    const sizesArr = sizesText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    updateCushionKit({
      sizes: sizesArr,
      product: {
        ...cushionKit.product,
        name: productForm.name,
        description: productForm.description,
        price: productForm.price,
        priceCash: productForm.priceCash,
        priceInstallment: productForm.priceInstallment,
        installments: parseInt(productForm.installments, 10) || 5,
        image: productForm.image,
        features: featuresArr,
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="admin-page-header">
        <h1>Kit de Almofadas</h1>
        <p>Gerencie as cores disponíveis e informações do kit de almofadas</p>
      </div>

      <div className="dashboard-sections" style={{ gridTemplateColumns: '1fr' }}>
        {/* Colors Section */}
        <div className="dashboard-section">
          <h2>
            <IconPalette size={18} stroke={1.6} style={{ verticalAlign: 'middle', marginRight: '0.4rem', color: '#d9b154' }} />
            Cores Disponíveis
          </h2>
          <div className="cushion-color-chips">
            {cushionKit.colors.map((color) => (
              <div
                key={color}
                className="cushion-color-chip"
              >
                <span
                  className="cushion-color-swatch"
                  style={{ background: colorGradients[color] || '#999' }}
                />
                <span className="cushion-color-name">{color}</span>
                <button
                  onClick={() => handleRemoveColor(color)}
                  title="Remover cor"
                  aria-label={`Remover cor ${color}`}
                  className="cushion-remove-btn"
                >
                  <IconTrash size={14} stroke={1.6} />
                </button>
              </div>
            ))}
          </div>
          <div className="cushion-add-row">
            <input
              className="admin-search"
              style={{ maxWidth: '200px', flex: 1 }}
              placeholder="Nome da cor..."
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddColor(); }}
            />
            <button className="btn-primary" onClick={handleAddColor} disabled={!newColor.trim()}>
              <IconPlus size={16} stroke={2} />
              Adicionar Cor
            </button>
          </div>
        </div>

        {/* Stock Management Section */}
        <div className="dashboard-section">
          <h2>
            <IconBoxSeam size={18} stroke={1.6} style={{ verticalAlign: 'middle', marginRight: '0.4rem', color: '#d9b154' }} />
            Controle de Estoque
          </h2>
          
          {/* Refis Stock Control */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 className="cushion-stock-section-title">Refis (Enchimento)</h3>
            <div className="cushion-stock-box">
              <div className="stock-controls cushion-stock-center">
                <button onClick={() => updateRefilStock(cushionKit.stockRefis - 1)} aria-label="Diminuir estoque de refis">
                  <IconMinus size={14} stroke={2} />
                </button>
                <span className={`stock-value ${getStockClassName(cushionKit.stockRefis, LOW_STOCK_THRESHOLD_REFILLS)}`} style={{ fontSize: '1.5rem', minWidth: '48px' }}>
                  {cushionKit.stockRefis}
                </span>
                <button onClick={() => updateRefilStock(cushionKit.stockRefis + 1)} aria-label="Aumentar estoque de refis">
                  <IconPlus size={14} stroke={2} />
                </button>
              </div>
              <div className="cushion-direct-input-wrapper">
                <input
                  type="number"
                  min="0"
                  className="stock-direct-input"
                  style={{ textAlign: 'center' }}
                  placeholder="Definir qtd"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        updateRefilStock(val);
                        e.target.value = '';
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Capas por Cor Stock Control */}
          <div style={{ marginBottom: '1rem' }}>
            <h3 className="cushion-stock-section-title">Capas por Cor</h3>
            <div className="cushion-color-grid">
              {cushionKit.colors.map((color) => {
                const colorStock = cushionKit.stockCapas[color] || 0;
                
                return (
                  <div
                    key={color}
                    className="cushion-color-stock-card"
                  >
                    <span
                      className="cushion-color-swatch large"
                      style={{ background: colorGradients[color] || '#999' }}
                    />
                    <span className="cushion-color-label">{color}</span>
                    <div className="stock-controls" style={{ gap: '0.4rem' }}>
                      <button onClick={() => updateCapaStock(color, colorStock - 1)} aria-label={`Diminuir estoque de capa ${color}`} style={{ width: '26px', height: '26px' }}>
                        <IconMinus size={12} stroke={2} />
                      </button>
                      <span className={`stock-value ${getStockClassName(colorStock, LOW_STOCK_THRESHOLD_COVERS)}`} style={{ fontSize: '0.95rem', minWidth: '32px' }}>
                        {colorStock}
                      </span>
                      <button onClick={() => updateCapaStock(color, colorStock + 1)} aria-label={`Aumentar estoque de capa ${color}`} style={{ width: '26px', height: '26px' }}>
                        <IconPlus size={12} stroke={2} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stock Alerts */}
          {(cushionKit.stockRefis <= 0 || stockAlerts.outOfStockColors.length > 0) && (
            <div className="cushion-alert danger">
              <IconAlertTriangle size={16} stroke={2} />
              {cushionKit.stockRefis <= 0 && 'Refis sem estoque! '}
              {stockAlerts.outOfStockColors.length > 0 && 
                `Capas sem estoque: ${stockAlerts.outOfStockColors.join(', ')}`}
            </div>
          )}
          {cushionKit.stockRefis > 0 && cushionKit.stockRefis <= LOW_STOCK_THRESHOLD_REFILLS && (
            <div className="cushion-alert warning">
              <IconAlertTriangle size={16} stroke={2} />
              Estoque baixo de refis! Apenas {cushionKit.stockRefis} restante(s).
            </div>
          )}
          {stockAlerts.lowStockColors.length > 0 && (
            <div className="cushion-alert warning">
              <IconAlertTriangle size={16} stroke={2} />
              Estoque baixo de capas: {stockAlerts.lowStockColors.join(', ')}
            </div>
          )}
        </div>

        {/* Pricing Section */}
        <div className="dashboard-section">
          <h2>
            <IconCurrencyDollar size={18} stroke={1.6} style={{ verticalAlign: 'middle', marginRight: '0.4rem', color: '#d9b154' }} />
            Controle de Preços
          </h2>
          <form onSubmit={handleSavePricing}>
            {/* Capas Pricing */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 className="cushion-stock-section-title">Capas</h3>
              <div className="cushion-pricing-box">
                <div className="cushion-pricing-grid">
                  <div className="form-group">
                    <label htmlFor="capa-price-cash" className="cushion-form-label">Preço à Vista</label>
                    <input
                      id="capa-price-cash"
                      name="priceCash"
                      value={pricingCapasForm.priceCash}
                      onChange={handlePricingCapasChange}
                      placeholder="R$ 0,00"
                      className="cushion-form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="capa-price-installment" className="cushion-form-label">Preço Parcelado</label>
                    <input
                      id="capa-price-installment"
                      name="priceInstallment"
                      value={pricingCapasForm.priceInstallment}
                      onChange={handlePricingCapasChange}
                      placeholder="R$ 0,00"
                      className="cushion-form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="capa-installments" className="cushion-form-label">Nº Parcelas</label>
                    <input
                      id="capa-installments"
                      name="installments"
                      type="number"
                      min="1"
                      value={pricingCapasForm.installments}
                      onChange={handlePricingCapasChange}
                      className="cushion-form-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Refis Pricing */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 className="cushion-stock-section-title">Refis (Enchimento)</h3>
              <div className="cushion-pricing-box">
                <div className="cushion-pricing-grid">
                  <div className="form-group">
                    <label htmlFor="refil-price-cash" className="cushion-form-label">Preço à Vista</label>
                    <input
                      id="refil-price-cash"
                      name="priceCash"
                      value={pricingRefisForm.priceCash}
                      onChange={handlePricingRefisChange}
                      placeholder="R$ 0,00"
                      className="cushion-form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="refil-price-installment" className="cushion-form-label">Preço Parcelado</label>
                    <input
                      id="refil-price-installment"
                      name="priceInstallment"
                      value={pricingRefisForm.priceInstallment}
                      onChange={handlePricingRefisChange}
                      placeholder="R$ 0,00"
                      className="cushion-form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="refil-installments" className="cushion-form-label">Nº Parcelas</label>
                    <input
                      id="refil-installments"
                      name="installments"
                      type="number"
                      min="1"
                      value={pricingRefisForm.installments}
                      onChange={handlePricingRefisChange}
                      className="cushion-form-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary cushion-save-btn-wrapper"
            >
              {savedPricing ? <IconCheck size={18} stroke={2} /> : <IconDeviceFloppy size={18} stroke={2} />}
              {savedPricing ? 'Salvo!' : 'Salvar Preços'}
            </button>
          </form>
        </div>

        {/* Product Info Section */}
        <div className="dashboard-section">
          <h2>Informações do Produto</h2>
          <form onSubmit={handleSaveProduct}>
            <div className="cushion-form-group">
              <label htmlFor="kit-name" className="cushion-form-label">Nome do Kit</label>
              <input
                id="kit-name"
                name="name"
                value={productForm.name}
                onChange={handleProductChange}
                placeholder="Ex: Kit Refil de Almofada"
                required
                className="cushion-form-input"
              />
            </div>

            <div className="cushion-form-group">
              <label htmlFor="kit-desc" className="cushion-form-label">Descrição</label>
              <textarea
                id="kit-desc"
                name="description"
                value={productForm.description}
                onChange={handleProductChange}
                rows="3"
                className="cushion-form-input"
              />
            </div>

            <div className="cushion-form-grid-2">
              <div className="form-group">
                <label htmlFor="kit-price" className="cushion-form-label">Preço à Vista</label>
                <input
                  id="kit-price"
                  name="priceCash"
                  value={productForm.priceCash}
                  onChange={handleProductChange}
                  placeholder="R$ 0,00"
                  required
                  className="cushion-form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="kit-installment" className="cushion-form-label">Preço Parcela</label>
                <input
                  id="kit-installment"
                  name="priceInstallment"
                  value={productForm.priceInstallment}
                  onChange={handleProductChange}
                  placeholder="R$ 0,00"
                  className="cushion-form-input"
                />
              </div>
            </div>

            <div className="cushion-form-grid-2">
              <div className="form-group">
                <label htmlFor="kit-installments" className="cushion-form-label">Nº de Parcelas</label>
                <input
                  id="kit-installments"
                  name="installments"
                  type="number"
                  min="1"
                  value={productForm.installments}
                  onChange={handleProductChange}
                  className="cushion-form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="kit-sizes" className="cushion-form-label">Tamanhos (vírgula)</label>
                <input
                  id="kit-sizes"
                  value={sizesText}
                  onChange={(e) => setSizesText(e.target.value)}
                  placeholder="45x45, 50x50"
                  className="cushion-form-input"
                />
              </div>
            </div>

            <div className="cushion-form-group">
              <label htmlFor="kit-image" className="cushion-form-label">URL da Imagem</label>
              <input
                id="kit-image"
                name="image"
                value={productForm.image}
                onChange={handleProductChange}
                placeholder="https://..."
                className="cushion-form-input"
              />
            </div>

            <div className="cushion-form-group">
              <label htmlFor="kit-features" className="cushion-form-label">Características (vírgula)</label>
              <input
                id="kit-features"
                name="features"
                value={productForm.features}
                onChange={handleProductChange}
                placeholder="Kit com 5 unidades, Tecido Oxford"
                className="cushion-form-input"
              />
            </div>

            <button
              type="submit"
              className="btn-primary cushion-save-btn-wrapper"
            >
              {saved ? <IconCheck size={18} stroke={2} /> : <IconDeviceFloppy size={18} stroke={2} />}
              {saved ? 'Salvo!' : 'Salvar Alterações'}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default CushionKitPage;

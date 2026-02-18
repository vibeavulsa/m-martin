import { useState } from 'react';
import {
  IconPalette,
  IconPlus,
  IconTrash,
  IconDeviceFloppy,
  IconCheck,
  IconMinus,
  IconBoxSeam,
  IconAlertTriangle,
} from '@tabler/icons-react';
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
    <>
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {cushionKit.colors.map((color) => (
              <div
                key={color}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.75rem',
                  background: 'rgba(217, 177, 84, 0.08)',
                  border: '1px solid rgba(217, 177, 84, 0.15)',
                  borderRadius: '10px',
                }}
              >
                <span
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '6px',
                    background: colorGradients[color] || '#999',
                    border: '1px solid rgba(255,255,255,0.1)',
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: '0.85rem', color: '#e8e1d4' }}>{color}</span>
                <button
                  onClick={() => handleRemoveColor(color)}
                  title="Remover cor"
                  aria-label={`Remover cor ${color}`}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f44336',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <IconTrash size={14} stroke={1.6} />
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
            <h3 style={{ color: '#d9b154', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>Refis (Enchimento)</h3>
            <div style={{
              padding: '1rem',
              background: 'rgba(72, 55, 38, 0.2)',
              border: '1px solid rgba(217, 177, 84, 0.08)',
              borderRadius: '12px',
            }}>
              <div className="stock-controls" style={{ justifyContent: 'center' }}>
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
              <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <input
                  type="number"
                  min="0"
                  style={{
                    width: '100px',
                    padding: '0.35rem 0.5rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(217,177,84,0.15)',
                    borderRadius: '8px',
                    color: '#e8e1d4',
                    fontSize: '0.85rem',
                    outline: 'none',
                    textAlign: 'center',
                  }}
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
            <h3 style={{ color: '#d9b154', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>Capas por Cor</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
              {cushionKit.colors.map((color) => {
                const colorStock = cushionKit.stockCapas[color] || 0;
                
                return (
                  <div
                    key={color}
                    style={{
                      padding: '0.75rem 1rem',
                      background: 'rgba(72, 55, 38, 0.2)',
                      border: '1px solid rgba(217, 177, 84, 0.08)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                  >
                    <span
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: colorGradients[color] || '#999',
                        border: '1px solid rgba(255,255,255,0.1)',
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: '0.85rem', color: '#e8e1d4', flex: 1, fontWeight: 500 }}>{color}</span>
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
          {(() => {
            const outOfStockColors = Object.entries(cushionKit.stockCapas)
              .filter(([, stock]) => stock <= 0)
              .map(([color]) => color);
            
            return (cushionKit.stockRefis <= 0 || outOfStockColors.length > 0) && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                background: 'rgba(244, 67, 54, 0.12)',
                border: '1px solid rgba(244, 67, 54, 0.25)',
                borderRadius: '10px',
                color: '#f44336',
                fontSize: '0.85rem',
                fontWeight: 500,
                marginBottom: '0.5rem',
              }}>
                <IconAlertTriangle size={16} stroke={2} />
                {cushionKit.stockRefis <= 0 && 'Refis sem estoque! '}
                {outOfStockColors.length > 0 && 
                  `Capas sem estoque: ${outOfStockColors.join(', ')}`}
              </div>
            );
          })()}
          {cushionKit.stockRefis > 0 && cushionKit.stockRefis <= LOW_STOCK_THRESHOLD_REFILLS && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              background: 'rgba(255, 152, 0, 0.12)',
              border: '1px solid rgba(255, 152, 0, 0.25)',
              borderRadius: '10px',
              color: '#ff9800',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}>
              <IconAlertTriangle size={16} stroke={2} />
              Estoque baixo de refis! Apenas {cushionKit.stockRefis} restante(s).
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="dashboard-section">
          <h2>Informações do Produto</h2>
          <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="kit-name" style={{ display: 'block', color: '#bfb3a2', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Nome do Kit</label>
              <input
                id="kit-name"
                name="name"
                value={productForm.name}
                onChange={handleProductChange}
                placeholder="Ex: Kit Refil de Almofada"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(72, 55, 38, 0.35)',
                  border: '1px solid rgba(217, 177, 84, 0.12)',
                  borderRadius: '10px',
                  color: '#e8e1d4',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="kit-desc" style={{ display: 'block', color: '#bfb3a2', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Descrição</label>
              <textarea
                id="kit-desc"
                name="description"
                value={productForm.description}
                onChange={handleProductChange}
                rows="3"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(72, 55, 38, 0.35)',
                  border: '1px solid rgba(217, 177, 84, 0.12)',
                  borderRadius: '10px',
                  color: '#e8e1d4',
                  fontSize: '0.95rem',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label htmlFor="kit-price" style={{ display: 'block', color: '#bfb3a2', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Preço à Vista</label>
                <input
                  id="kit-price"
                  name="priceCash"
                  value={productForm.priceCash}
                  onChange={handleProductChange}
                  placeholder="R$ 0,00"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(72, 55, 38, 0.35)',
                    border: '1px solid rgba(217, 177, 84, 0.12)',
                    borderRadius: '10px',
                    color: '#e8e1d4',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="kit-installment" style={{ display: 'block', color: '#bfb3a2', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Preço Parcela</label>
                <input
                  id="kit-installment"
                  name="priceInstallment"
                  value={productForm.priceInstallment}
                  onChange={handleProductChange}
                  placeholder="R$ 0,00"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(72, 55, 38, 0.35)',
                    border: '1px solid rgba(217, 177, 84, 0.12)',
                    borderRadius: '10px',
                    color: '#e8e1d4',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label htmlFor="kit-installments" style={{ display: 'block', color: '#bfb3a2', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Nº de Parcelas</label>
                <input
                  id="kit-installments"
                  name="installments"
                  type="number"
                  min="1"
                  value={productForm.installments}
                  onChange={handleProductChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(72, 55, 38, 0.35)',
                    border: '1px solid rgba(217, 177, 84, 0.12)',
                    borderRadius: '10px',
                    color: '#e8e1d4',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="kit-sizes" style={{ display: 'block', color: '#bfb3a2', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Tamanhos (vírgula)</label>
                <input
                  id="kit-sizes"
                  value={sizesText}
                  onChange={(e) => setSizesText(e.target.value)}
                  placeholder="45x45, 50x50"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(72, 55, 38, 0.35)',
                    border: '1px solid rgba(217, 177, 84, 0.12)',
                    borderRadius: '10px',
                    color: '#e8e1d4',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="kit-image" style={{ display: 'block', color: '#bfb3a2', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>URL da Imagem</label>
              <input
                id="kit-image"
                name="image"
                value={productForm.image}
                onChange={handleProductChange}
                placeholder="https://..."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(72, 55, 38, 0.35)',
                  border: '1px solid rgba(217, 177, 84, 0.12)',
                  borderRadius: '10px',
                  color: '#e8e1d4',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="kit-features" style={{ display: 'block', color: '#bfb3a2', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Características (vírgula)</label>
              <input
                id="kit-features"
                name="features"
                value={productForm.features}
                onChange={handleProductChange}
                placeholder="Kit com 5 unidades, Tecido Oxford"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(72, 55, 38, 0.35)',
                  border: '1px solid rgba(217, 177, 84, 0.12)',
                  borderRadius: '10px',
                  color: '#e8e1d4',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {saved ? <IconCheck size={18} stroke={2} /> : <IconDeviceFloppy size={18} stroke={2} />}
              {saved ? 'Salvo!' : 'Salvar Alterações'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CushionKitPage;

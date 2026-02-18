/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { categories as defaultCategories, products as defaultProducts } from '../../data/products';

const AdminContext = createContext(null);

const STORAGE_KEY_ADMIN = 'mmartin_admin_auth';
const STORAGE_KEY_PRODUCTS = 'mmartin_admin_products';
const STORAGE_KEY_ORDERS = 'mmartin_admin_orders';
const STORAGE_KEY_STOCK = 'mmartin_admin_stock';
const STORAGE_KEY_CUSHION_KIT = 'mmartin_cushion_kit';

const defaultCushionKit = {
  colors: ['Preto', 'Branco', 'Azul Marinho', 'Cinza Rato', 'Rosê', 'Terracota', 'Bege', 'Bordô'],
  sizes: ['45x45', '50x50'],
  stockCapas: {
    'Preto': 0,
    'Branco': 0,
    'Azul Marinho': 0,
    'Cinza Rato': 0,
    'Rosê': 0,
    'Terracota': 0,
    'Bege': 0,
    'Bordô': 0,
  },
  stockRefis: 0,
  pricingCapas: {
    priceCash: '',
    priceInstallment: '',
    installments: 5,
  },
  pricingRefis: {
    priceCash: '',
    priceInstallment: '',
    installments: 5,
  },
  product: {
    id: 'cushion-kit',
    category: 'almofadas',
    name: 'Kit Refil de Almofada 45x45 ou 50x50',
    description: 'Kit com 5 almofadas em tecido Oxford, fibra siliconada 500g. Escolha as cores de cada uma!',
    price: 'R$ 48,00',
    priceInstallment: 'R$ 53,90',
    installments: 5,
    priceCash: 'R$ 48,00',
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600',
    features: ['Kit com 5 unidades', 'Tecido Oxford', 'Fibra siliconada 500g', 'Cores variadas'],
    isKit: true,
    kitQuantity: 5,
  },
};

const ADMIN_CREDENTIALS = {
  user: import.meta.env.VITE_ADMIN_USER || 'admin',
  pass: import.meta.env.VITE_ADMIN_PASS || 'mmartin2026',
};

function loadFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return fallback;
}

function initStock(products) {
  const stock = {};
  for (const p of products) {
    stock[p.id] = { quantity: 50, minStock: 5 };
  }
  stock['cushion-kit'] = { quantity: 50, minStock: 5 };
  return stock;
}

export function AdminProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [products, setProducts] = useState(() => {
    return loadFromStorage(STORAGE_KEY_PRODUCTS, defaultProducts);
  });

  const [orders, setOrders] = useState(() => {
    return loadFromStorage(STORAGE_KEY_ORDERS, []);
  });

  const [stock, setStock] = useState(() => {
    const saved = loadFromStorage(STORAGE_KEY_STOCK, null);
    if (saved) return saved;
    return initStock(defaultProducts);
  });

  const [categories] = useState(defaultCategories);

  const [cushionKit, setCushionKit] = useState(() => {
    const loaded = loadFromStorage(STORAGE_KEY_CUSHION_KIT, defaultCushionKit);
    // Ensure backward compatibility: add stockCapas and stockRefis if missing
    const migrated = { ...loaded };
    if (!migrated.stockCapas) {
      migrated.stockCapas = {};
      for (const color of migrated.colors) {
        migrated.stockCapas[color] = 0;
      }
    }
    if (migrated.stockRefis === undefined) {
      migrated.stockRefis = 0;
    }
    if (!migrated.pricingCapas) {
      migrated.pricingCapas = { priceCash: '', priceInstallment: '', installments: 5 };
    }
    if (!migrated.pricingRefis) {
      migrated.pricingRefis = { priceCash: '', priceInstallment: '', installments: 5 };
    }
    return migrated;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STOCK, JSON.stringify(stock));
  }, [stock]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CUSHION_KIT, JSON.stringify(cushionKit));
  }, [cushionKit]);

  const login = useCallback(() => {
    // This function is now deprecated as we use Firebase Auth
    // Kept for backward compatibility but does nothing
    console.warn('[AdminContext] login() is deprecated. Use AuthContext instead.');
    return false;
  }, []);

  const logout = useCallback(() => {
    // This function is now deprecated as we use Firebase Auth
    // Kept for backward compatibility but does nothing
    console.warn('[AdminContext] logout() is deprecated. Use AuthContext instead.');
  }, []);

  const addProduct = useCallback((product) => {
    const newId = crypto.randomUUID();
    const newProduct = { ...product, id: newId };
    setProducts(prev => [...prev, newProduct]);
    setStock(prev => ({ ...prev, [newId]: { quantity: product.stockQuantity || 0, minStock: product.minStock || 5 } }));
    return newProduct;
  }, []);

  const updateProduct = useCallback((id, data) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    if (data.stockQuantity !== undefined || data.minStock !== undefined) {
      setStock(prev => ({
        ...prev,
        [id]: {
          quantity: data.stockQuantity !== undefined ? Math.max(0, parseInt(data.stockQuantity, 10) || 0) : (prev[id]?.quantity ?? 0),
          minStock: data.minStock !== undefined ? Math.max(0, parseInt(data.minStock, 10) || 5) : (prev[id]?.minStock ?? 5),
        }
      }));
    }
  }, []);

  const deleteProduct = useCallback((id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setStock(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const updateStock = useCallback((productId, quantity) => {
    setStock(prev => ({
      ...prev,
      [productId]: { ...prev[productId], quantity: Math.max(0, quantity) }
    }));
  }, []);

  const updateMinStock = useCallback((productId, minStock) => {
    setStock(prev => ({
      ...prev,
      [productId]: { ...prev[productId], minStock: Math.max(0, minStock) }
    }));
  }, []);

  const addOrder = useCallback((order) => {
    const newOrder = {
      ...order,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      status: 'pendente',
    };
    setOrders(prev => [newOrder, ...prev]);
    if (order.items && Array.isArray(order.items)) {
      setStock(prev => {
        const next = { ...prev };
        for (const item of order.items) {
          const pid = item.productId || item.id;
          if (pid && next[pid]) {
            const qty = item.quantity || 1;
            next[pid] = { ...next[pid], quantity: Math.max(0, next[pid].quantity - qty) };
          }
        }
        return next;
      });
    }
    return newOrder;
  }, []);

  const updateOrderStatus = useCallback((orderId, status) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  }, []);

  const updateCushionKit = useCallback((newConfig) => {
    setCushionKit(prev => {
      const updated = { ...prev, ...newConfig };
      
      // If colors changed, update stockCapas accordingly
      if (newConfig.colors) {
        const newStockCapas = { ...prev.stockCapas };
        
        // Add new colors with stock 0
        for (const color of newConfig.colors) {
          if (!newStockCapas[color]) {
            newStockCapas[color] = 0;
          }
        }
        
        // Remove colors that are no longer in the list
        for (const color of Object.keys(newStockCapas)) {
          if (!newConfig.colors.includes(color)) {
            delete newStockCapas[color];
          }
        }
        
        updated.stockCapas = newStockCapas;
      }
      
      return updated;
    });
  }, []);

  const updateCapaStock = useCallback((color, quantity) => {
    setCushionKit(prev => ({
      ...prev,
      stockCapas: {
        ...prev.stockCapas,
        [color]: Math.max(0, quantity)
      }
    }));
  }, []);

  const updateRefilStock = useCallback((quantity) => {
    setCushionKit(prev => ({
      ...prev,
      stockRefis: Math.max(0, quantity)
    }));
  }, []);

  const getLowStockProducts = useCallback(() => {
    return products.filter(p => {
      const s = stock[p.id];
      return s && s.quantity > 0 && s.quantity <= s.minStock;
    });
  }, [products, stock]);

  const getOutOfStockProducts = useCallback(() => {
    const outOfStock = products.filter(p => {
      const s = stock[p.id];
      return s && s.quantity <= 0;
    });
    const cushionKitStock = stock['cushion-kit'];
    if (cushionKitStock && cushionKitStock.quantity <= 0 && !products.some(p => p.id === 'cushion-kit')) {
      outOfStock.push({ id: 'cushion-kit', name: 'Kit Almofadas' });
    }
    return outOfStock;
  }, [products, stock]);

  const getTotalStockValue = useCallback(() => {
    let total = 0;
    for (const p of products) {
      const s = stock[p.id];
      if (s) {
        const price = parseFloat(p.price.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()) || 0;
        total += price * s.quantity;
      }
    }
    return total;
  }, [products, stock]);

  const value = {
    isAuthenticated,
    login,
    logout,
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    stock,
    updateStock,
    updateMinStock,
    orders,
    addOrder,
    updateOrderStatus,
    getLowStockProducts,
    getOutOfStockProducts,
    getTotalStockValue,
    cushionKit,
    updateCushionKit,
    updateCapaStock,
    updateRefilStock,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

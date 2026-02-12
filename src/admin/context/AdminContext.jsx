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
    return loadFromStorage(STORAGE_KEY_CUSHION_KIT, defaultCushionKit);
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
    return newOrder;
  }, []);

  const updateOrderStatus = useCallback((orderId, status) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  }, []);

  const updateCushionKit = useCallback((newConfig) => {
    setCushionKit(prev => ({ ...prev, ...newConfig }));
  }, []);

  const getLowStockProducts = useCallback(() => {
    return products.filter(p => {
      const s = stock[p.id];
      return s && s.quantity <= s.minStock;
    });
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
    getTotalStockValue,
    cushionKit,
    updateCushionKit,
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

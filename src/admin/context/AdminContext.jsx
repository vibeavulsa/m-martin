/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as db from '../../services/dbService';

const AdminContext = createContext(null);

// localStorage keys kept as a fast-loading cache while the DB request is in flight
const STORAGE_KEY_PRODUCTS = 'mmartin_admin_products';
const STORAGE_KEY_ORDERS = 'mmartin_admin_orders';
const STORAGE_KEY_STOCK = 'mmartin_admin_stock';
const STORAGE_KEY_CUSHION_KIT = 'mmartin_cushion_kit';
const STORAGE_KEY_CATEGORIES = 'mmartin_admin_categories';

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

function loadFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return fallback;
}

/** Convert the flat stock rows from the DB into the map shape used in state. */
function stockRowsToMap(rows) {
  const map = {};
  for (const row of rows) {
    map[row.productId] = { quantity: row.quantity, minStock: row.minStock };
  }
  return map;
}

/** Ensure backward-compat fields are present on the cushionKit object. */
function migrateCushionKit(loaded) {
  const migrated = { ...loaded };
  if (!migrated.stockCapas) {
    migrated.stockCapas = {};
    for (const color of migrated.colors) {
      migrated.stockCapas[color] = 0;
    }
  }
  if (migrated.stockRefis === undefined) migrated.stockRefis = 0;
  if (!migrated.pricingCapas) migrated.pricingCapas = { priceCash: '', priceInstallment: '', installments: 5 };
  if (!migrated.pricingRefis) migrated.pricingRefis = { priceCash: '', priceInstallment: '', installments: 5 };
  return migrated;
}

export function AdminProvider({ children }) {
  const { isAuthenticated } = useAuth();

  // ── Initial state from localStorage (instant) ──────────────────────────────
  const [products, setProducts] = useState(() =>
    loadFromStorage(STORAGE_KEY_PRODUCTS, [])
  );
  const [orders, setOrders] = useState(() =>
    loadFromStorage(STORAGE_KEY_ORDERS, [])
  );
  const [stock, setStock] = useState(() => {
    return loadFromStorage(STORAGE_KEY_STOCK, {});
  });
  const [categories, setCategories] = useState(() =>
    loadFromStorage(STORAGE_KEY_CATEGORIES, [])
  );
  const [cushionKit, setCushionKit] = useState(() =>
    migrateCushionKit(loadFromStorage(STORAGE_KEY_CUSHION_KIT, defaultCushionKit))
  );

  // Track whether we have already seeded the DB with default data this session
  const dbSeeded = useRef(false);

  // ── Load authoritative data from Vercel Postgres on mount ──────────────────
  useEffect(() => {
    if (dbSeeded.current) return;
    dbSeeded.current = true;

    async function loadFromDb() {
      try {
        const [dbProducts, stockRows, dbOrders, dbKit, dbCategories] = await Promise.all([
          db.fetchProducts(),
          db.fetchStock(),
          db.fetchOrders(),
          db.fetchCushionKit(),
          db.fetchCategories(),
        ]);

        // If DB is empty, seed initial data and re-fetch
        const needsSeed = (!Array.isArray(dbProducts) || dbProducts.length === 0)
          && (!Array.isArray(dbCategories) || dbCategories.length === 0);

        if (needsSeed) {
          await db.seedData().catch(() => {});
          // Re-fetch after seeding
          const [seededProducts, seededCategories] = await Promise.all([
            db.fetchProducts(),
            db.fetchCategories(),
          ]);
          if (Array.isArray(seededProducts) && seededProducts.length > 0) {
            setProducts(seededProducts);
            localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(seededProducts));
          }
          if (Array.isArray(seededCategories) && seededCategories.length > 0) {
            setCategories(seededCategories);
            localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(seededCategories));
          }
        } else {
          // Products
          if (Array.isArray(dbProducts) && dbProducts.length > 0) {
            setProducts(dbProducts);
            localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(dbProducts));
          }

          // Categories
          if (Array.isArray(dbCategories) && dbCategories.length > 0) {
            setCategories(dbCategories);
            localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(dbCategories));
          }
        }

        // Stock
        if (Array.isArray(stockRows) && stockRows.length > 0) {
          const stockMap = stockRowsToMap(stockRows);
          setStock(stockMap);
          localStorage.setItem(STORAGE_KEY_STOCK, JSON.stringify(stockMap));
        }

        // Orders
        if (Array.isArray(dbOrders)) {
          setOrders(dbOrders);
          localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(dbOrders));
        }

        // Cushion Kit
        if (dbKit) {
          const migrated = migrateCushionKit(dbKit);
          setCushionKit(migrated);
          localStorage.setItem(STORAGE_KEY_CUSHION_KIT, JSON.stringify(migrated));
        }
      } catch (err) {
        // DB not available (e.g. POSTGRES_URL not set) — keep localStorage data
        console.warn('[AdminContext] Vercel Postgres unavailable, using localStorage:', err.message);
      }
    }

    loadFromDb();
  }, []);

  // ── Mirror state changes to localStorage (cache) ───────────────────────────
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

  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    }
  }, [categories]);

  // ── Deprecated auth helpers (kept for backwards-compat) ────────────────────
  const login = useCallback(() => {
    console.warn('[AdminContext] login() is deprecated. Use AuthContext instead.');
    return false;
  }, []);

  const logout = useCallback(() => {
    console.warn('[AdminContext] logout() is deprecated. Use AuthContext instead.');
  }, []);

  // ── Products ───────────────────────────────────────────────────────────────
  const addProduct = useCallback((product) => {
    const newId = crypto.randomUUID();
    const newProduct = { ...product, id: newId };
    setProducts(prev => [...prev, newProduct]);
    setStock(prev => ({
      ...prev,
      [newId]: { quantity: product.stockQuantity || 0, minStock: product.minStock || 5 },
    }));
    db.createProduct(newProduct).catch(err =>
      console.error('[AdminContext] createProduct failed:', err)
    );
    db.upsertStock(newId, product.stockQuantity || 0, product.minStock || 5).catch(() => {});
    return newProduct;
  }, []);

  const updateProduct = useCallback((id, data) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    if (data.stockQuantity !== undefined || data.minStock !== undefined) {
      setStock(prev => {
        const next = {
          ...prev,
          [id]: {
            quantity: data.stockQuantity !== undefined
              ? Math.max(0, parseInt(data.stockQuantity, 10) || 0)
              : (prev[id]?.quantity ?? 0),
            minStock: data.minStock !== undefined
              ? Math.max(0, parseInt(data.minStock, 10) || 5)
              : (prev[id]?.minStock ?? 5),
          },
        };
        db.upsertStock(id, next[id].quantity, next[id].minStock).catch(() => {});
        return next;
      });
    }
    db.updateProduct({ id, ...data }).catch(err =>
      console.error('[AdminContext] updateProduct failed:', err)
    );
  }, []);

  const deleteProduct = useCallback((id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setStock(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    db.deleteProduct(id).catch(err =>
      console.error('[AdminContext] deleteProduct failed:', err)
    );
  }, []);

  // ── Stock ──────────────────────────────────────────────────────────────────
  const updateStock = useCallback((productId, quantity) => {
    setStock(prev => {
      const qty = Math.max(0, quantity);
      const minStock = prev[productId]?.minStock ?? 5;
      db.upsertStock(productId, qty, minStock).catch(() => {});
      return { ...prev, [productId]: { ...prev[productId], quantity: qty } };
    });
  }, []);

  const updateMinStock = useCallback((productId, minStock) => {
    setStock(prev => {
      const ms = Math.max(0, minStock);
      const quantity = prev[productId]?.quantity ?? 0;
      db.upsertStock(productId, quantity, ms).catch(() => {});
      return { ...prev, [productId]: { ...prev[productId], minStock: ms } };
    });
  }, []);

  // ── Orders ─────────────────────────────────────────────────────────────────
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
            const newQty = Math.max(0, next[pid].quantity - qty);
            next[pid] = { ...next[pid], quantity: newQty };
            db.upsertStock(pid, newQty, next[pid].minStock).catch(() => {});
          }
        }
        return next;
      });
    }
    db.createOrder(newOrder).catch(err =>
      console.error('[AdminContext] createOrder failed:', err)
    );
    return newOrder;
  }, []);

  const updateOrderStatus = useCallback((orderId, status) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    db.updateOrderStatus(orderId, status).catch(err =>
      console.error('[AdminContext] updateOrderStatus failed:', err)
    );
  }, []);

  // ── Cushion Kit ────────────────────────────────────────────────────────────
  const updateCushionKit = useCallback((newConfig) => {
    setCushionKit(prev => {
      const updated = { ...prev, ...newConfig };
      if (newConfig.colors) {
        const newStockCapas = { ...prev.stockCapas };
        for (const color of newConfig.colors) {
          if (!newStockCapas[color]) newStockCapas[color] = 0;
        }
        for (const color of Object.keys(newStockCapas)) {
          if (!newConfig.colors.includes(color)) delete newStockCapas[color];
        }
        updated.stockCapas = newStockCapas;
      }
      db.saveCushionKit(updated).catch(err =>
        console.error('[AdminContext] saveCushionKit failed:', err)
      );
      return updated;
    });
  }, []);

  const updateCapaStock = useCallback((color, quantity) => {
    setCushionKit(prev => {
      const updated = {
        ...prev,
        stockCapas: { ...prev.stockCapas, [color]: Math.max(0, quantity) },
      };
      db.saveCushionKit(updated).catch(() => {});
      return updated;
    });
  }, []);

  const updateRefilStock = useCallback((quantity) => {
    setCushionKit(prev => {
      const updated = { ...prev, stockRefis: Math.max(0, quantity) };
      db.saveCushionKit(updated).catch(() => {});
      return updated;
    });
  }, []);

  // ── Computed helpers ───────────────────────────────────────────────────────
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
        const price = parseFloat(
          p.price.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()
        ) || 0;
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

import { Component, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import * as dbApi from './services/dbService';
import Header from './components/Header';
import Hero from './components/Hero';
import CategorySection from './components/CategorySection';
import ProductCard from './components/ProductCard';
import CushionKitBanner from './components/CushionKitBanner';
import PillowBanner from './components/PillowBanner';
import CartDialog from './components/CartDialog';
import CustomerDialog from './components/CustomerDialog';
import CheckoutDialog from './components/CheckoutDialog';
import OrderConfirmationDialog from './components/OrderConfirmationDialog';
import UserProfileDialog from './components/UserProfileDialog';
import AuthDialog from './components/AuthDialog';
import SettingsDialog from './components/SettingsDialog';

import TestimonialsSection from './components/TestimonialsSection';
import NewsletterSignup from './components/NewsletterSignup';
import { CartProvider, useCart } from './context/CartContext';
import { UserProvider, useUser } from './context/UserContext';
import { categorySettingKey } from './utils/homeDisplayUtils';
import { products as staticProducts, categories as staticCategories } from './data/products';
import './App.css';

const STORAGE_KEY_PRODUCTS = 'mmartin_admin_products';
const STORAGE_KEY_CUSHION_KIT = 'mmartin_cushion_kit';
const STORAGE_KEY_CATEGORIES = 'mmartin_admin_categories';

function loadFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch { /* localStorage unavailable or corrupt, use fallback */ }
  return fallback;
}

function* geradorDeMostruario(linhasProdutos, inventarioGeral) {
  for (const linha of linhasProdutos) {
    const pecasLinha = [];
    for (const peca of inventarioGeral) {
      if (peca.category === linha.id) {
        pecasLinha.push(peca);
      }
    }
    yield { metadadosLinha: linha, colecaoPecas: pecasLinha };
  }
}

function SalesDialogs() {
  const [cartOpen, setCartOpen] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const { setCustomer, clearCart } = useCart();

  const handleOpenCart = useCallback(() => setCartOpen(true), []);
  const handleCloseCart = useCallback(() => setCartOpen(false), []);
  const handleOpenProfile = useCallback(() => setProfileOpen(true), []);
  const handleCloseProfile = useCallback(() => setProfileOpen(false), []);
  const handleOpenSettings = useCallback(() => setSettingsOpen(true), []);
  const handleCloseSettings = useCallback(() => setSettingsOpen(false), []);
  const handleOpenAuth = useCallback(() => setAuthOpen(true), []);
  const handleCloseAuth = useCallback(() => setAuthOpen(false), []);

  const handleCheckout = useCallback(() => {
    setCartOpen(false);
    setCustomerOpen(true);
  }, []);

  const handleCloseCustomer = useCallback(() => setCustomerOpen(false), []);

  const handleCustomerSubmit = useCallback((data) => {
    setCustomer(data);
    setCustomerOpen(false);
    setCheckoutOpen(true);
  }, [setCustomer]);

  const handleCloseCheckout = useCallback(() => setCheckoutOpen(false), []);

  const handleBackToCustomer = useCallback(() => {
    setCheckoutOpen(false);
    setCustomerOpen(true);
  }, []);

  const handleConfirmOrder = useCallback((orderId) => {
    setCheckoutOpen(false);
    setConfirmationOpen(true);
    setOrderNumber(orderId || Math.floor(100000 + Math.random() * 900000).toString());
    clearCart();
  }, [clearCart]);

  const handleCloseConfirmation = useCallback(() => {
    setConfirmationOpen(false);
    setOrderNumber(null);
  }, []);

  return (
    <>
      <Header
        onCartClick={handleOpenCart}
        onProfileClick={handleOpenProfile}
        onSettingsClick={handleOpenSettings}
        onAuthClick={handleOpenAuth}
      />
      <AuthDialog
        isOpen={authOpen}
        onClose={handleCloseAuth}
      />
      <CartDialog
        isOpen={cartOpen}
        onClose={handleCloseCart}
        onCheckout={handleCheckout}
      />
      <CustomerDialog
        isOpen={customerOpen}
        onClose={handleCloseCustomer}
        onSubmit={handleCustomerSubmit}
      />
      <CheckoutDialog
        isOpen={checkoutOpen}
        onClose={handleCloseCheckout}
        onConfirm={handleConfirmOrder}
        onBack={handleBackToCustomer}
      />
      <OrderConfirmationDialog
        isOpen={confirmationOpen}
        onClose={handleCloseConfirmation}
        orderNumber={orderNumber}
      />
      <UserProfileDialog
        isOpen={profileOpen}
        onClose={handleCloseProfile}
      />
      <SettingsDialog
        isOpen={settingsOpen}
        onClose={handleCloseSettings}
      />
    </>
  );
}

class AppCatalog extends Component {
  obterExposicoesMontadas() {
    const { categories, products } = this.props;
    const expositor = geradorDeMostruario(categories, products);
    const todasExposicoes = [];
    let proximaExposicao = expositor.next();

    while (!proximaExposicao.done) {
      todasExposicoes.push(proximaExposicao.value);
      proximaExposicao = expositor.next();
    }

    return todasExposicoes;
  }

  renderizarInformacoesCorporativas() {
    const corpus = {
      marca: 'M\'Martin Estofados',
      identificadorProjeto: 'm-martin-estofados',
      codigoNumerico: '178643218861'
    };

    return (
      <motion.footer
        className="site-footer"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="footer-content">
          <div className="footer-info">
            <h3>{corpus.marca}</h3>
            <p className="footer-slogan">Conforto e Elegância em Cada Detalhe</p>
            <p>Sofás, almofadas, travesseiros e linha hospitalar com qualidade que você sente ao toque.</p>
          </div>
          <div className="footer-contact">
            <p className="footer-cta">Solicite seu orçamento — atendimento personalizado</p>
            <p>© 2026 M&apos;Martin. Todos os direitos reservados.</p>
          </div>
        </div>
      </motion.footer>
    );
  }

  gerarCartaoPeca(peca, posicionamento) {
    return <ProductCard key={`mostruario-peca-${peca.id}-pos-${posicionamento}`} product={peca} />;
  }

  gerarGradePecas(colecao) {
    const cartoesMontados = [];
    let posicao = 0;

    while (posicao < colecao.length) {
      cartoesMontados.push(this.gerarCartaoPeca(colecao[posicao], posicao));
      posicao += 1;
    }

    return cartoesMontados;
  }

  gerarExposicaoCompleta(exposicao, numeroExposicao) {
    if (exposicao.metadadosLinha.id === 'almofadas') {
      return (
        <section key={`expositor-numero-${numeroExposicao}`} className="category-group">
          <CategorySection category={exposicao.metadadosLinha} />
          <CushionKitBanner kitConfig={this.props.cushionKit} />
        </section>
      );
    }
    if (exposicao.metadadosLinha.id === 'travesseiros') {
      // Pass the first product of pillows, if any, otherwise fallback logic in component handles it.
      const pillowProduct = exposicao.colecaoPecas[0] || null;
      return (
        <section key={`expositor-numero-${numeroExposicao}`} className="category-group">
          <CategorySection category={exposicao.metadadosLinha} />
          <PillowBanner product={pillowProduct} />
        </section>
      );
    }
    return (
      <section key={`expositor-numero-${numeroExposicao}`} className="category-group">
        <CategorySection category={exposicao.metadadosLinha} />
        <div className="products-grid">
          {this.gerarGradePecas(exposicao.colecaoPecas)}
        </div>
      </section>
    );
  }

  gerarTodasExposicoes() {
    const exposicoes = this.obterExposicoesMontadas();
    const elementosExposicao = [];
    let numeroAtual = 0;

    while (numeroAtual < exposicoes.length) {
      elementosExposicao.push(
        this.gerarExposicaoCompleta(exposicoes[numeroAtual], numeroAtual)
      );
      numeroAtual += 1;
    }

    return elementosExposicao;
  }

  render() {
    const { homeDisplaySettings } = this.props;
    return (
      <>
        <SalesDialogs />
        <Hero />
        <main className="catalog-container">
          {this.gerarTodasExposicoes()}
        </main>
        {homeDisplaySettings.showTestimonials !== false && <TestimonialsSection />}
        {homeDisplaySettings.showNewsletter !== false && <NewsletterSignup />}
        {this.renderizarInformacoesCorporativas()}
      </>
    );
  }
}

function AppContent({ categories, products, cushionKit }) {
  const { homeDisplaySettings } = useUser();

  const visibleCategories = categories.filter(
    (c) => homeDisplaySettings[categorySettingKey(c.id)] !== false
  );

  return (
    <div className="app-wrapper">
      <AppCatalog
        categories={visibleCategories}
        products={products}
        cushionKit={cushionKit}
        homeDisplaySettings={homeDisplaySettings}
      />
    </div>
  );
}

function App() {
  const [categories, setCategories] = useState(() => {
    return loadFromStorage(STORAGE_KEY_CATEGORIES, staticCategories);
  });
  const [products, setProducts] = useState(() => {
    return loadFromStorage(STORAGE_KEY_PRODUCTS, staticProducts);
  });
  const [cushionKit, setCushionKit] = useState(() => {
    return loadFromStorage(STORAGE_KEY_CUSHION_KIT, null);
  });

  useEffect(() => {
    async function loadFromDB() {
      try {
        const [dbProducts, dbCategories, dbKit] = await Promise.all([
          dbApi.fetchProducts(),
          dbApi.fetchCategories(),
          dbApi.fetchCushionKit(),
        ]);

        // Seed DB if empty, then re-fetch
        const needsSeed = (!Array.isArray(dbProducts) || dbProducts.length === 0)
          || (!Array.isArray(dbCategories) || dbCategories.length === 0);

        if (needsSeed) {
          await dbApi.seedData().catch(() => { });
          const [seededProducts, seededCategories] = await Promise.all([
            dbApi.fetchProducts(),
            dbApi.fetchCategories(),
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
          if (Array.isArray(dbProducts) && dbProducts.length > 0) {
            setProducts(dbProducts);
            localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(dbProducts));
          }

          if (Array.isArray(dbCategories) && dbCategories.length > 0) {
            // Auto-sync: if DB has fewer categories than our static file, update DB
            if (dbCategories.length < staticCategories.length) {
              await dbApi.saveCategories(staticCategories).catch(() => { });
              setCategories(staticCategories);
              localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(staticCategories));
            } else {
              setCategories(dbCategories);
              localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(dbCategories));
            }
          }
        }

        if (dbKit) {
          setCushionKit(dbKit);
          localStorage.setItem(STORAGE_KEY_CUSHION_KIT, JSON.stringify(dbKit));
        }
      } catch {
        // DB unavailable — use localStorage cache
      }
    }
    loadFromDB();
  }, []);

  // Filter out almofadas products from the regular product list
  // (they are now shown via the CushionKitBanner)
  const displayProducts = products.filter(p => p.category !== 'almofadas');

  return (
    <UserProvider>
      <CartProvider>
        <AppContent
          categories={categories}
          products={displayProducts}
          cushionKit={cushionKit}
        />
      </CartProvider>
    </UserProvider>
  );
}

export default App;

import { Component, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { collection, getDocs } from 'firebase/firestore';
import { db } from './config/firebase';
import Header from './components/Header';
import Hero from './components/Hero';
import CategorySection from './components/CategorySection';
import ProductCard from './components/ProductCard';
import CushionKitBanner from './components/CushionKitBanner';
import CartDialog from './components/CartDialog';
import CustomerDialog from './components/CustomerDialog';
import CheckoutDialog from './components/CheckoutDialog';
import OrderConfirmationDialog from './components/OrderConfirmationDialog';
import UserProfileDialog from './components/UserProfileDialog';
import SettingsDialog from './components/SettingsDialog';
import LoyaltyProgramBanner from './components/LoyaltyProgramBanner';
import TestimonialsSection from './components/TestimonialsSection';
import NewsletterSignup from './components/NewsletterSignup';
import { CartProvider, useCart } from './context/CartContext';
import { UserProvider } from './context/UserContext';
import { categories as fallbackCategories, products as fallbackProducts } from './data/products';
import './App.css';

const STORAGE_KEY_PRODUCTS = 'mmartin_admin_products';
const STORAGE_KEY_CUSHION_KIT = 'mmartin_cushion_kit';

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
  const [orderNumber, setOrderNumber] = useState(null);
  const { setCustomer, clearCart } = useCart();

  const handleOpenCart = useCallback(() => setCartOpen(true), []);
  const handleCloseCart = useCallback(() => setCartOpen(false), []);
  const handleOpenProfile = useCallback(() => setProfileOpen(true), []);
  const handleCloseProfile = useCallback(() => setProfileOpen(false), []);
  const handleOpenSettings = useCallback(() => setSettingsOpen(true), []);
  const handleCloseSettings = useCallback(() => setSettingsOpen(false), []);

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
    return (
      <>
        <SalesDialogs />
        <Hero />
        <LoyaltyProgramBanner />
        <main className="catalog-container">
          {this.gerarTodasExposicoes()}
        </main>
        <TestimonialsSection />
        <NewsletterSignup />
        {this.renderizarInformacoesCorporativas()}
      </>
    );
  }
}

function App() {
  const [categories, setCategories] = useState(fallbackCategories);
  const [products, setProducts] = useState(() => {
    return loadFromStorage(STORAGE_KEY_PRODUCTS, fallbackProducts);
  });
  const [cushionKit, setCushionKit] = useState(() => {
    return loadFromStorage(STORAGE_KEY_CUSHION_KIT, null);
  });

  useEffect(() => {
    async function loadFromDB() {
      try {
        const prodSnap = await getDocs(collection(db, 'products'));
        if (!prodSnap.empty) {
          const dbProducts = prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setProducts(dbProducts);
        }

        const catSnap = await getDocs(collection(db, 'categories'));
        if (!catSnap.empty) {
          const dbCategories = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setCategories(dbCategories);
        }

        const kitSnap = await getDocs(collection(db, 'cushionKit'));
        if (!kitSnap.empty) {
          const kitDoc = kitSnap.docs[0];
          setCushionKit({ id: kitDoc.id, ...kitDoc.data() });
        }
      } catch {
        // DB unavailable (offline, no credentials, etc.), use localStorage/fallback data
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
        <div className="app-wrapper">
          <AppCatalog
            categories={categories}
            products={displayProducts}
            cushionKit={cushionKit}
          />
        </div>
      </CartProvider>
    </UserProvider>
  );
}

export default App;

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider } from './context/AdminContext';
import AdminLayout from './components/AdminLayout';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const StockPage = lazy(() => import('./pages/StockPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const CushionKitPage = lazy(() => import('./pages/CushionKitPage'));
const PaymentSettingsPage = lazy(() => import('./pages/PaymentSettingsPage'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));

const AdminRoutes = () => {
  return (
    <AdminProvider>
      <Suspense fallback={<div style={{ padding: '2rem', color: '#fff' }}>Carregando Painel Administrativo...</div>}>
        <Routes>
          <Route path="/*" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="produtos" element={<ProductsPage />} />
            <Route path="almofadas" element={<CushionKitPage />} />
            <Route path="estoque" element={<StockPage />} />
            <Route path="pedidos" element={<OrdersPage />} />
            <Route path="pagamentos" element={<PaymentSettingsPage />} />
            <Route path="avaliacoes" element={<ReviewsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </AdminProvider>
  );
};

export default AdminRoutes;

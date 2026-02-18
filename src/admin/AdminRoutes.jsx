import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider } from './context/AdminContext';
import AdminLayout from './components/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import StockPage from './pages/StockPage';
import OrdersPage from './pages/OrdersPage';
import CushionKitPage from './pages/CushionKitPage';
import PaymentSettingsPage from './pages/PaymentSettingsPage';

const AdminRoutes = () => {
  return (
    <AdminProvider>
      <Routes>
        <Route path="/*" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="produtos" element={<ProductsPage />} />
          <Route path="almofadas" element={<CushionKitPage />} />
          <Route path="estoque" element={<StockPage />} />
          <Route path="pedidos" element={<OrdersPage />} />
          <Route path="pagamentos" element={<PaymentSettingsPage />} />
        </Route>
      </Routes>
    </AdminProvider>
  );
};

export default AdminRoutes;

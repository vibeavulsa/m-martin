import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider, useAdmin } from './context/AdminContext';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import StockPage from './pages/StockPage';
import OrdersPage from './pages/OrdersPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAdmin();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
}

function AdminLoginRoute() {
  const { isAuthenticated } = useAdmin();
  if (isAuthenticated) return <Navigate to="/admin" replace />;
  return <LoginPage />;
}

const AdminRoutes = () => {
  return (
    <AdminProvider>
      <Routes>
        <Route path="login" element={<AdminLoginRoute />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="produtos" element={<ProductsPage />} />
          <Route path="estoque" element={<StockPage />} />
          <Route path="pedidos" element={<OrdersPage />} />
        </Route>
      </Routes>
    </AdminProvider>
  );
};

export default AdminRoutes;

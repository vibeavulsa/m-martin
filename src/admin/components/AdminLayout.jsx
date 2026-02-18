import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  IconDashboard,
  IconPackage,
  IconBoxSeam,
  IconReceipt,
  IconArrowLeft,
  IconLogout,
  IconPalette,
  IconCreditCard,
} from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import '../Admin.css';

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>M&apos;Martin</h2>
          <span>Painel Admin</span>
        </div>
        <nav className="admin-sidebar-nav">
          <NavLink to="/admin" end className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            <IconDashboard size={20} stroke={1.6} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/produtos" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            <IconPackage size={20} stroke={1.6} />
            <span>Produtos</span>
          </NavLink>
          <NavLink to="/admin/almofadas" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            <IconPalette size={20} stroke={1.6} />
            <span>Kit Almofadas</span>
          </NavLink>
          <NavLink to="/admin/estoque" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            <IconBoxSeam size={20} stroke={1.6} />
            <span>Estoque</span>
          </NavLink>
          <NavLink to="/admin/pedidos" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            <IconReceipt size={20} stroke={1.6} />
            <span>Pedidos</span>
          </NavLink>
          <NavLink to="/admin/pagamentos" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            <IconCreditCard size={20} stroke={1.6} />
            <span>Pagamentos</span>
          </NavLink>
        </nav>
        <div className="admin-sidebar-footer">
          <a href="/" className="btn-back-site">
            <IconArrowLeft size={16} stroke={1.8} />
            <span>Voltar ao Site</span>
          </a>
          <button className="btn-logout" onClick={handleLogout}>
            <IconLogout size={16} stroke={1.8} />
            <span>Sair</span>
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

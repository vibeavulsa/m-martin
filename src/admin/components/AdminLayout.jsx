import { useState, useCallback } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  IconDashboard,
  IconPackage,
  IconBoxSeam,
  IconReceipt,
  IconArrowLeft,
  IconLogout,
  IconPalette,
  IconCreditCard,
  IconMenu2,
  IconX,
} from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import '../Admin.css';

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const handleNavClick = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard';
    if (path.includes('produtos')) return 'Produtos';
    if (path.includes('almofadas')) return 'Kit Almofadas';
    if (path.includes('estoque')) return 'Estoque';
    if (path.includes('pedidos')) return 'Pedidos';
    if (path.includes('pagamentos')) return 'Pagamentos';
    return 'Admin';
  };

  return (
    <div className="admin-layout">
      {/* Mobile top bar */}
      <header className="admin-mobile-header">
        <button
          className="admin-menu-toggle"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menu"
        >
          <IconMenu2 size={22} stroke={1.8} />
        </button>
        <span className="admin-mobile-title">{getPageTitle()}</span>
        <span className="admin-mobile-brand">M&apos;Martin</span>
      </header>

      {/* Sidebar overlay (mobile only) */}
      {sidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={closeSidebar} />
      )}

      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="admin-sidebar-header">
          <h2>M&apos;Martin</h2>
          <span>Painel Admin</span>
          <button
            className="admin-sidebar-close"
            onClick={closeSidebar}
            aria-label="Fechar menu"
          >
            <IconX size={20} stroke={1.8} />
          </button>
        </div>
        <nav className="admin-sidebar-nav">
          <NavLink to="/admin" end className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`} onClick={handleNavClick}>
            <IconDashboard size={20} stroke={1.6} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/produtos" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`} onClick={handleNavClick}>
            <IconPackage size={20} stroke={1.6} />
            <span>Produtos</span>
          </NavLink>
          <NavLink to="/admin/almofadas" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`} onClick={handleNavClick}>
            <IconPalette size={20} stroke={1.6} />
            <span>Kit Almofadas</span>
          </NavLink>
          <NavLink to="/admin/estoque" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`} onClick={handleNavClick}>
            <IconBoxSeam size={20} stroke={1.6} />
            <span>Estoque</span>
          </NavLink>
          <NavLink to="/admin/pedidos" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`} onClick={handleNavClick}>
            <IconReceipt size={20} stroke={1.6} />
            <span>Pedidos</span>
          </NavLink>
          <NavLink to="/admin/pagamentos" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`} onClick={handleNavClick}>
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

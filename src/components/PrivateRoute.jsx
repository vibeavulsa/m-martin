import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PrivateRoute component to protect admin routes.
 * Redirects to login if user is not authenticated.
 */
function PrivateRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#d9b154'
      }}>
        Carregando...
      </div>
    );
  }

  if (!isAuthenticated || user?.email !== 'admin@mmartin.com') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default PrivateRoute;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconLock } from '@tabler/icons-react';
import { useAdmin } from '../context/AdminContext';
import '../Admin.css';

const LoginPage = () => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const { login } = useAdmin();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (login(user, pass)) {
      navigate('/admin');
    } else {
      setError('Usuário ou senha inválidos.');
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <IconLock size={40} stroke={1.5} style={{ display: 'block', margin: '0 auto 1rem', color: '#d9b154' }} />
        <h1>Admin</h1>
        <p className="login-subtitle">M&apos;Martin Estofados - Painel Administrativo</p>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="admin-user">Usuário</label>
            <input
              id="admin-user"
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="admin"
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="admin-pass">Senha</label>
            <input
              id="admin-pass"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn-login">Entrar</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

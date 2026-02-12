import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconLock, IconLoader2 } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    setLoading(false);

    if (result.success) {
      navigate('/admin');
    } else {
      // Check for specific Firebase errors
      const errorMessage = result.error || '';
      
      if (errorMessage.includes('api-key-not-valid')) {
        setError('Erro de configuração do Firebase. Verifique o arquivo .env e reinicie o servidor. Consulte FIREBASE_SETUP.md para mais detalhes.');
      } else if (errorMessage.includes('user-not-found') || errorMessage.includes('wrong-password') || errorMessage.includes('invalid-credential')) {
        setError('Email ou senha inválidos. Verifique suas credenciais.');
      } else if (errorMessage.includes('too-many-requests')) {
        setError('Muitas tentativas de login. Tente novamente mais tarde.');
      } else if (errorMessage.includes('network')) {
        setError('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        setError('Email ou senha inválidos. Verifique suas credenciais.');
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <IconLock size={40} stroke={1.5} style={{ display: 'block', margin: '0 auto 1rem', color: '#d9b154' }} />
        <h1>Admin Login</h1>
        <p className="login-subtitle">M&apos;Martin Estofados - Painel Administrativo</p>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mmartin.com"
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? (
              <>
                <IconLoader2 size={18} className="spin-icon" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { IconX, IconLock, IconLogout, IconLoader2, IconShieldCheck } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import './AuthDialog.css';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 40,
    transition: { duration: 0.2 }
  }
};

const AuthDialog = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated, login, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setEmail(''); // eslint-disable-line react-hooks/set-state-in-effect
      setPassword('');
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      onClose();
    } else {
      const errorMessage = result.error || '';
      if (errorMessage.includes('api-key-not-valid')) {
        setError('Erro de configuração do Firebase. Verifique o arquivo .env.');
      } else if (errorMessage.includes('user-not-found') || errorMessage.includes('wrong-password') || errorMessage.includes('invalid-credential')) {
        setError('Email ou senha inválidos.');
      } else if (errorMessage.includes('too-many-requests')) {
        setError('Muitas tentativas. Tente novamente mais tarde.');
      } else {
        setError('Email ou senha inválidos.');
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const handleGoToAdmin = () => {
    onClose();
    navigate('/admin');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="auth-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="auth-dialog"
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              className="auth-close"
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Fechar"
            >
              <IconX size={18} stroke={2} />
            </motion.button>

            {isAuthenticated ? (
              <div className="auth-body">
                <div className="auth-header-section">
                  <IconShieldCheck size={40} stroke={1.5} style={{ color: '#d9b154' }} />
                  <h2>Conectado</h2>
                  <p className="auth-user-email">{user?.email}</p>
                </div>
                <div className="auth-actions">
                  <motion.button
                    className="btn-admin"
                    onClick={handleGoToAdmin}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <IconShieldCheck size={18} stroke={2} />
                    Painel Admin
                  </motion.button>
                  <motion.button
                    className="btn-auth-logout"
                    onClick={handleLogout}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <IconLogout size={18} stroke={2} />
                    Sair
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="auth-body">
                <div className="auth-header-section">
                  <IconLock size={40} stroke={1.5} style={{ color: '#d9b154' }} />
                  <h2>Entrar</h2>
                  <p>M&apos;Martin Estofados</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="auth-email">Email</label>
                    <input
                      id="auth-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      autoComplete="email"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="auth-password">Senha</label>
                    <input
                      id="auth-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                      disabled={loading}
                    />
                  </div>
                  <button type="submit" className="btn-auth-login" disabled={loading}>
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
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthDialog;

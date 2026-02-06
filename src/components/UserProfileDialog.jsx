import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { IconX, IconUser, IconLogout } from '@tabler/icons-react';
import { useUser } from '../context/UserContext';
import './UserProfileDialog.css';

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

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
};

const UserProfileDialog = ({ isOpen, onClose }) => {
  const { profile, isLoggedIn, updateProfile, logout } = useUser();
  const [form, setForm] = useState(profile);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(profile); // eslint-disable-line react-hooks/set-state-in-effect
      setSaved(false);
    }
  }, [isOpen, profile]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!form.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'E-mail inválido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="profile-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="profile-dialog"
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              className="profile-close"
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Fechar"
            >
              <IconX size={18} stroke={2} />
            </motion.button>

            <motion.div
              className="profile-body"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div className="profile-header-section" variants={itemVariants}>
                <motion.div
                  className="profile-avatar"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <IconUser size={40} stroke={1.5} />
                </motion.div>
                <h2>Meu Perfil</h2>
                <p>{isLoggedIn ? `Bem-vindo, ${profile.name}` : 'Crie seu perfil para uma melhor experiência'}</p>
              </motion.div>

              <form onSubmit={handleSubmit} className="profile-form">
                <motion.div className="form-group" variants={itemVariants}>
                  <label htmlFor="profile-name">Nome completo *</label>
                  <input
                    id="profile-name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    className={errors.name ? 'input-error' : ''}
                  />
                  {errors.name && <span className="error-msg">{errors.name}</span>}
                </motion.div>

                <motion.div className="form-group" variants={itemVariants}>
                  <label htmlFor="profile-email">E-mail *</label>
                  <input
                    id="profile-email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    className={errors.email ? 'input-error' : ''}
                  />
                  {errors.email && <span className="error-msg">{errors.email}</span>}
                </motion.div>

                <motion.div className="form-group" variants={itemVariants}>
                  <label htmlFor="profile-phone">Telefone</label>
                  <input
                    id="profile-phone"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                  />
                </motion.div>

                <motion.div className="form-group" variants={itemVariants}>
                  <label htmlFor="profile-address">Endereço</label>
                  <input
                    id="profile-address"
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Rua, número, complemento"
                  />
                </motion.div>

                <motion.div className="form-group" variants={itemVariants}>
                  <label htmlFor="profile-city">Cidade</label>
                  <input
                    id="profile-city"
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Sua cidade"
                  />
                </motion.div>

                <motion.div className="profile-form-actions" variants={itemVariants}>
                  {isLoggedIn && (
                    <motion.button
                      type="button"
                      className="btn-logout"
                      onClick={handleLogout}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <IconLogout size={16} stroke={2} />
                      Sair
                    </motion.button>
                  )}
                  <motion.button
                    type="submit"
                    className={`btn-save ${saved ? 'btn-saved' : ''}`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {saved ? 'Salvo!' : 'Salvar Perfil'}
                  </motion.button>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserProfileDialog;

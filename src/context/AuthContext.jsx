/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('[AuthContext] Login error:', error);

      // Provide detailed error message
      let errorMessage = error.message;

      // Check for Firebase configuration errors
      if (error.code === 'auth/api-key-not-valid') {
        errorMessage = 'Firebase não está configurado corretamente. Verifique o arquivo .env e consulte FIREBASE_SETUP.md';
      }

      return { success: false, error: errorMessage, code: error.code };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('[AuthContext] Google Login error:', error);
      let errorMessage = error.message;
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'O login foi cancelado.';
      } else if (error.code === 'auth/api-key-not-valid') {
        errorMessage = 'Firebase não está configurado corretamente. Verifique o arquivo .env';
      }
      return { success: false, error: errorMessage, code: error.code };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    loginWithGoogle,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

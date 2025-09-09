import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/user/me');
        setUser(res.data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const signup = async (name, email, password) => {
    await api.post('/auth/signup', { name, email, password });
  };

  const login = async (email, password) => {
    await api.post('/auth/login', { email, password });
    const res = await api.get('/user/me');
    setUser(res.data.user);
  };

 const logout = async () => {
  try {
    await api.post('/auth/logout');
    setUser(null);
  } catch (err) {
    console.error('Logout failed:', err);
  }
};

const forgotPassword = async (email) => {
    return api.post('/auth/forgot-password', { email });
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
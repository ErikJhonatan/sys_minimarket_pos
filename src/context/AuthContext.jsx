import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import config from '../config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar si hay un token al cargar la aplicación
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem(config.nameItemJwt);
      if (!token) {
        setLoading(false);
        return;
      }

      // Verificar token con el servidor
      const response = await axios.get('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      // Token inválido o expirado
      localStorage.removeItem(config.nameItemJwt);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post('/auth/login', credentials);
      const { token, user } = response.data;

      localStorage.setItem(config.nameItemJwt, token);
      setUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Credenciales inválidas'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem(config.nameItemJwt);
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

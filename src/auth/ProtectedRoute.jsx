import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import config from '../config';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem(config.nameItemJwt);
        
        if (!token) {
          setIsAuth(false);
          setLoading(false);
          return;
        }

        const res = await axiosInstance.get('/auth/verify', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.status === 200) {
          setIsAuth(true);
        }
      } catch (error) {
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  if (loading) return <p>Verificando sesión...</p>;
  if (!isAuth) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;

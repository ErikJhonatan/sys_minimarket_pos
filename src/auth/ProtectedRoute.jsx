import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import config from '../config';

const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '16px',
    color: '#666'
  }}>
    <span className="loading loading-spinner loading-lg"></span>
    <p>Verificando sesión...</p>
  </div>
);

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

  if (loading) return <LoadingSpinner />;
  if (!isAuth) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;

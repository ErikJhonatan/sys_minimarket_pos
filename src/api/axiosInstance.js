import config from "../config";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: config.apiUrl,
  timeout: 10000,
  withCredentials: true, // Importante para CORS con credenciales
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de solicitud - Agregar token automáticamente
axiosInstance.interceptors.request.use(
  (requestConfig) => {
    const tokenKey = config.nameItemJwt || "token";
    const token = localStorage.getItem(tokenKey);
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    return requestConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta - Manejar errores globalmente
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      const tokenKey = config.nameItemJwt || "token";
      localStorage.removeItem(tokenKey);
      window.location.href = "/login";
    }

    // Manejar otros errores
    if (error.response?.status >= 500) {
      console.error("Error del servidor:", error.response.data);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

import axios from "../api/axiosInstance";
import config from "../config";

const categoriaApi = {
  // Obtener todas las categorías
  getAll: async () => {
    const token = localStorage.getItem(config.nameItemJwt);
    const response = await axios.get('/categories', {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Retornar la respuesta completa para manejar diferentes formatos
    return response.data;
  },

  // Obtener una categoría por ID
  getById: async (id) => {
    const token = localStorage.getItem(config.nameItemJwt);
    const response = await axios.get(`/categories/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Crear una nueva categoría
  create: async (categoryData) => {
    const token = localStorage.getItem(config.nameItemJwt);
    const response = await axios.post('/categories', categoryData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Actualizar una categoría
  update: async (id, categoryData) => {
    const token = localStorage.getItem(config.nameItemJwt);
    const response = await axios.patch(`/categories/${id}`, categoryData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Eliminar una categoría
  delete: async (id) => {
    const token = localStorage.getItem(config.nameItemJwt);
    const response = await axios.delete(`/categories/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export default categoriaApi;


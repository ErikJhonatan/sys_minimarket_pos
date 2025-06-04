import axios from "../api/axiosInstance";
import config from "../config";

const productoApi = {
  // Obtener todos los productos
  getAll: async (query = {}) => {
    const token = localStorage.getItem(config.nameItemJwt);
    const params = new URLSearchParams(query).toString();
    const url = params ? `/products?${params}` : '/products';
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Obtener un producto por ID
  getById: async (id) => {
    const token = localStorage.getItem(config.nameItemJwt);
    const response = await axios.get(`/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Crear un nuevo producto
  create: async (productData) => {
    const token = localStorage.getItem(config.nameItemJwt);
    const response = await axios.post('/products', productData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Actualizar un producto
  update: async (id, productData) => {
    const token = localStorage.getItem(config.nameItemJwt);
    const response = await axios.patch(`/products/${id}`, productData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Eliminar un producto
  delete: async (id) => {
    const token = localStorage.getItem(config.nameItemJwt);
    const response = await axios.delete(`/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export default productoApi;

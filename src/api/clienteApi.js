import axios from "../api/axiosInstance";
import config from "../config";
const token = localStorage.getItem(config.nameItemJwt);

const clienteApi = {
  // Obtener todos los clientes
  getAll: async () => {
    const response = await axios.get('/customers', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Obtener un cliente por ID
  getById: async (id) => {
    const response = await axios.get(`/customers/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Crear un nuevo cliente
  create: async (customerData) => {
    const response = await axios.post('/customers', customerData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Actualizar un cliente
  update: async (id, customerData) => {
    const response = await axios.patch(`/customers/${id}`, customerData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Eliminar un cliente
  delete: async (id) => {
    const response = await axios.delete(`/customers/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export default clienteApi;

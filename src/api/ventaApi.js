import axios from "../api/axiosInstance";

const ventaApi = {
  // Obtener todas las ventas
  getAll: async (query = {}) => {
    const params = new URLSearchParams(query).toString();
    const url = params ? `/orders?${params}` : "/orders";
    const response = await axios.get(url);
    return response.data;
  },

  // Obtener una venta por ID
  getById: async (id) => {
    const response = await axios.get(`/orders/${id}`);
    return response.data;
  },

  // Crear una nueva venta
  create: async (saleData) => {
    const response = await axios.post("/orders", saleData);
    return response.data;
  },

  // Agregar item a una venta
  addItem: async (itemData) => {
    const response = await axios.post("/orders/add-item", itemData);
    return response.data;
  },

  // Actualizar una venta
  update: async (id, saleData) => {
    const response = await axios.patch(`/orders/${id}`, saleData);
    return response.data;
  },

  // Eliminar una venta
  delete: async (id) => {
    const response = await axios.delete(`/orders/${id}`);
    return response.data;
  },

  // Obtener ventas por cliente
  getByCustomer: async (customerId) => {
    const response = await axios.get(`/orders?customerId=${customerId}`);
    return response.data;
  },

  // Obtener estadísticas de ventas
  getStats: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const url = params ? `/orders/stats?${params}` : "/orders/stats";
    const response = await axios.get(url);
    return response.data;
  },
};

export default ventaApi;

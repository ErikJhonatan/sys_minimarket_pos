import axios from "../api/axiosInstance";

const clienteApi = {
  // Obtener todos los clientes
  getAll: async () => {
    const response = await axios.get("/customers");
    return response.data;
  },

  // Obtener un cliente por ID
  getById: async (id) => {
    const response = await axios.get(`/customers/${id}`);
    return response.data;
  },

  // Crear un nuevo cliente
  create: async (customerData) => {
    const response = await axios.post("/customers", customerData);
    return response.data;
  },

  // Actualizar un cliente
  update: async (id, customerData) => {
    const response = await axios.patch(`/customers/${id}`, customerData);
    return response.data;
  },

  // Eliminar un cliente
  delete: async (id) => {
    const response = await axios.delete(`/customers/${id}`);
    return response.data;
  },
};

export default clienteApi;

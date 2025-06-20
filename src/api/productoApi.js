import axios from "../api/axiosInstance";

const productoApi = {
  // Obtener todos los productos
  getAll: async (query = {}) => {
    const params = new URLSearchParams(query).toString();
    const url = params ? `/products?${params}` : "/products";
    const response = await axios.get(url);
    return response.data;
  },

  // Obtener un producto por ID
  getById: async (id) => {
    const response = await axios.get(`/products/${id}`);
    return response.data;
  },

  // Crear un nuevo producto
  create: async (productData) => {
    const response = await axios.post("/products", productData);
    return response.data;
  },

  // Actualizar un producto
  update: async (id, productData) => {
    const response = await axios.patch(`/products/${id}`, productData);
    return response.data;
  },

  // Eliminar un producto
  delete: async (id) => {
    const response = await axios.delete(`/products/${id}`);
    return response.data;
  },
};

export default productoApi;

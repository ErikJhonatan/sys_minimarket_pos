import axios from "../api/axiosInstance";

const categoriaApi = {
  // Obtener todas las categorías
  getAll: async () => {
    const response = await axios.get("/categories");
    return response.data;
  },

  // Obtener una categoría por ID
  getById: async (id) => {
    const response = await axios.get(`/categories/${id}`);
    return response.data;
  },

  // Crear una nueva categoría
  create: async (categoryData) => {
    const response = await axios.post("/categories", categoryData);
    return response.data;
  },

  // Actualizar una categoría
  update: async (id, categoryData) => {
    const response = await axios.patch(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Eliminar una categoría
  delete: async (id) => {
    const response = await axios.delete(`/categories/${id}`);
    return response.data;
  },
};

export default categoriaApi;

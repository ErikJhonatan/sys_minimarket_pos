import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiTrash2, FiSearch } from "react-icons/fi";
import Layout from "../../components/Layout";
import CategoriaForm from "./CategoriaForm";
import categoriaApi from "../../api/categoriaApi";

const CategoriaList = () => {
  const [categorias, setCategorias] = useState([]);
  const [filteredCategorias, setFilteredCategorias] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar categorías
  const loadCategorias = async () => {
    try {
      setIsLoading(true);
      const data = await categoriaApi.getAll();
      setCategorias(data);
      setFilteredCategorias(data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategorias();
  }, []);

  // Filtrar categorías por búsqueda
  useEffect(() => {
    const filtered = categorias.filter((categoria) =>
      categoria.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategorias(filtered);
  }, [searchTerm, categorias]);

  // Abrir modal de crear
  const handleCreate = () => {
    setSelectedCategoria(null);
    document.getElementById("categoria_modal").showModal();
  };

  // Abrir modal de editar
  const handleEdit = (categoria) => {
    setSelectedCategoria(categoria);
    document.getElementById("categoria_modal").showModal();
  };

  // Abrir modal de confirmar eliminación
  const handleDelete = (categoria) => {
    setSelectedCategoria(categoria);
    document.getElementById("delete_modal").showModal();
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    try {
      await categoriaApi.delete(selectedCategoria.id);
      loadCategorias();
      document.getElementById("delete_modal").close();
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
    }
  };

  // Callback para actualizar lista después de operaciones CRUD
  const handleSuccess = () => {
    loadCategorias();
    document.getElementById("categoria_modal").close();
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-base-content">Gestión de Categorías</h1>
            <p className="text-gray-600 mt-1">Organiza y administra tus categorías de productos</p>
          </div>
          <button className="btn btn-primary" onClick={handleCreate}>
            <FiPlus className="w-4 h-4" />
            Nueva Categoría
          </button>
        </div>

        {/* Búsqueda */}
        <div className="mb-6">
          <label className="input input-bordered flex items-center gap-2 max-w-md">
            <FiSearch className="w-4 h-4 opacity-70" />
            <input
              type="text"
              className="grow"
              placeholder="Buscar categorías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}

        {/* Grid de categorías */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategorias.map((categoria) => (
            <div
              key={categoria.id}
              className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
            >
              <figure className="h-48">
                <img
                  src={categoria.image}
                  alt={categoria.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x200?text=Sin+Imagen";
                  }}
                />
              </figure>
              <div className="card-body">
                <h2 className="card-title justify-between">
                  <span className="truncate">{categoria.name}</span>
                  <div className="badge badge-secondary whitespace-nowrap">
                    {categoria.products?.length || 0} productos
                  </div>
                </h2>
                <p className="text-sm text-gray-600">
                  Creada:{" "}
                  {new Date(categoria.createdAt).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
                <div className="card-actions justify-end mt-4">
                  <div className="tooltip" data-tip="Editar categoría">
                    <button
                      className="btn btn-sm btn-ghost hover:btn-info"
                      onClick={() => handleEdit(categoria)}
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="tooltip" data-tip="Eliminar categoría">
                    <button
                      className="btn btn-sm btn-ghost hover:btn-error"
                      onClick={() => handleDelete(categoria)}
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje cuando no hay resultados */}
        {!isLoading && filteredCategorias.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm
                ? "No se encontraron categorías que coincidan con la búsqueda"
                : "No hay categorías registradas"}
            </p>
          </div>
        )}

        {/* Modal de formulario */}
        <dialog id="categoria_modal" className="modal">
          <div className="modal-box w-11/12 max-w-md">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>

            <div className="mb-4">
              <h3 className="font-bold text-lg text-center">
                {selectedCategoria ? "Editar Categoría" : "Nueva Categoría"}
              </h3>
              <p className="text-center text-base-content/60 text-sm mt-1">
                {selectedCategoria
                  ? "Modifica las propiedades de la categoría"
                  : "Define las características de la categoría"}
              </p>
            </div>

            <div className="w-full">
              <CategoriaForm categoria={selectedCategoria} onSuccess={handleSuccess} />
            </div>
          </div>
        </dialog>

        {/* Modal de confirmación de eliminación */}
        <dialog id="delete_modal" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">⚠️ Confirmar eliminación</h3>
            <div className="py-4">
              <p className="mb-2">
                Esta acción eliminará la categoría <strong>"{selectedCategoria?.name}"</strong> del
                sistema.
              </p>
              <div className="alert alert-warning">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <span>Los productos asociados a esta categoría se verán afectados.</span>
              </div>
            </div>
            <div className="modal-action">
              <form method="dialog">
                <button className="btn btn-ghost mr-2">Cancelar</button>
              </form>
              <button className="btn btn-error" onClick={confirmDelete}>
                <FiTrash2 className="w-4 h-4 mr-2" />
                Confirmar
              </button>
            </div>
          </div>
        </dialog>
      </div>
    </Layout>
  );
};

export default CategoriaList;

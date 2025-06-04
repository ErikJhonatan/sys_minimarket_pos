import React, { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch, HiOutlineExclamation, HiOutlinePhotograph, HiOutlineCube, HiOutlineExclamationCircle, HiOutlineCurrencyDollar, HiOutlineCheckCircle, HiOutlineMinusCircle, HiOutlineXCircle, HiOutlineX } from 'react-icons/hi';
import Layout from '../../components/Layout';
import ProductoForm from './ProductoForm';
import productoApi from '../../api/productoApi';
import categoriaApi from '../../api/categoriaApi';

const ProductoList = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('');

  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productosResponse, categoriasResponse] = await Promise.all([
        productoApi.getAll(),
        categoriaApi.getAll()
      ]);

      console.log('Productos response:', productosResponse);
      console.log('Categorias response:', categoriasResponse);

      setProductos(productosResponse.data || productosResponse || []);
      setCategorias(categoriasResponse.data || categoriasResponse || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error al cargar los datos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const loadProductos = async () => {
    try {
      const response = await productoApi.getAll();
      console.log('Reloading productos:', response);
      setProductos(response.data || response || []);
    } catch (error) {
      console.error('Error recargando productos:', error);
    }
  };

  const handleDeleteProducto = async () => {
    try {
      await productoApi.delete(selectedProducto.id);
      setShowDeleteModal(false);
      setSelectedProducto(null);
      loadProductos();
    } catch (error) {
      console.error('Error eliminando producto:', error);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setStockFilter('');
  };

  // Filtrar productos - lógica mejorada
  const filteredProductos = productos.filter(producto => {
    // Verificar que el producto tenga las propiedades necesarias
    if (!producto || !producto.name) return false;

    const matchSearch = !searchTerm ||
                       producto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (producto.code && producto.code.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchCategory = !selectedCategory ||
                         producto.categoryId?.toString() === selectedCategory;

    const matchStock = !stockFilter ||
                      (stockFilter === 'bajo' && producto.stock <= (producto.stockMin || 0)) ||
                      (stockFilter === 'normal' && producto.stock > (producto.stockMin || 0));

    return matchSearch && matchCategory && matchStock;
  });

  const getCategoryName = (categoryId) => {
    if (!categoryId || !categorias.length) return 'Sin categoría';
    const categoria = categorias.find(cat => cat.id === categoryId);
    return categoria ? categoria.name : 'Sin categoría';
  };

  // Calcular estadísticas
  const getEstadisticas = () => {
    const stockBajo = productos.filter(p => p.stock <= (p.stockMin || 0)).length;
    const sinImagen = productos.filter(p => !p.image).length;
    const valorTotal = productos.reduce((sum, p) => sum + (p.price * p.stock), 0);

    return { stockBajo, sinImagen, valorTotal };
  };

  const estadisticas = getEstadisticas();

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <span className="loading loading-spinner loading-lg"></span>
            <p className="mt-4 text-base-content/60">Cargando productos...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <div className="alert alert-error max-w-md">
              <p>{error}</p>
            </div>
            <button
              className="btn btn-primary mt-4"
              onClick={loadData}
            >
              Reintentar
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header con estadísticas */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-base-content">Gestión de Productos</h1>
              <p className="text-base-content/60 mt-1">Administra tu inventario de productos</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary gap-2 shadow-lg"
            >
              <HiOutlinePlus size={20} />
              Nuevo Producto
            </button>
          </div>

          {/* Cards de estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Total Productos */}
            <div className="card bg-base-100 shadow-md">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-base-content/60">Total Productos</h3>
                    <p className="text-2xl font-bold text-primary mt-1">{productos.length}</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-full">
                    <HiOutlineCube className="text-primary" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Bajo */}
            <div className="card bg-base-100 shadow-md">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-base-content/60">Stock Bajo</h3>
                    <p className="text-2xl font-bold text-error mt-1">{estadisticas.stockBajo}</p>
                    {estadisticas.stockBajo > 0 && (
                      <p className="text-xs text-error/70 mt-1">Requiere atención</p>
                    )}
                  </div>
                  <div className="p-3 bg-error/10 rounded-full">
                    <HiOutlineExclamationCircle className="text-error" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Valor Inventario */}
            <div className="card bg-base-100 shadow-md">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-base-content/60">Valor Inventario</h3>
                    <p className="text-2xl font-bold text-success mt-1">
                      S/ {estadisticas.valorTotal.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-success/10 rounded-full">
                    <HiOutlineCurrencyDollar className="text-success" size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda y filtros optimizada */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4 space-y-4">
            {/* Búsqueda */}
            <div className="mb-6">
              <label className="input input-bordered flex items-center gap-2 max-w-md">
                <HiOutlineSearch className="w-4 h-4 opacity-70" />
                <input
                  type="text"
                  className="grow"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </label>
            </div>

            {/* Filtros con componente filter de DaisyUI */}
            <div className="space-y-4">
              {/* Filtro por Categoría */}
              <div>
                <label className="label label-text font-medium mb-2">Categoría</label>
                <div className="filter">
                  <input
                    className="btn filter-reset"
                    type="radio"
                    name="category-filter"
                    aria-label="Todas"
                    checked={selectedCategory === ''}
                    onChange={() => setSelectedCategory('')}
                  />
                  {categorias.map(categoria => (
                    <input
                      key={categoria.id}
                      className="btn"
                      type="radio"
                      name="category-filter"
                      aria-label={categoria.name}
                      checked={selectedCategory === categoria.id.toString()}
                      onChange={() => setSelectedCategory(categoria.id.toString())}
                    />
                  ))}
                </div>
              </div>

              {/* Filtro por Stock */}
              <div>
                <label className="label label-text font-medium mb-2">Estado del Stock</label>
                <div className="filter">
                  <input
                    className="btn filter-reset"
                    type="radio"
                    name="stock-filter"
                    aria-label="Todos"
                    checked={stockFilter === ''}
                    onChange={() => setStockFilter('')}
                  />
                  <input
                    className="btn"
                    type="radio"
                    name="stock-filter"
                    aria-label="Stock bajo"
                    checked={stockFilter === 'bajo'}
                    onChange={() => setStockFilter('bajo')}
                  />
                  <input
                    className="btn"
                    type="radio"
                    name="stock-filter"
                    aria-label="Stock normal"
                    checked={stockFilter === 'normal'}
                    onChange={() => setStockFilter('normal')}
                  />
                </div>
              </div>

              {/* Botón limpiar todos los filtros */}
              {(searchTerm || selectedCategory || stockFilter) && (
                <div className="flex justify-center">
                  <button
                    onClick={resetFilters}
                    className="btn btn-outline btn-sm gap-2"
                  >
                    <HiOutlineSearch size={16} />
                    Limpiar todos los filtros
                  </button>
                </div>
              )}
            </div>

            {/* Indicador de filtros activos */}
            {filteredProductos.length !== productos.length && (
              <div className="alert alert-info py-2">
                <span className="text-sm">
                  Mostrando {filteredProductos.length} de {productos.length} productos
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Grid de productos mejorado */}
        {productos.length === 0 ? (
          <div className="text-center py-16">
            <div className="card bg-base-100 shadow-sm max-w-md mx-auto">
              <div className="card-body text-center">
                <HiOutlinePlus size={48} className="mx-auto text-base-content/30 mb-4" />
                <h3 className="card-title justify-center">No hay productos</h3>
                <p className="text-base-content/60">Comienza agregando tu primer producto al inventario</p>
                <div className="card-actions justify-center mt-4">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary gap-2"
                  >
                    <HiOutlinePlus size={18} />
                    Crear primer producto
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : filteredProductos.length === 0 ? (
          <div className="text-center py-12">
            <div className="card bg-base-100 shadow-sm max-w-md mx-auto">
              <div className="card-body text-center">
                <HiOutlineSearch size={48} className="mx-auto text-base-content/30 mb-4" />
                <h3 className="card-title justify-center">Sin resultados</h3>
                <p className="text-base-content/60">No se encontraron productos con los filtros aplicados</p>
                <div className="card-actions justify-center mt-4">
                  <button
                    onClick={resetFilters}
                    className="btn btn-outline gap-2"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProductos.map((producto) => (
              <div key={producto.id} className="card bg-base-100 shadow-sm hover:shadow-md transition-all duration-200 border border-base-300">
                {/* Header con imagen y acciones */}
                <div className="relative">
                  <figure className="h-32 overflow-hidden rounded-t-lg">
                    <img
                      src={producto.image || 'https://via.placeholder.com/300x200?text=Sin+Imagen'}
                      alt={producto.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=Sin+Imagen';
                      }}
                    />
                  </figure>

                  {/* Acciones flotantes */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <div className="tooltip tooltip-left" data-tip="Editar">
                      <button
                        onClick={() => {
                          setSelectedProducto(producto);
                          setShowEditModal(true);
                        }}
                        className="btn btn-xs btn-circle btn-primary btn-outline bg-base-100/90 hover:bg-primary hover:text-primary-content"
                      >
                        <HiOutlinePencil size={12} />
                      </button>
                    </div>
                    <div className="tooltip tooltip-left" data-tip="Eliminar">
                      <button
                        onClick={() => {
                          setSelectedProducto(producto);
                          setShowDeleteModal(true);
                        }}
                        className="btn btn-xs btn-circle btn-error btn-outline bg-base-100/90 hover:bg-error hover:text-error-content"
                      >
                        <HiOutlineTrash size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Badge de stock bajo */}
                  {producto.stock <= (producto.stockMin || 0) && (
                    <div className="absolute top-2 left-2">
                      <div className="badge badge-error badge-sm gap-1">
                        <HiOutlineExclamation size={10} />
                        Stock Bajo
                      </div>
                    </div>
                  )}
                </div>

                {/* Contenido del producto */}
                <div className="card-body p-3 space-y-3">
                  {/* Título del producto */}
                  <div>
                    <h3 className="font-semibold text-base text-base-content line-clamp-2 leading-tight">
                      {producto.name}
                    </h3>
                    <p className="text-xs text-base-content/60 font-mono mt-1">
                      {producto.code || 'Sin código'}
                    </p>
                  </div>

                  {/* Categoría */}
                  <div>
                    <span className="badge badge-ghost badge-sm">
                      {getCategoryName(producto.categoryId)}
                    </span>
                  </div>

                  {/* Información de precio y stock */}
                  <div className="space-y-2">
                    {/* Precio */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-base-content/60">Precio:</span>
                      <span className="font-bold text-success text-sm">
                        S/ {(producto.price || 0).toFixed(2)}
                      </span>
                    </div>

                    {/* Stock */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-base-content/60">Stock:</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${
                          (producto.stock || 0) <= (producto.stockMin || 0)
                            ? 'text-error'
                            : 'text-base-content'
                        }`}>
                          {producto.stock || 0}
                        </span>
                        {/* Ícono de estado de stock */}
                        {(producto.stock || 0) <= (producto.stockMin || 0) ? (
                          <div className="tooltip" data-tip="Stock crítico">
                            <HiOutlineXCircle className="text-error" size={16} />
                          </div>
                        ) : (producto.stock || 0) <= (producto.stockMin || 0) * 2 ? (
                          <div className="tooltip" data-tip="Stock bajo">
                            <HiOutlineMinusCircle className="text-warning" size={16} />
                          </div>
                        ) : (
                          <div className="tooltip" data-tip="Stock normal">
                            <HiOutlineCheckCircle className="text-success" size={16} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stock mínimo */}
                    {producto.stockMin > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-base-content/50">Mínimo:</span>
                        <span className="text-xs text-base-content/70">
                          {producto.stockMin} unidades
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Indicador visual de estado */}
                  <div className="divider my-2"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {!producto.image && (
                        <div className="tooltip" data-tip="Sin imagen">
                          <HiOutlinePhotograph className="text-base-content/30" size={16} />
                        </div>
                      )}
                      <span className="text-xs text-base-content/50">
                        Valor: S/ {((producto.price || 0) * (producto.stock || 0)).toFixed(2)}
                      </span>
                    </div>
                    {/* Estado visual con ícono */}
                    <div className="flex items-center gap-1">
                      {(producto.stock || 0) <= (producto.stockMin || 0) ? (
                        <HiOutlineXCircle className="text-error" size={14} />
                      ) : (producto.stock || 0) <= (producto.stockMin || 0) * 2 ? (
                        <HiOutlineMinusCircle className="text-warning" size={14} />
                      ) : (
                        <HiOutlineCheckCircle className="text-success" size={14} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Crear */}
        {showCreateModal && (
          <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
              <h3 className="font-bold text-lg mb-4">Crear Nuevo Producto</h3>
              <ProductoForm
                onSuccess={() => {
                  setShowCreateModal(false);
                  loadProductos();
                }}
              />
              <div className="modal-action">
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar */}
        {showEditModal && selectedProducto && (
          <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
              <h3 className="font-bold text-lg mb-4">Editar Producto</h3>
              <ProductoForm
                producto={selectedProducto}
                onSuccess={() => {
                  setShowEditModal(false);
                  setSelectedProducto(null);
                  loadProductos();
                }}
              />
              <div className="modal-action">
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedProducto(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Eliminar */}
        {showDeleteModal && selectedProducto && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Confirmar eliminación</h3>
              <p className="py-4">
                ¿Estás seguro de que deseas eliminar el producto "<strong>{selectedProducto.name}</strong>"?
                Esta acción no se puede deshacer.
              </p>
              <div className="modal-action">
                <button
                  className="btn btn-error"
                  onClick={handleDeleteProducto}
                >
                  Eliminar
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedProducto(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductoList;

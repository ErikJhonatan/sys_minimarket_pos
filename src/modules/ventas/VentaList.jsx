import React, { useState, useEffect } from "react";
import {
  HiDocumentText,
  HiEye,
  HiCalendar,
  HiUser,
  HiCurrencyDollar,
  HiCheckCircle,
  HiRefresh,
  HiPlus,
  HiExclamation,
  HiX,
  HiPhotograph,
  HiSearch,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import ventaApi from "../../api/ventaApi";

const VentaList = () => {
  const [ventas, setVentas] = useState([]);
  const [todasLasVentas, setTodasLasVentas] = useState([]); // Para guardar todas las ventas
  const [loading, setLoading] = useState(true);
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    cargarVentas();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filtrar ventas por búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setVentas(todasLasVentas);
    } else {
      const ventasFiltradas = todasLasVentas.filter((venta) => {
        const cliente = `${venta.customer?.name || ""} ${
          venta.customer?.lastName || ""
        }`.toLowerCase();
        const telefono = venta.customer?.phone || "";
        const id = venta.id?.toString() || "";

        return (
          cliente.includes(searchTerm.toLowerCase()) ||
          telefono.includes(searchTerm) ||
          id.includes(searchTerm)
        );
      });
      setVentas(ventasFiltradas);
    }
    setCurrentPage(1); // Resetear a la primera página cuando se busca
  }, [searchTerm, todasLasVentas]);

  // Calcular items para la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const ventasActuales = ventas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(ventas.length / itemsPerPage);

  // Función para agregar alertas
  const agregarAlerta = (tipo, mensaje) => {
    const nuevaAlerta = {
      id: Date.now(),
      tipo,
      mensaje,
    };
    setAlerts((prev) => [...prev, nuevaAlerta]);

    // Auto-eliminar la alerta después de 5 segundos
    setTimeout(() => {
      eliminarAlerta(nuevaAlerta.id);
    }, 5000);
  };

  // Función para eliminar alertas
  const eliminarAlerta = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  // Componente de alertas
  const AlertContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`alert ${
            alert.tipo === "success"
              ? "alert-success"
              : alert.tipo === "error"
              ? "alert-error"
              : alert.tipo === "warning"
              ? "alert-warning"
              : "alert-info"
          } transition-all duration-300 transform animate-pulse`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            {alert.tipo === "success" && (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            )}
            {alert.tipo === "error" && (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            )}
            {alert.tipo === "warning" && (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            )}
          </svg>
          <span>{alert.mensaje}</span>
          <button onClick={() => eliminarAlerta(alert.id)} className="btn btn-xs btn-ghost">
            <HiX />
          </button>
        </div>
      ))}
    </div>
  );

  // Función para verificar stock bajo
  const verificarStockBajo = (producto) => {
    const stockMinimo = 10; // Umbral de stock bajo
    return producto.stock && producto.stock <= stockMinimo;
  };

  const cargarVentas = async () => {
    setLoading(true);
    try {
      const response = await ventaApi.getAll();
      setTodasLasVentas(response);
      setVentas(response);
    } catch (error) {
      console.error("Error al cargar ventas:", error);
      agregarAlerta("error", "Error al cargar las ventas");
    } finally {
      setLoading(false);
    }
  };

  const verDetalleVenta = async (id) => {
    try {
      const venta = await ventaApi.getById(id);
      setSelectedVenta(venta);
      document.getElementById("modal_detalle_venta").showModal();
    } catch (error) {
      console.error("Error al cargar detalle de venta:", error);
      agregarAlerta("error", "Error al cargar el detalle de la venta");
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    try {
      return format(new Date(fecha), "dd/MM/yyyy - HH:mm");
    } catch {
      return "Fecha inválida";
    }
  };

  const calcularTotalVenta = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => {
      const precio = item.price || 0;
      const cantidad = item.OrderProduct?.amount || 0;
      return total + precio * cantidad;
    }, 0);
  };

  // Funciones de paginación
  const cambiarPagina = (numeroPagina) => {
    setCurrentPage(numeroPagina);
  };

  const paginaAnterior = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const paginaSiguiente = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Limpiar búsqueda
  const limpiarBusqueda = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AlertContainer />
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
              <HiDocumentText className="text-primary" />
              Historial de Ventas Recientes
            </h1>
            <p className="text-base-content/70 mt-1">
              Gestiona y revisa todas las transacciones realizadas
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/nueva-venta" className="btn btn-primary">
              <HiPlus />
              Nueva Venta
            </Link>
            <button onClick={cargarVentas} className="btn btn-outline btn-primary">
              <HiRefresh />
              Actualizar
            </button>
          </div>
        </div>

        {/* Barra de búsqueda y estadísticas */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Búsqueda */}
              <div className="form-control w-full md:w-auto">
                <label className="input input-bordered flex items-center gap-2 w-full md:w-80">
                  <HiSearch className="w-4 h-4 opacity-70" />
                  <input
                    type="search"
                    className="grow"
                    placeholder="Buscar por cliente, teléfono o ID de venta..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={limpiarBusqueda}
                      className="opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <HiX className="w-4 h-4" />
                    </button>
                  )}
                </label>
              </div>

              {/* Estadísticas */}
              <div className="flex gap-4 text-sm">
                <div className="stat bg-primary text-primary-content rounded-box py-2 px-4">
                  <div className="stat-title text-primary-content/80 text-xs">Total</div>
                  <div className="stat-value text-lg">{ventas.length}</div>
                </div>
                <div className="stat bg-secondary text-secondary-content rounded-box py-2 px-4">
                  <div className="stat-title text-secondary-content/80 text-xs">Página</div>
                  <div className="stat-value text-lg">
                    {currentPage} / {totalPages || 1}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de ventas */}
        {ventas.length === 0 ? (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body text-center py-16">
              <HiDocumentText className="mx-auto text-6xl text-base-content/30 mb-4" />
              <h3 className="text-xl font-semibold text-base-content/70 mb-2">
                {searchTerm ? "No se encontraron ventas" : "No hay ventas registradas"}
              </h3>
              <p className="text-base-content/50 mb-4">
                {searchTerm
                  ? "Intenta con otros términos de búsqueda"
                  : "Las ventas aparecerán aquí una vez que se procesen"}
              </p>
              {!searchTerm && (
                <Link to="/nueva-venta" className="btn btn-primary">
                  <HiPlus />
                  Crear Primera Venta
                </Link>
              )}
              {searchTerm && (
                <button onClick={limpiarBusqueda} className="btn btn-outline">
                  <HiX />
                  Limpiar Búsqueda
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {ventasActuales.map((venta) => (
              <div
                key={venta.id}
                className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-200 hover:border-primary/20"
              >
                <div className="card-body">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Información principal */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">
                          Venta #{venta.id?.toString().padStart(3, "0")}
                        </h3>
                        <div className="badge badge-success gap-2">
                          <HiCheckCircle className="w-3 h-3" />
                          Completada
                        </div>
                        {/* Badge de número de productos */}
                        <div className="badge badge-outline">
                          {venta.items?.length || 0} productos
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-base-content/70">
                          <HiCalendar className="w-4 h-4 text-primary" />
                          <div>
                            <span className="block font-medium text-base-content">
                              {formatearFecha(venta.createdAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-base-content/70">
                          <HiUser className="w-4 h-4 text-primary" />
                          <div>
                            <span className="block font-medium text-base-content">
                              {venta.customer?.name || "N/A"} {venta.customer?.lastName || ""}
                            </span>
                            <div className="flex flex-col text-xs text-base-content/60">
                              <span>📞 {venta.customer?.phone || "Sin teléfono"}</span>
                              {venta.customer?.email && <span>✉️ {venta.customer.email}</span>}
                              {venta.customer?.address && <span>📍 {venta.customer.address}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <HiCurrencyDollar className="w-4 h-4 text-success" />
                          <div>
                            <span className="block text-xl font-bold text-success">
                              S/{calcularTotalVenta(venta.items).toFixed(2)}
                            </span>
                            <span className="text-xs text-base-content/60">Total</span>
                          </div>
                        </div>
                      </div>

                      {/* Preview de productos (primeros 3) */}
                      {venta.items && venta.items.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-base-200">
                          <div className="flex items-center gap-2 mb-2">
                            <HiPhotograph className="w-4 h-4 text-base-content/60" />
                            <span className="text-sm text-base-content/60">Productos:</span>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {venta.items.slice(0, 3).map((item, index) => (
                              <div key={index} className="badge badge-outline gap-1">
                                {item.name}
                                <span className="text-xs">x{item.OrderProduct?.amount || 0}</span>
                              </div>
                            ))}
                            {venta.items.length > 3 && (
                              <div className="badge badge-ghost">+{venta.items.length - 3} más</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => verDetalleVenta(venta.id)}
                        className="btn btn-outline btn-primary btn-sm hover:scale-105 transition-transform"
                      >
                        <HiEye />
                        Ver Detalle
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="card bg-base-100 shadow-lg mt-6">
                <div className="card-body p-4">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Info de paginación */}
                    <div className="text-sm text-base-content/70">
                      Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, ventas.length)}{" "}
                      de {ventas.length} ventas
                    </div>

                    {/* Controles de paginación */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={paginaAnterior}
                        disabled={currentPage === 1}
                        className="btn btn-outline btn-sm"
                      >
                        <HiChevronLeft />
                        Anterior
                      </button>

                      {/* Números de página */}
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((page) => {
                            return (
                              page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
                            );
                          })
                          .map((page, index, array) => (
                            <React.Fragment key={page}>
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <span className="px-2 py-1 text-base-content/60">...</span>
                              )}
                              <button
                                onClick={() => cambiarPagina(page)}
                                className={`btn btn-sm ${
                                  currentPage === page ? "btn-primary" : "btn-outline"
                                }`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          ))}
                      </div>

                      <button
                        onClick={paginaSiguiente}
                        disabled={currentPage === totalPages}
                        className="btn btn-outline btn-sm"
                      >
                        Siguiente
                        <HiChevronRight />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal para detalle de venta */}
        <dialog id="modal_detalle_venta" className="modal">
          <div className="modal-box w-11/12 max-w-4xl max-h-[90vh]">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>

            {selectedVenta && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <HiDocumentText className="text-3xl text-primary" />
                  <div>
                    <h3 className="font-bold text-2xl">
                      Venta #{selectedVenta.id?.toString().padStart(3, "0")}
                    </h3>
                    <p className="text-base-content/70">Detalles completos de la transacción</p>
                  </div>
                </div>

                {/* Stats rápidas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="stat bg-primary text-primary-content rounded-box">
                    <div className="stat-figure text-primary-content/70">
                      <HiCurrencyDollar className="w-8 h-8" />
                    </div>
                    <div className="stat-title text-primary-content/80">Total</div>
                    <div className="stat-value text-2xl">
                      S/{calcularTotalVenta(selectedVenta.items).toFixed(2)}
                    </div>
                  </div>

                  <div className="stat bg-secondary text-secondary-content rounded-box">
                    <div className="stat-figure text-secondary-content/70">
                      <HiPhotograph className="w-8 h-8" />
                    </div>
                    <div className="stat-title text-secondary-content/80">Productos</div>
                    <div className="stat-value text-2xl">{selectedVenta.items?.length || 0}</div>
                  </div>

                  <div className="stat bg-accent text-accent-content rounded-box">
                    <div className="stat-figure text-accent-content/70">
                      <HiCalendar className="w-8 h-8" />
                    </div>
                    <div className="stat-title text-accent-content/80">Fecha</div>
                    <div className="stat-value text-sm">
                      {formatearFecha(selectedVenta.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Información del cliente */}
                <div className="card bg-base-200 mb-4">
                  <div className="card-body p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <HiUser />
                      Información del Cliente
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div>
                          <span className="text-base-content/70 font-medium">Nombre completo:</span>
                          <div className="ml-2 font-semibold text-base-content">
                            {selectedVenta.customer?.name || "N/A"}{" "}
                            {selectedVenta.customer?.lastName || ""}
                          </div>
                        </div>
                        <div>
                          <span className="text-base-content/70 font-medium">Teléfono:</span>
                          <div className="ml-2 font-semibold text-base-content">
                            📞 {selectedVenta.customer?.phone || "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {selectedVenta.customer?.email && (
                          <div>
                            <span className="text-base-content/70 font-medium">Email:</span>
                            <div className="ml-2 font-semibold text-base-content">
                              ✉️ {selectedVenta.customer.email}
                            </div>
                          </div>
                        )}
                        <div>
                          <span className="text-base-content/70 font-medium">Dirección:</span>
                          <div className="ml-2 font-semibold text-base-content">
                            📍 {selectedVenta.customer?.address || "N/A"}
                          </div>
                        </div>
                        <div>
                          <span className="text-base-content/70 font-medium">Fecha de venta:</span>
                          <div className="ml-2 font-semibold text-base-content">
                            📅 {formatearFecha(selectedVenta.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Productos */}
                <div className="card bg-base-200">
                  <div className="card-body p-4">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <HiPhotograph />
                      Productos Vendidos
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="table table-xs">
                        <thead>
                          <tr>
                            <th>Imagen</th>
                            <th>Producto</th>
                            <th>Precio</th>
                            <th>Cantidad</th>
                            <th>Stock Actual</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedVenta.items?.map((item, index) => {
                            const stockBajo = verificarStockBajo(item);
                            return (
                              <tr key={index} className={stockBajo ? "bg-warning/10" : ""}>
                                <td>
                                  <div className="avatar">
                                    <div className="w-12 h-12 rounded-lg">
                                      {item.image ? (
                                        <img
                                          src={item.image}
                                          alt={item.name}
                                          className="w-full h-full object-cover rounded-lg"
                                          onError={(e) => {
                                            e.target.style.display = "none";
                                            e.target.nextSibling.style.display = "flex";
                                          }}
                                        />
                                      ) : null}
                                      <div
                                        className={`w-full h-full bg-base-300 rounded-lg flex items-center justify-center ${
                                          item.image ? "hidden" : "flex"
                                        }`}
                                      >
                                        <HiPhotograph className="w-6 h-6 text-base-content/50" />
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {item.name || "Producto no encontrado"}
                                    </span>
                                    {item.category && (
                                      <span className="text-xs text-base-content/60">
                                        {item.category.name}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td>S/{(item.price || 0).toFixed(2)}</td>
                                <td>
                                  <span className="badge badge-neutral">
                                    {item.OrderProduct?.amount || 0}
                                  </span>
                                </td>
                                <td>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`badge ${
                                        stockBajo ? "badge-warning" : "badge-success"
                                      }`}
                                    >
                                      {item.stock || 0}
                                    </span>
                                    {stockBajo && (
                                      <div className="tooltip" data-tip="Stock bajo">
                                        <HiExclamation className="w-4 h-4 text-warning" />
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="font-semibold">
                                  S/
                                  {((item.price || 0) * (item.OrderProduct?.amount || 0)).toFixed(
                                    2
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Alertas de stock bajo */}
                    {selectedVenta.items?.some((item) => verificarStockBajo(item)) && (
                      <div className="mt-4">
                        <div className="alert alert-warning">
                          <HiExclamation className="h-6 w-6 shrink-0" />
                          <div>
                            <h3 className="font-bold">¡Atención! Productos con stock bajo</h3>
                            <div className="text-xs mt-1">
                              Los siguientes productos tienen stock por debajo del límite
                              recomendado:
                              <ul className="list-disc list-inside mt-1">
                                {selectedVenta.items
                                  ?.filter((item) => verificarStockBajo(item))
                                  .map((item, index) => (
                                    <li key={index}>
                                      {item.name} (Stock: {item.stock || 0})
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Total */}
                    <div className="divider"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-xl font-bold text-primary">
                        S/{calcularTotalVenta(selectedVenta.items).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </dialog>
      </div>
    </Layout>
  );
};

export default VentaList;

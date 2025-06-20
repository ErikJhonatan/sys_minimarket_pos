import React, { useState, useEffect } from "react";
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineSearch,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineShoppingBag,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineUserAdd,
} from "react-icons/hi";
import Layout from "../../components/Layout";
import ClienteForm from "./ClienteForm";
import clienteApi from "../../api/clienteApi";

const ClienteList = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await clienteApi.getAll();
      if (response.length === 0) {
        setError("No se encontraron clientes.");
      }
      setClientes(response);
    } catch (error) {
      console.error("Error cargando clientes:", error);
      setError("Error al cargar los clientes. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCliente = async () => {
    try {
      await clienteApi.delete(selectedCliente.id);
      setShowDeleteModal(false);
      setSelectedCliente(null);
      loadClientes();
    } catch (error) {
      console.error("Error eliminando cliente:", error);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
  };

  // Filtrar clientes
  const filteredClientes = clientes.filter((cliente) => {
    if (!cliente) return false;

    const matchSearch =
      !searchTerm ||
      cliente.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.phone?.includes(searchTerm);

    const getClienteStatus = (cliente) => {
      const ordersCount = cliente.orders?.length || 0;
      if (ordersCount === 0) return "nuevo";
      return ordersCount >= 5 ? "frecuente" : "activo";
    };

    const matchStatus = !statusFilter || getClienteStatus(cliente) === statusFilter;

    return matchSearch && matchStatus;
  });

  // Calcular estadísticas
  const getEstadisticas = () => {
    const totalClientes = clientes.length;
    const clientesNuevos = clientes.filter((c) => !c.orders || c.orders.length === 0).length;
    const clientesFrecuentes = clientes.filter((c) => c.orders && c.orders.length >= 5).length;
    const totalOrdenes = clientes.reduce((sum, c) => sum + (c.orders?.length || 0), 0);

    return { totalClientes, clientesNuevos, clientesFrecuentes, totalOrdenes };
  };

  const estadisticas = getEstadisticas();

  // Funciones auxiliares
  const getClienteStatus = (cliente) => {
    const ordersCount = cliente.orders?.length || 0;
    if (ordersCount === 0) return { text: "Nuevo", badge: "badge-info" };
    if (ordersCount >= 5) return { text: "Frecuente", badge: "badge-success" };
    return { text: "Activo", badge: "badge-warning" };
  };

  const getUltimaCompra = (cliente) => {
    if (!cliente.orders || cliente.orders.length === 0) return null;
    // Ordenar por fecha más reciente
    const ultimaOrden = cliente.orders.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )[0];
    return new Date(ultimaOrden.createdAt).toLocaleDateString();
  };

  const getAvatarLetter = (cliente) => {
    return cliente.name?.charAt(0).toUpperCase() || "C";
  };

  const getAvatarColor = (cliente) => {
    const colors = [
      "bg-primary",
      "bg-secondary",
      "bg-accent",
      "bg-info",
      "bg-success",
      "bg-warning",
    ];
    const index = (cliente.id || 0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <span className="loading loading-spinner loading-lg"></span>
            <p className="mt-4 text-base-content/60">Cargando clientes...</p>
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
            <button className="btn btn-primary mt-4" onClick={loadClientes}>
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
              <h1 className="text-3xl font-bold text-base-content">Gestión de Clientes</h1>
              <p className="text-base-content/60 mt-1">Administra tu base de clientes</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary gap-2 shadow-lg"
            >
              <HiOutlinePlus size={20} />
              Nuevo Cliente
            </button>
          </div>

          {/* Cards de estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Clientes */}
            <div className="card bg-base-100 shadow-md">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-base-content/60">Total Clientes</h3>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {estadisticas.totalClientes}
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-full">
                    <HiOutlineUserAdd className="text-primary" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Clientes Nuevos */}
            <div className="card bg-base-100 shadow-md">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-base-content/60">Nuevos</h3>
                    <p className="text-2xl font-bold text-info mt-1">
                      {estadisticas.clientesNuevos}
                    </p>
                  </div>
                  <div className="p-3 bg-info/10 rounded-full">
                    <HiOutlineUserAdd className="text-info" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Clientes Frecuentes */}
            <div className="card bg-base-100 shadow-md">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-base-content/60">Frecuentes</h3>
                    <p className="text-2xl font-bold text-success mt-1">
                      {estadisticas.clientesFrecuentes}
                    </p>
                  </div>
                  <div className="p-3 bg-success/10 rounded-full">
                    <HiOutlineCheckCircle className="text-success" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Total Órdenes */}
            <div className="card bg-base-100 shadow-md">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-base-content/60">Total Órdenes</h3>
                    <p className="text-2xl font-bold text-accent mt-1">
                      {estadisticas.totalOrdenes}
                    </p>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-full">
                    <HiOutlineShoppingBag className="text-accent" size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4 space-y-4">
            {/* Búsqueda */}
            <div className="mb-6">
              <label className="input input-bordered flex items-center gap-2 max-w-md">
                <HiOutlineSearch className="w-4 h-4 opacity-70" />
                <input
                  type="text"
                  className="grow"
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </label>
            </div>

            {/* Filtros */}
            <div>
              <label className="label label-text font-medium mb-2">Estado del Cliente</label>
              <div className="filter">
                <input
                  className="btn filter-reset"
                  type="radio"
                  name="status-filter"
                  aria-label="Todos"
                  checked={statusFilter === ""}
                  onChange={() => setStatusFilter("")}
                />
                <input
                  className="btn"
                  type="radio"
                  name="status-filter"
                  aria-label="Nuevos"
                  checked={statusFilter === "nuevo"}
                  onChange={() => setStatusFilter("nuevo")}
                />
                <input
                  className="btn"
                  type="radio"
                  name="status-filter"
                  aria-label="Activos"
                  checked={statusFilter === "activo"}
                  onChange={() => setStatusFilter("activo")}
                />
                <input
                  className="btn"
                  type="radio"
                  name="status-filter"
                  aria-label="Frecuentes"
                  checked={statusFilter === "frecuente"}
                  onChange={() => setStatusFilter("frecuente")}
                />
              </div>
            </div>

            {/* Botón limpiar filtros */}
            {(searchTerm || statusFilter) && (
              <div className="flex justify-center">
                <button onClick={resetFilters} className="btn btn-outline btn-sm gap-2">
                  <HiOutlineSearch size={16} />
                  Limpiar filtros
                </button>
              </div>
            )}

            {/* Indicador de filtros activos */}
            {filteredClientes.length !== clientes.length && (
              <div className="alert alert-info py-2">
                <span className="text-sm">
                  Mostrando {filteredClientes.length} de {clientes.length} clientes
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Grid de clientes */}
        {clientes.length === 0 ? (
          <div className="text-center py-16">
            <div className="card bg-base-100 shadow-sm max-w-md mx-auto">
              <div className="card-body text-center">
                <HiOutlinePlus size={48} className="mx-auto text-base-content/30 mb-4" />
                <h3 className="card-title justify-center">No hay clientes</h3>
                <p className="text-base-content/60">Comienza agregando tu primer cliente</p>
                <div className="card-actions justify-center mt-4">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary gap-2"
                  >
                    <HiOutlinePlus size={18} />
                    Crear primer cliente
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : filteredClientes.length === 0 ? (
          <div className="text-center py-12">
            <div className="card bg-base-100 shadow-sm max-w-md mx-auto">
              <div className="card-body text-center">
                <HiOutlineSearch size={48} className="mx-auto text-base-content/30 mb-4" />
                <h3 className="card-title justify-center">Sin resultados</h3>
                <p className="text-base-content/60">
                  No se encontraron clientes con los filtros aplicados
                </p>
                <div className="card-actions justify-center mt-4">
                  <button onClick={resetFilters} className="btn btn-outline gap-2">
                    Limpiar filtros
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClientes.map((cliente) => {
              const status = getClienteStatus(cliente);
              const ultimaCompra = getUltimaCompra(cliente);

              return (
                <div
                  key={cliente.id}
                  className="card bg-base-100 shadow-sm hover:shadow-md transition-all duration-200 border border-base-300"
                >
                  {/* Header del card */}
                  <div className="card-body p-4">
                    {/* Avatar y acciones */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="avatar avatar-placeholder">
                          <div
                            className={`${getAvatarColor(
                              cliente
                            )} text-neutral-content rounded-full w-12`}
                          >
                            <span className="text-lg font-bold">{getAvatarLetter(cliente)}</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-base">
                            {cliente.name} {cliente.lastName}
                          </h3>
                          <div className={`badge ${status.badge} badge-sm`}>{status.text}</div>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex gap-1">
                        <div className="tooltip tooltip-left" data-tip="Editar">
                          <button
                            onClick={() => {
                              setSelectedCliente(cliente);
                              setShowEditModal(true);
                            }}
                            className="btn btn-xs btn-circle btn-ghost"
                          >
                            <HiOutlinePencil size={14} />
                          </button>
                        </div>
                        <div className="tooltip tooltip-left" data-tip="Eliminar">
                          <button
                            onClick={() => {
                              setSelectedCliente(cliente);
                              setShowDeleteModal(true);
                            }}
                            className="btn btn-xs btn-circle btn-ghost text-error"
                          >
                            <HiOutlineTrash size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Información de contacto */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-base-content/70">
                        <HiOutlinePhone size={16} />
                        <span>{cliente.phone || "Sin teléfono"}</span>
                      </div>

                      {cliente.address && (
                        <div className="flex items-center gap-2 text-sm text-base-content/70">
                          <HiOutlineLocationMarker size={16} />
                          <span className="truncate">{cliente.address}</span>
                        </div>
                      )}
                    </div>

                    <div className="divider my-3"></div>

                    {/* Estadísticas del cliente */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-sm text-base-content/60">Compras</p>
                        <p className="font-bold text-primary text-lg">
                          {cliente.orders?.length || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-base-content/60">Última compra</p>
                        <p className="text-xs text-base-content/70">{ultimaCompra || "Nunca"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Crear */}
        {showCreateModal && (
          <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
              <h3 className="font-bold text-lg mb-4">Crear Nuevo Cliente</h3>
              <ClienteForm
                onSuccess={() => {
                  setShowCreateModal(false);
                  loadClientes();
                }}
              />
              <div className="modal-action">
                <button className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar */}
        {showEditModal && selectedCliente && (
          <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
              <h3 className="font-bold text-lg mb-4">Editar Cliente</h3>
              <ClienteForm
                cliente={selectedCliente}
                onSuccess={() => {
                  setShowEditModal(false);
                  setSelectedCliente(null);
                  loadClientes();
                }}
              />
              <div className="modal-action">
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCliente(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Eliminar */}
        {showDeleteModal && selectedCliente && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Confirmar eliminación</h3>
              <p className="py-4">
                ¿Estás seguro de que deseas eliminar al cliente "
                <strong>
                  {selectedCliente.name} {selectedCliente.lastName}
                </strong>
                "? Esta acción no se puede deshacer.
              </p>
              <div className="modal-action">
                <button className="btn btn-error" onClick={handleDeleteCliente}>
                  Eliminar
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedCliente(null);
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

export default ClienteList;

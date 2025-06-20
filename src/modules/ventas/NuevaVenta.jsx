import React, { useState, useEffect } from "react";
import {
  HiSearch,
  HiShoppingCart,
  HiTrash,
  HiPlus,
  HiMinus,
  HiDocumentText,
  HiUser,
  HiCreditCard,
  HiCheckCircle,
  HiX,
  HiChevronLeft,
  HiChevronRight,
  HiRefresh,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import productoApi from "../../api/productoApi";
import clienteApi from "../../api/clienteApi";
import ventaApi from "../../api/ventaApi";

const NuevaVenta = () => {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCliente, setSearchCliente] = useState(""); // Búsqueda de clientes
  const [selectedClient, setSelectedClient] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

  // Estados para el selector de clientes mejorado
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientePage, setClientePage] = useState(1);
  const [clientesPerPage] = useState(10);

  // Estados para búsqueda por código
  const [productoPorCodigo, setProductoPorCodigo] = useState(null);

  // Estados para alertas
  const [alerts, setAlerts] = useState([]);
  const [lastClickTime, setLastClickTime] = useState(0);

  // Actualizar búsqueda por código cuando cambia el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setProductoPorCodigo(null);
      return;
    }

    const producto = productos.find(
      (p) => p.code === searchTerm || p.barcode === searchTerm || p.id.toString() === searchTerm
    );

    setProductoPorCodigo(producto);
  }, [searchTerm, productos]);

  // Estados para paginación de productos
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const navigate = useNavigate();

  useEffect(() => {
    cargarProductos();
    cargarClientes();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Función para agregar alertas
  const agregarAlerta = (tipo, mensaje) => {
    const id = Date.now() + Math.random(); // Hacer el ID más único
    const nuevaAlerta = { id, tipo, mensaje };

    setAlerts((prev) => {
      // Evitar duplicados del mismo mensaje
      const existeAlerta = prev.some((alert) => alert.mensaje === mensaje && alert.tipo === tipo);

      if (existeAlerta) {
        return prev;
      }

      return [...prev, nuevaAlerta];
    });

    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
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
          } transition-all duration-300 transform animate-pulse shadow-lg`}
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
            {alert.tipo === "info" && (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            )}
          </svg>
          <span className="text-sm">{alert.mensaje}</span>
          <button onClick={() => eliminarAlerta(alert.id)} className="btn btn-xs btn-ghost">
            <HiX />
          </button>
        </div>
      ))}
    </div>
  );

  const cargarProductos = async () => {
    try {
      const response = await productoApi.getAll();
      setProductos(response);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      agregarAlerta("error", "Error al cargar productos. Intenta nuevamente.");
    }
  };

  const cargarClientes = async () => {
    try {
      const response = await clienteApi.getAll();
      setClientes(response);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      agregarAlerta("error", "Error al cargar clientes. Intenta nuevamente.");
    }
  };

  const productosFiltrados = productos.filter((producto) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      producto.name?.toLowerCase().includes(searchLower) ||
      producto.id?.toString().includes(searchTerm) ||
      producto.code?.toLowerCase().includes(searchLower) ||
      producto.barcode?.toLowerCase().includes(searchLower)
    );
  });

  // Filtrar clientes por búsqueda
  const clientesFiltrados = clientes.filter((cliente) => {
    const nombreCompleto = `${cliente.name || ""} ${cliente.lastName || ""}`.toLowerCase();
    const telefono = cliente.phone || "";
    const email = cliente.email || "";

    return (
      nombreCompleto.includes(searchCliente.toLowerCase()) ||
      telefono.includes(searchCliente) ||
      email.toLowerCase().includes(searchCliente.toLowerCase())
    );
  });

  // Paginación de clientes
  const indexOfLastClient = clientePage * clientesPerPage;
  const indexOfFirstClient = indexOfLastClient - clientesPerPage;
  const clientesActuales = clientesFiltrados.slice(indexOfFirstClient, indexOfLastClient);
  const totalClientPages = Math.ceil(clientesFiltrados.length / clientesPerPage);

  // Funciones para manejar clientes
  const seleccionarCliente = (cliente) => {
    setSelectedClient(cliente.id.toString());
    setSearchCliente("");
    setShowClientDropdown(false);
    setClientePage(1);
    agregarAlerta("success", `Cliente seleccionado: ${cliente.name} ${cliente.lastName || ""}`);
  };

  const cambiarPaginaCliente = (page) => {
    setClientePage(page);
  };

  // Resetear página de clientes al buscar
  useEffect(() => {
    setClientePage(1);
  }, [searchCliente]);

  // Cerrar dropdown de clientes al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showClientDropdown && !event.target.closest(".client-selector")) {
        setShowClientDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showClientDropdown]);

  // Calcular paginación para productos
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const productosActuales = productosFiltrados.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);

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

  // Resetear página al buscar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const agregarAlCarrito = (producto) => {
    // Prevenir clics múltiples rápidos
    const now = Date.now();
    if (now - lastClickTime < 500) {
      // 500ms de debounce
      return;
    }
    setLastClickTime(now);

    // Verificar si hay stock disponible
    if (!producto.stock || producto.stock <= 0) {
      agregarAlerta("error", `No hay stock disponible para ${producto.name}`);
      return;
    }

    // Verificar cuántos productos ya están en el carrito
    const itemEnCarrito = carrito.find((item) => item.id === producto.id);
    const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;

    // Verificar si agregar uno más excedería el stock
    if (cantidadEnCarrito >= producto.stock) {
      agregarAlerta(
        "warning",
        `Stock insuficiente. Solo hay ${producto.stock} unidades disponibles de ${producto.name}`
      );
      return;
    }

    // Actualizar carrito y mostrar alerta apropiada
    const existente = carrito.find((item) => item.id === producto.id);
    if (existente) {
      setCarrito((prev) =>
        prev.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        )
      );
      agregarAlerta("info", `Se agregó una unidad más de ${producto.name} al carrito`);
    } else {
      setCarrito((prev) => [...prev, { ...producto, cantidad: 1 }]);
      agregarAlerta("success", `${producto.name} agregado al carrito`);
    }
  };

  const actualizarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(id);
      return;
    }

    // Encontrar el producto para verificar stock
    const producto = productos.find((p) => p.id === id);
    if (producto && nuevaCantidad > producto.stock) {
      agregarAlerta(
        "warning",
        `Stock insuficiente. Solo hay ${producto.stock} unidades disponibles de ${producto.name}`
      );
      return;
    }

    setCarrito((prev) =>
      prev.map((item) => (item.id === id ? { ...item, cantidad: nuevaCantidad } : item))
    );
  };

  const eliminarDelCarrito = (id) => {
    const producto = carrito.find((item) => item.id === id);
    if (producto) {
      agregarAlerta("info", `${producto.name} eliminado del carrito`);
    }
    setCarrito((prev) => prev.filter((item) => item.id !== id));
  };

  const calcularSubtotal = () => {
    return carrito.reduce((total, item) => total + item.price * item.cantidad, 0);
  };

  const calcularImpuesto = (subtotal) => {
    return subtotal * 0.1; // 10% de impuesto
  };

  const calcularTotal = () => {
    const subtotal = calcularSubtotal();
    const impuesto = calcularImpuesto(subtotal);
    return subtotal + impuesto;
  };

  const procesarVenta = async () => {
    if (carrito.length === 0) {
      agregarAlerta("warning", "El carrito está vacío");
      return;
    }

    if (clientes.length === 0) {
      agregarAlerta(
        "error",
        "No hay clientes disponibles. Crea al menos un cliente antes de procesar ventas."
      );
      return;
    }

    if (!selectedClient) {
      agregarAlerta("warning", "Por favor selecciona un cliente");
      return;
    }

    // Verificar stock de todos los productos en el carrito
    const productosConProblemas = carrito.filter((item) => {
      const producto = productos.find((p) => p.id === item.id);
      return !producto || item.cantidad > (producto.stock || 0);
    });

    if (productosConProblemas.length > 0) {
      agregarAlerta("error", `Algunos productos exceden el stock disponible. Revisa el carrito.`);
      return;
    }

    setProcessingPayment(true);
    try {
      // Crear la orden - el customerId es requerido
      const orderData = {
        customerId: parseInt(selectedClient),
      };

      console.log("Enviando orden:", orderData);
      const nuevaOrden = await ventaApi.create(orderData);
      console.log("Orden creada:", nuevaOrden);

      // Agregar productos a la orden
      for (const item of carrito) {
        const itemData = {
          orderId: nuevaOrden.newOrder.id,
          productId: item.id,
          amount: item.cantidad,
        };
        console.log("Agregando item:", itemData);
        await ventaApi.addItem(itemData);
      }

      // Limpiar carrito y formulario
      setCarrito([]);
      setSelectedClient("");

      // Mostrar mensaje de éxito y navegar al historial
      agregarAlerta("success", "¡Venta procesada exitosamente!");

      // Esperar un poco antes de navegar para que el usuario vea la alerta
      setTimeout(() => {
        navigate("/ventas");
      }, 2000);
    } catch (error) {
      console.error("Error al procesar venta:", error);

      // Mostrar mensaje de error más específico
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        agregarAlerta(
          "error",
          `Error al procesar la venta: ${error.response.data.message || "Error del servidor"}`
        );
      } else {
        agregarAlerta("error", "Error de conexión al procesar la venta");
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <Layout>
      {/* Contenedor de alertas */}
      <AlertContainer />

      <div className="min-h-screen bg-base-100">
        {/* Header */}
        <div className="bg-base-200 p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-base-content">Sistema de Ventas</h1>
              <p className="text-base-content/70 mt-1">Procesa las ventas de tu minimarket</p>
            </div>

            {/* Botón recargar datos */}
            <button
              onClick={() => {
                cargarProductos();
                cargarClientes();
                agregarAlerta("info", "Datos actualizados correctamente");
              }}
              className="btn btn-outline btn-primary"
            >
              <HiRefresh />
              Recargar Datos
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-full">
          {/* Panel izquierdo - Búsqueda de productos */}
          <div className="flex-1 p-6">
            {/* Búsqueda */}
            <div className="card bg-base-100 shadow-lg mb-6">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-4">
                  <HiSearch className="text-xl text-primary" />
                  <h2 className="card-title">Buscar Productos</h2>
                </div>

                {/* Búsqueda rápida por código */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Búsqueda rápida por código</span>
                    </label>
                    <label className="input input-bordered input-primary flex items-center gap-2">
                      <svg className="w-4 h-4 opacity-70" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <input
                        type="text"
                        className="grow"
                        placeholder="Escanea o escribe código/barcode..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && searchTerm) {
                            // Buscar producto exacto y agregarlo al carrito
                            const productoExacto = productos.find(
                              (p) =>
                                p.code === searchTerm ||
                                p.barcode === searchTerm ||
                                p.id.toString() === searchTerm
                            );
                            if (productoExacto) {
                              agregarAlCarrito(productoExacto);
                              setSearchTerm("");
                            }
                          }
                        }}
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="text-base-content/60 hover:text-base-content"
                        >
                          <HiX />
                        </button>
                      )}
                    </label>
                    <div className="label">
                      <span className="label-text-alt text-primary">
                        Presiona Enter para agregar directamente al carrito
                      </span>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Búsqueda general</span>
                    </label>
                    <label className="input input-bordered flex items-center gap-2">
                      <HiSearch className="h-4 w-4 opacity-70" />
                      <input
                        type="text"
                        className="grow"
                        placeholder="Buscar por nombre, código, barcode o ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="text-base-content/60 hover:text-base-content"
                        >
                          <HiX />
                        </button>
                      )}
                    </label>
                  </div>
                </div>

                {/* Estadísticas de productos */}
                <div className="flex gap-2">
                  <div className="stat bg-primary text-primary-content rounded-box py-2 px-3">
                    <div className="stat-title text-primary-content/80 text-xs">Encontrados</div>
                    <div className="stat-value text-lg">{productosFiltrados.length}</div>
                  </div>
                  <div className="stat bg-secondary text-secondary-content rounded-box py-2 px-3">
                    <div className="stat-title text-secondary-content/80 text-xs">Página</div>
                    <div className="stat-value text-lg">
                      {currentPage}/{totalPages || 1}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Producto encontrado por código exacto */}
            {productoPorCodigo && (
              <div className="card bg-primary/5 border border-primary/20 shadow-lg mb-6">
                <div className="card-body p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="badge badge-primary">
                      <HiCheckCircle className="w-3 h-3 mr-1" />
                      Producto encontrado
                    </div>
                    <div className="badge badge-outline">
                      Código:{" "}
                      {productoPorCodigo.code || productoPorCodigo.barcode || productoPorCodigo.id}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-24 h-24 bg-base-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {productoPorCodigo.image ? (
                        <img
                          src={productoPorCodigo.image}
                          alt={productoPorCodigo.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-full h-full flex items-center justify-center text-base-content/30 ${
                          productoPorCodigo.image ? "hidden" : "flex"
                        }`}
                      >
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-base-content">
                        {productoPorCodigo.name}
                      </h3>
                      <div className="space-y-1 mt-2">
                        <div className="flex flex-wrap gap-2">
                          <span className="badge badge-outline">ID: #{productoPorCodigo.id}</span>
                          {productoPorCodigo.code && (
                            <span className="badge badge-primary">
                              Código: {productoPorCodigo.code}
                            </span>
                          )}
                          {productoPorCodigo.barcode && (
                            <span className="badge badge-secondary">
                              Barcode: {productoPorCodigo.barcode}
                            </span>
                          )}
                        </div>
                        {productoPorCodigo.description && (
                          <p className="text-sm text-base-content/70 mt-2">
                            {productoPorCodigo.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        S/{productoPorCodigo.price?.toFixed(2)}
                      </div>
                      <div
                        className={`badge ${
                          productoPorCodigo.stock <= 0
                            ? "badge-error"
                            : productoPorCodigo.stock <= 10
                            ? "badge-warning"
                            : "badge-success"
                        } mt-2`}
                      >
                        {productoPorCodigo.stock <= 0
                          ? "Sin stock"
                          : `${productoPorCodigo.stock} unidades`}
                      </div>

                      {productoPorCodigo.stock > 0 && (
                        <button
                          onClick={() => {
                            agregarAlCarrito(productoPorCodigo);
                            setSearchTerm("");
                          }}
                          className="btn btn-primary btn-sm mt-3 w-full"
                        >
                          <HiPlus className="w-4 h-4" />
                          Agregar al carrito
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Grid de productos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productosFiltrados.length === 0 ? (
                <div className="col-span-full">
                  <div className="card bg-base-100 shadow-lg">
                    <div className="card-body text-center py-16">
                      <HiSearch className="mx-auto text-6xl text-base-content/30 mb-4" />
                      <h3 className="text-xl font-semibold text-base-content/70 mb-2">
                        {searchTerm
                          ? "No se encontraron productos"
                          : "No hay productos disponibles"}
                      </h3>
                      <p className="text-base-content/50">
                        {searchTerm
                          ? "Intenta con otros términos de búsqueda"
                          : "Agrega productos al inventario para comenzar a vender"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                productosActuales.map((producto) => {
                  const stockBajo = (producto.stock || 0) <= 10;
                  const sinStock = (producto.stock || 0) <= 0;

                  return (
                    <div
                      key={producto.id}
                      className={`card bg-base-100 border hover:shadow-lg transition-all duration-300 ${
                        sinStock ? "opacity-60" : "hover:scale-[1.02]"
                      }`}
                    >
                      <figure className="px-4 pt-4">
                        <div className="w-full h-32 bg-base-200 rounded-lg flex items-center justify-center overflow-hidden">
                          {producto.image ? (
                            <img
                              src={producto.image}
                              alt={producto.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-full h-full flex items-center justify-center text-base-content/30 ${
                              producto.image ? "hidden" : "flex"
                            }`}
                          >
                            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      </figure>

                      <div className="card-body p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-base-content text-sm line-clamp-2">
                              {producto.name}
                            </h3>
                            <div className="space-y-1">
                              <p className="text-xs text-base-content/60">ID: #{producto.id}</p>
                              {producto.code && (
                                <p className="text-xs text-primary font-mono bg-primary/10 px-2 py-1 rounded inline-block">
                                  Código: {producto.code}
                                </p>
                              )}
                              {producto.barcode && (
                                <p className="text-xs text-secondary font-mono bg-secondary/10 px-2 py-1 rounded inline-block ml-1">
                                  Barcode: {producto.barcode}
                                </p>
                              )}
                            </div>
                            {producto.description && (
                              <p className="text-xs text-base-content/50 line-clamp-1 mt-2">
                                {producto.description}
                              </p>
                            )}
                            <p className="text-lg font-bold text-primary mt-2">
                              S/{producto.price?.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-right">
                            <span
                              className={`badge text-xs ${
                                sinStock
                                  ? "badge-error"
                                  : stockBajo
                                  ? "badge-warning"
                                  : "badge-success"
                              }`}
                            >
                              {sinStock ? "Sin stock" : `${producto.stock || 0} unidades`}
                            </span>
                          </div>

                          {!sinStock && (
                            <button
                              onClick={() => agregarAlCarrito(producto)}
                              className="btn btn-primary btn-xs"
                            >
                              <HiPlus className="w-3 h-3" />
                              Agregar
                            </button>
                          )}
                        </div>

                        {sinStock && (
                          <div className="mt-2 p-2 bg-error/10 rounded-lg text-center">
                            <span className="text-error text-xs font-medium">Producto agotado</span>
                          </div>
                        )}

                        {stockBajo && !sinStock && (
                          <div className="mt-2 p-2 bg-warning/10 rounded-lg text-center">
                            <span className="text-warning text-xs font-medium">Stock bajo</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Paginación de productos */}
            {totalPages > 1 && (
              <div className="card bg-base-100 shadow-lg mt-6">
                <div className="card-body p-4">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Info de paginación */}
                    <div className="text-sm text-base-content/70">
                      Mostrando {indexOfFirstProduct + 1} -{" "}
                      {Math.min(indexOfLastProduct, productosFiltrados.length)} de{" "}
                      {productosFiltrados.length} productos
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

          {/* Panel derecho - Carrito */}
          <div className="w-full lg:w-96 bg-base-200 border-l">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <HiShoppingCart className="text-xl text-primary" />
                <h2 className="text-xl font-bold">Carrito ({carrito.length})</h2>
                {carrito.length > 0 && (
                  <div className="badge badge-primary">
                    {carrito.reduce((total, item) => total + item.cantidad, 0)} items
                  </div>
                )}
              </div>

              {/* Items del carrito */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {carrito.map((item) => {
                  const producto = productos.find((p) => p.id === item.id);
                  const stockDisponible = producto?.stock || 0;
                  const excedStock = item.cantidad > stockDisponible;

                  return (
                    <div
                      key={item.id}
                      className={`card bg-base-100 shadow-sm ${excedStock ? "border-error" : ""}`}
                    >
                      <div className="card-body p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{item.name}</h4>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-xs text-base-content/70">
                                S/{item.price?.toFixed(2)} c/u
                              </span>
                              {item.code && (
                                <span className="badge badge-outline badge-primary badge-xs">
                                  {item.code}
                                </span>
                              )}
                              <span
                                className={`badge badge-xs ${
                                  stockDisponible <= 0
                                    ? "badge-error"
                                    : stockDisponible <= 10
                                    ? "badge-warning"
                                    : "badge-success"
                                }`}
                              >
                                Stock: {stockDisponible}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => eliminarDelCarrito(item.id)}
                            className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                          >
                            <HiTrash />
                          </button>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            <span className="font-medium text-primary">
                              S/{(item.price * item.cantidad).toFixed(2)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                              className="btn btn-xs btn-circle btn-outline"
                              disabled={item.cantidad <= 1}
                            >
                              <HiMinus className="text-xs" />
                            </button>
                            <span
                              className={`text-sm font-medium w-8 text-center ${
                                excedStock ? "text-error" : ""
                              }`}
                            >
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                              className="btn btn-xs btn-circle btn-outline"
                              disabled={item.cantidad >= stockDisponible}
                            >
                              <HiPlus className="text-xs" />
                            </button>
                          </div>
                        </div>

                        {excedStock && (
                          <div className="mt-2 p-2 bg-error/10 rounded text-center">
                            <span className="text-error text-xs">
                              Cantidad excede stock disponible
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {carrito.length === 0 && (
                  <div className="text-center py-8 text-base-content/50">
                    <HiShoppingCart className="mx-auto text-4xl mb-2" />
                    <p>Carrito vacío</p>
                  </div>
                )}
              </div>

              {/* Resumen de totales */}
              {carrito.length > 0 && (
                <div className="card bg-base-100 shadow-lg mb-6">
                  <div className="card-body p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>S/{calcularSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Impuesto (10%):</span>
                        <span>S/{calcularImpuesto(calcularSubtotal()).toFixed(2)}</span>
                      </div>
                      <div className="divider my-2"></div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-primary">S/{calcularTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Selección de cliente */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <HiUser className="text-sm" />
                    Seleccionar cliente
                    <span className="text-error">*</span>
                  </span>
                </label>

                {/* Cliente seleccionado */}
                {selectedClient && (
                  <div className="mb-3 p-4 bg-success/10 border border-success/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="avatar avatar-placeholder">
                          <div className="bg-success text-success-content rounded-full w-10">
                            <span className="text-xs">
                              {(() => {
                                const cliente = clientes.find(
                                  (c) => c.id.toString() === selectedClient
                                );
                                return cliente
                                  ? `${cliente.name[0]}${
                                      (cliente.lastName || cliente.name)[0]
                                    }`.toUpperCase()
                                  : "?";
                              })()}
                            </span>
                          </div>
                        </div>
                        <div>
                          {(() => {
                            const cliente = clientes.find(
                              (c) => c.id.toString() === selectedClient
                            );
                            return cliente ? (
                              <div>
                                <div className="font-semibold text-success-content">
                                  {cliente.name} {cliente.lastName || ""}
                                </div>
                                <div className="text-xs text-success-content/70 space-x-3">
                                  {cliente.phone && <span>📞 {cliente.phone}</span>}
                                  {cliente.email && <span>✉️ {cliente.email}</span>}
                                </div>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedClient("");
                          setSearchCliente("");
                          agregarAlerta("info", "Cliente deseleccionado");
                        }}
                        className="btn btn-ghost btn-sm text-success-content hover:bg-success/20"
                      >
                        <HiX />
                        Cambiar
                      </button>
                    </div>
                  </div>
                )}

                {/* Buscador de clientes */}
                {!selectedClient && (
                  <div className="relative client-selector">
                    <div className="form-control">
                      <label className="input input-bordered flex items-center gap-2">
                        <HiSearch className="h-4 w-4 opacity-70" />
                        <input
                          type="text"
                          className="grow"
                          placeholder="Escribe para buscar cliente... (mín. 1 carácter)"
                          value={searchCliente}
                          onChange={(e) => {
                            setSearchCliente(e.target.value);
                            setShowClientDropdown(e.target.value.length > 0);
                          }}
                          onFocus={() => setShowClientDropdown(searchCliente.length > 0)}
                        />
                        {searchCliente && (
                          <button
                            onClick={() => {
                              setSearchCliente("");
                              setShowClientDropdown(false);
                            }}
                            className="text-base-content/60 hover:text-base-content"
                          >
                            <HiX />
                          </button>
                        )}
                      </label>
                    </div>

                    {/* Helper text */}
                    <div className="label">
                      <span className="text-base-content/60">Buscar cliente</span>
                    </div>

                    {/* Dropdown de clientes */}
                    {showClientDropdown && clientesFiltrados.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-xl max-h-80 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                        {/* Header del dropdown */}
                        <div className="p-3 bg-base-200 border-b border-base-300">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-base-content">
                              {clientesFiltrados.length} cliente
                              {clientesFiltrados.length !== 1 ? "s" : ""} encontrado
                              {clientesFiltrados.length !== 1 ? "s" : ""}
                            </span>
                            <button
                              onClick={() => setShowClientDropdown(false)}
                              className="btn btn-ghost btn-xs"
                            >
                              <HiX />
                            </button>
                          </div>
                        </div>

                        {/* Lista de clientes */}
                        <div className="max-h-64 overflow-y-auto">
                          {clientesActuales.map((cliente) => (
                            <button
                              key={cliente.id}
                              onClick={() => seleccionarCliente(cliente)}
                              className="w-full p-3 text-left hover:bg-primary/10 hover:border-l-4 hover:border-l-primary transition-all duration-200 border-b border-base-300 last:border-b-0 group"
                            >
                              {" "}
                              <div className="flex items-center gap-3">
                                <div className="avatar avatar-placeholder">
                                  <div className="bg-primary group-hover:bg-primary-focus text-primary-content rounded-full w-8 transition-colors duration-200">
                                    <span className="text-xs font-semibold">
                                      {`${cliente.name[0]}${
                                        (cliente.lastName || cliente.name)[0]
                                      }`.toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-base-content">
                                    {cliente.name} {cliente.lastName || ""}
                                  </div>
                                  <div className="text-sm text-base-content/70 space-x-3">
                                    {cliente.phone && <span>📞 {cliente.phone}</span>}
                                    {cliente.email && <span>✉️ {cliente.email}</span>}
                                  </div>
                                  {cliente.address && (
                                    <div className="text-xs text-base-content/50 mt-1">
                                      📍 {cliente.address}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>

                        {/* Paginación de clientes */}
                        {totalClientPages > 1 && (
                          <div className="p-3 bg-base-200 border-t border-base-300">
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-base-content/70">
                                Página {clientePage} de {totalClientPages}
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => cambiarPaginaCliente(clientePage - 1)}
                                  disabled={clientePage === 1}
                                  className="btn btn-xs btn-outline"
                                >
                                  <HiChevronLeft className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => cambiarPaginaCliente(clientePage + 1)}
                                  disabled={clientePage === totalClientPages}
                                  className="btn btn-xs btn-outline"
                                >
                                  <HiChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Estado sin resultados */}
                    {showClientDropdown && searchCliente && clientesFiltrados.length === 0 && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-xl p-4 text-center">
                        <HiUser className="mx-auto text-3xl text-base-content/30 mb-2" />
                        <p className="text-sm text-base-content/70">No se encontraron clientes</p>
                        <p className="text-xs text-base-content/50 mt-1 mb-3">
                          Intenta con otros términos de búsqueda
                        </p>
                        <button
                          onClick={() => {
                            setShowClientDropdown(false);
                            // Aquí podrías navegar a crear cliente o abrir un modal
                            agregarAlerta(
                              "info",
                              "Función para crear cliente nuevo - próximamente"
                            );
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          <HiPlus className="w-3 h-3" />
                          Crear nuevo cliente
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Mensaje de error */}
                {!selectedClient && (
                  <div className="label">
                    <span className="label-text-alt text-error">
                      {clientes.length === 0
                        ? "Debes crear al menos un cliente"
                        : "Cliente requerido"}
                    </span>
                  </div>
                )}

                {/* Estadísticas de clientes */}
                <div className="flex gap-2 mt-2">
                  <div className="stat bg-accent text-accent-content rounded-box py-1 px-2">
                    <div className="stat-title text-accent-content/80 text-xs">Total</div>
                    <div className="stat-value text-sm">{clientes.length}</div>
                  </div>
                  {searchCliente && (
                    <div className="stat bg-info text-info-content rounded-box py-1 px-2">
                      <div className="stat-title text-info-content/80 text-xs">Encontrados</div>
                      <div className="stat-value text-sm">{clientesFiltrados.length}</div>
                    </div>
                  )}
                  {selectedClient && (
                    <div className="stat bg-success text-success-content rounded-box py-1 px-2">
                      <div className="stat-title text-success-content/80 text-xs">Seleccionado</div>
                      <div className="stat-value text-sm">✓</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Método de pago */}
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <HiCreditCard className="text-sm" />
                    Método de pago
                  </span>
                </label>
                <select className="select select-bordered">
                  <option>Efectivo</option>
                  <option>Tarjeta</option>
                  <option>Transferencia</option>
                </select>
              </div>

              {/* Botón procesar venta */}
              <button
                onClick={procesarVenta}
                disabled={
                  carrito.length === 0 ||
                  !selectedClient ||
                  processingPayment ||
                  clientes.length === 0
                }
                className="btn btn-primary w-full"
              >
                {processingPayment ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <HiDocumentText />
                    {carrito.length === 0
                      ? "Carrito vacío"
                      : clientes.length === 0
                      ? "Sin clientes disponibles"
                      : !selectedClient
                      ? "Selecciona cliente"
                      : "Procesar Venta"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NuevaVenta;

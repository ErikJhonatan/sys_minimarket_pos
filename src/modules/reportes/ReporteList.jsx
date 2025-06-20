import React, { useState, useEffect } from "react";
import {
  HiOutlineCurrencyDollar,
  HiOutlineCube,
  HiOutlineUsers,
  HiOutlineShoppingCart,
  HiOutlineExclamation,
  HiOutlineChartBar,
  HiOutlineCalendar,
  HiOutlineRefresh,
} from "react-icons/hi";
import Layout from "../../components/Layout";
import StatCard from "../../components/StatCard";
import BarChart from "../../components/charts/BarChart";
import LineChart from "../../components/charts/LineChart";
import DoughnutChart from "../../components/charts/DoughnutChart";
import reporteApi from "../../api/reporteApi";
import { format, parseISO, subDays, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";

const ReporteList = () => {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("7days");
  const [activeTab, setActiveTab] = useState("resumen");
  const [dashboardData, setDashboardData] = useState({
    ventasTotal: 0,
    productosVendidos: 0,
    transacciones: 0,
    clientesUnicos: 0,
    ventasPorDia: [],
    ventasPorCategoria: [],
    productosMasVendidos: [],
    tendenciaVentas: [],
    estadisticasClientes: null,
    metricas: null,
  });

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Obtener todos los datos en paralelo
      const [
        data,
        ventasPorPeriodo,
        productosMasVendidos,
        ventasPorCategoria,
        estadisticasClientes,
        metricas,
      ] = await Promise.all([
        reporteApi.getDashboardData(),
        reporteApi.getVentasPorPeriodo(selectedPeriod),
        reporteApi.getProductosMasVendidos(5),
        reporteApi.getVentasPorCategoria(),
        reporteApi.getEstadisticasClientes(),
        reporteApi.getMetricasInventario(),
      ]);

      // Calcular estadísticas principales
      const ventasTotal = data.ventas.reduce((total, venta) => {
        if (venta.items && Array.isArray(venta.items)) {
          return (
            total +
            venta.items.reduce((ventaTotal, item) => {
              return ventaTotal + item.price * (item.OrderProduct?.amount || 1);
            }, 0)
          );
        }
        return total;
      }, 0);

      const productosVendidosTotal = data.ventas.reduce((total, venta) => {
        if (venta.items && Array.isArray(venta.items)) {
          return (
            total +
            venta.items.reduce((ventaTotal, item) => {
              return ventaTotal + (item.OrderProduct?.amount || 1);
            }, 0)
          );
        }
        return total;
      }, 0);

      const transacciones = data.ventas.length;
      const clientesUnicos = new Set(data.ventas.map((venta) => venta.customerId)).size;

      // Procesar ventas por día
      const hoy = new Date();
      const diasAtras = selectedPeriod === "30days" ? 29 : 6;
      const fechaInicio = subDays(hoy, diasAtras);
      const dias = eachDayOfInterval({ start: fechaInicio, end: hoy });

      const ventasPorDia = dias.map((dia) => {
        const diaStr = format(dia, "yyyy-MM-dd");
        const ventasDelDia = ventasPorPeriodo.filter(
          (venta) => format(parseISO(venta.createdAt), "yyyy-MM-dd") === diaStr
        );

        const totalDia = ventasDelDia.reduce((total, venta) => {
          if (venta.items && Array.isArray(venta.items)) {
            return (
              total +
              venta.items.reduce((ventaTotal, item) => {
                return ventaTotal + item.price * (item.OrderProduct?.amount || 1);
              }, 0)
            );
          }
          return total;
        }, 0);

        return {
          dia:
            selectedPeriod === "30days" ? format(dia, "dd/MM") : format(dia, "EEE", { locale: es }),
          total: totalDia,
        };
      });

      // Calcular tendencia de ventas (últimos 14 días para comparar)
      const hace14Dias = subDays(hoy, 13);
      const diasTendencia = eachDayOfInterval({ start: hace14Dias, end: hoy });

      const tendenciaVentas = diasTendencia.map((dia) => {
        const diaStr = format(dia, "yyyy-MM-dd");
        const ventasDelDia = data.ventas.filter(
          (venta) => format(parseISO(venta.createdAt), "yyyy-MM-dd") === diaStr
        );

        const totalDia = ventasDelDia.reduce((total, venta) => {
          if (venta.items && Array.isArray(venta.items)) {
            return (
              total +
              venta.items.reduce((ventaTotal, item) => {
                return ventaTotal + item.price * (item.OrderProduct?.amount || 1);
              }, 0)
            );
          }
          return total;
        }, 0);

        return {
          dia: format(dia, "dd/MM"),
          total: totalDia,
        };
      });

      setDashboardData({
        ventasTotal,
        productosVendidos: productosVendidosTotal,
        transacciones,
        clientesUnicos,
        ventasPorDia,
        ventasPorCategoria,
        productosMasVendidos,
        tendenciaVentas,
        estadisticasClientes,
        metricas,
      });
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Datos para gráfico de barras (ventas por día)
  const ventasPorDiaData = {
    labels: dashboardData.ventasPorDia.map((item) => item.dia),
    datasets: [
      {
        label: "Ventas ($)",
        data: dashboardData.ventasPorDia.map((item) => item.total),
        backgroundColor: "#3b82f6", // Azul claro
        borderColor: "#1d4ed8", // Azul más oscuro
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: "#60a5fa",
        hoverBorderColor: "#2563eb",
      },
    ],
  };

  // Datos para gráfico de dona (ventas por categoría)
  const ventasPorCategoriaData = {
    labels:
      dashboardData.ventasPorCategoria.length > 0
        ? dashboardData.ventasPorCategoria.map(
            (item) => item.name || item.categoryName || "Sin categoría"
          )
        : ["Sin datos"],
    datasets: [
      {
        data:
          dashboardData.ventasPorCategoria.length > 0
            ? dashboardData.ventasPorCategoria.map((item) => item.total || item.ventas || 0)
            : [1],
        backgroundColor:
          dashboardData.ventasPorCategoria.length > 0
            ? [
                "#3b82f6", // Azul
                "#10b981", // Verde
                "#f59e0b", // Amarillo
                "#ef4444", // Rojo
                "#8b5cf6", // Púrpura
                "#06b6d4", // Cian
                "#f97316", // Naranja
                "#84cc16", // Lima
                "#ec4899", // Rosa
                "#6b7280", // Gris
              ]
            : ["#e5e7eb"],
        borderWidth: 3,
        borderColor: "#ffffff",
        hoverBorderWidth: 4,
        hoverOffset: 10,
      },
    ],
  };

  // Datos para gráfico de barras por categoría
  const ventasPorCategoriaBarData = {
    labels:
      dashboardData.ventasPorCategoria.length > 0
        ? dashboardData.ventasPorCategoria.map(
            (item) => item.name || item.categoryName || "Sin categoría"
          )
        : ["Sin datos"],
    datasets: [
      {
        label: "Ventas por Categoría ($)",
        data:
          dashboardData.ventasPorCategoria.length > 0
            ? dashboardData.ventasPorCategoria.map((item) => item.total || item.ventas || 0)
            : [0],
        backgroundColor: [
          "#3b82f6", // Azul
          "#10b981", // Verde
          "#f59e0b", // Amarillo
          "#ef4444", // Rojo
          "#8b5cf6", // Púrpura
          "#06b6d4", // Cian
          "#f97316", // Naranja
          "#84cc16", // Lima
          "#ec4899", // Rosa
          "#6b7280", // Gris
        ],
        borderColor: [
          "#1d4ed8", // Azul oscuro
          "#059669", // Verde oscuro
          "#d97706", // Amarillo oscuro
          "#dc2626", // Rojo oscuro
          "#7c3aed", // Púrpura oscuro
          "#0891b2", // Cian oscuro
          "#ea580c", // Naranja oscuro
          "#65a30d", // Lima oscuro
          "#db2777", // Rosa oscuro
          "#4b5563", // Gris oscuro
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: [
          "#60a5fa",
          "#34d399",
          "#fbbf24",
          "#f87171",
          "#a78bfa",
          "#22d3ee",
          "#fb923c",
          "#a3e635",
          "#f472b6",
          "#9ca3af",
        ],
      },
    ],
  };

  // Datos para gráfico de línea (tendencia de ventas)
  const tendenciaVentasData = {
    labels: dashboardData.tendenciaVentas.map((item) => item.dia),
    datasets: [
      {
        label: "Tendencia de Ventas",
        data: dashboardData.tendenciaVentas.map((item) => item.total),
        fill: true,
        backgroundColor: "rgba(16, 185, 129, 0.1)", // Verde suave
        borderColor: "#10b981", // Verde
        borderWidth: 3,
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: "#059669",
        pointHoverBorderColor: "#ffffff",
        tension: 0.4,
      },
    ],
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-base-content">Reportes y Analíticas</h1>
            <p className="text-base-content/60 mt-1">
              Análisis detallado del rendimiento de tu minimarket
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleRefresh} className="btn btn-outline btn-sm" disabled={loading}>
              <HiOutlineRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </button>
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-outline btn-sm">
                <HiOutlineCalendar className="w-4 h-4" />
                {selectedPeriod === "7days" ? "Esta semana" : "Este mes"}
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <a
                    onClick={() => handlePeriodChange("7days")}
                    className={selectedPeriod === "7days" ? "active" : ""}
                  >
                    Esta semana
                  </a>
                </li>
                <li>
                  <a
                    onClick={() => handlePeriodChange("30days")}
                    className={selectedPeriod === "30days" ? "active" : ""}
                  >
                    Este mes
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="tabs tabs-boxed w-full">
          <a
            className={`tab ${activeTab === "resumen" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("resumen")}
          >
            <HiOutlineChartBar className="w-4 h-4 mr-2" />
            Resumen
          </a>
          <a
            className={`tab ${activeTab === "clientes" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("clientes")}
          >
            <HiOutlineUsers className="w-4 h-4 mr-2" />
            Clientes
          </a>
          <a
            className={`tab ${activeTab === "inventario" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("inventario")}
          >
            <HiOutlineCube className="w-4 h-4 mr-2" />
            Inventario
          </a>
        </div>

        {/* Contenido basado en el tab activo */}
        {activeTab === "resumen" && (
          <>
            {/* Estadísticas principales */}
            <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
              <StatCard
                title="Ventas Totales"
                value={formatCurrency(dashboardData.ventasTotal)}
                trend="up"
                trendValue="12.5"
                icon={HiOutlineCurrencyDollar}
                variant="primary"
              />
              <StatCard
                title="Productos Vendidos"
                value={dashboardData.productosVendidos.toLocaleString()}
                trend="up"
                trendValue="8.2"
                icon={HiOutlineCube}
                variant="info"
              />
              <StatCard
                title="Transacciones"
                value={dashboardData.transacciones.toLocaleString()}
                trend="up"
                trendValue="15.5"
                icon={HiOutlineShoppingCart}
                variant="accent"
              />
              <StatCard
                title="Clientes Únicos"
                value={dashboardData.clientesUnicos.toLocaleString()}
                trend="down"
                trendValue="4.7"
                icon={HiOutlineUsers}
                variant="success"
              />
            </div>

            {/* Gráficos principales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ventas por día */}
              <div className="card bg-base-100 shadow">
                <div className="card-body">
                  <h2 className="card-title text-base-content">
                    Ventas por Día (
                    {selectedPeriod === "7days" ? "Últimos 7 días" : "Últimos 30 días"})
                  </h2>
                  {dashboardData.ventasPorDia.length > 0 ? (
                    <BarChart data={ventasPorDiaData} height={300} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-base-content/60 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center">
                        <HiOutlineChartBar className="w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium">No hay datos de ventas disponibles</p>
                        <p className="text-sm">
                          Las ventas por día aparecerán aquí cuando haya datos
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ventas por categoría */}
              <div className="card bg-base-100 shadow">
                <div className="card-body">
                  <h2 className="card-title text-base-content">Ventas por Categoría</h2>
                  {dashboardData.ventasPorCategoria.length > 0 ? (
                    <DoughnutChart data={ventasPorCategoriaData} height={300} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-base-content/60 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center">
                        <HiOutlineChartBar className="w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium">No hay datos de categorías disponibles</p>
                        <p className="text-sm">Las ventas aparecerán aquí cuando haya datos</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Gráfico adicional de categorías */}
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title text-base-content">
                  <HiOutlineChartBar className="w-5 h-5" />
                  Análisis de Ventas por Categoría
                </h2>
                {dashboardData.ventasPorCategoria.length > 0 ? (
                  <BarChart data={ventasPorCategoriaBarData} height={300} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-base-content/60 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center">
                      <HiOutlineChartBar className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">No hay datos de categorías disponibles</p>
                      <p className="text-sm">
                        Las ventas por categorías aparecerán aquí cuando haya datos
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Top productos y tendencia */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top 5 productos más vendidos */}
              <div className="lg:col-span-2">
                <div className="card bg-base-100 shadow">
                  <div className="card-body">
                    <h2 className="card-title text-base-content mb-4">
                      <HiOutlineCube className="w-5 h-5" />
                      Top 5 Productos Más Vendidos
                    </h2>
                    <div className="space-y-3">
                      {dashboardData.productosMasVendidos.map((producto, index) => (
                        <div
                          key={producto.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-base-200 hover:bg-base-300 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="badge badge-primary font-bold text-lg w-8 h-8">
                              {index + 1}
                            </div>
                            <div className="avatar">
                              <div className="w-12 h-12 rounded">
                                <img
                                  src={
                                    producto.image ||
                                    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=48&h=48&fit=crop"
                                  }
                                  alt={producto.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                            <div>
                              <div className="font-semibold text-base-content">{producto.name}</div>
                              <div className="text-sm text-base-content/60">
                                {producto.code} • {producto.unidadesVendidas} unidades vendidas
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-success">
                              {formatCurrency(producto.totalVentas)}
                            </div>
                            <div className="text-xs text-base-content/60">Top {index + 1}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tendencia de ventas */}
              <div>
                <div className="card bg-base-100 shadow h-full">
                  <div className="card-body">
                    <h2 className="card-title text-base-content mb-4">
                      Tendencia de Ventas (14 días)
                    </h2>
                    {dashboardData.tendenciaVentas.length > 0 ? (
                      <LineChart data={tendenciaVentasData} height={250} />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 text-base-content/60 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center">
                          <HiOutlineChartBar className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-sm">Sin datos de tendencia</p>
                          <p className="text-xs">La tendencia aparecerá con más ventas</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tab de Clientes */}
        {activeTab === "clientes" && dashboardData.estadisticasClientes && (
          <>
            {/* Estadísticas de clientes */}
            <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
              <div className="stat">
                <div className="stat-figure text-primary">
                  <HiOutlineUsers className="w-8 h-8" />
                </div>
                <div className="stat-title">Total Clientes</div>
                <div className="stat-value text-primary">
                  {dashboardData.estadisticasClientes.totalClientes}
                </div>
                <div className="stat-desc">Registrados en el sistema</div>
              </div>
              <div className="stat">
                <div className="stat-figure text-success">
                  <HiOutlineShoppingCart className="w-8 h-8" />
                </div>
                <div className="stat-title">Clientes Activos</div>
                <div className="stat-value text-success">
                  {dashboardData.estadisticasClientes.clientesActivos}
                </div>
                <div className="stat-desc">Con al menos una compra</div>
              </div>
              <div className="stat">
                <div className="stat-figure text-warning">
                  <HiOutlineExclamation className="w-8 h-8" />
                </div>
                <div className="stat-title">Clientes Inactivos</div>
                <div className="stat-value text-warning">
                  {dashboardData.estadisticasClientes.clientesInactivos}
                </div>
                <div className="stat-desc">Sin compras registradas</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top clientes por cantidad de pedidos */}
              <div className="card bg-base-100 shadow">
                <div className="card-body">
                  <h2 className="card-title text-base-content mb-4">
                    <HiOutlineShoppingCart className="w-5 h-5" />
                    Top Clientes por Pedidos
                  </h2>
                  <div className="space-y-3">
                    {dashboardData.estadisticasClientes.topClientesPorPedidos.map(
                      (cliente, index) => (
                        <div
                          key={cliente.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-base-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="badge badge-accent font-bold text-lg w-8 h-8">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-semibold text-base-content">
                                {cliente.name} {cliente.lastName}
                              </div>
                              <div className="text-sm text-base-content/60">{cliente.phone}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-accent">
                              {cliente.totalPedidos} pedidos
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Top clientes por valor */}
              <div className="card bg-base-100 shadow">
                <div className="card-body">
                  <h2 className="card-title text-base-content mb-4">
                    <HiOutlineCurrencyDollar className="w-5 h-5" />
                    Top Clientes por Valor
                  </h2>
                  <div className="space-y-3">
                    {dashboardData.estadisticasClientes.topClientesPorValor.map(
                      (cliente, index) => (
                        <div
                          key={cliente.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-base-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="badge badge-primary font-bold text-lg w-8 h-8">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-semibold text-base-content">
                                {cliente.name} {cliente.lastName}
                              </div>
                              <div className="text-sm text-base-content/60">
                                {cliente.totalPedidos} pedidos • {cliente.phone}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-success">
                              {formatCurrency(cliente.valorTotal)}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tab de Inventario */}
        {activeTab === "inventario" && dashboardData.metricas && (
          <>
            {/* Estadísticas de inventario */}
            <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
              <div className="stat">
                <div className="stat-figure text-info">
                  <HiOutlineCube className="w-8 h-8" />
                </div>
                <div className="stat-title">Total Productos</div>
                <div className="stat-value text-info">{dashboardData.metricas.totalProductos}</div>
                <div className="stat-desc">{dashboardData.metricas.totalCategorias} categorías</div>
              </div>
              <div className="stat">
                <div className="stat-figure text-warning">
                  <HiOutlineExclamation className="w-8 h-8" />
                </div>
                <div className="stat-title">Stock Bajo</div>
                <div className="stat-value text-warning">
                  {dashboardData.metricas.productosStockBajo}
                </div>
                <div className="stat-desc">Requieren reabastecimiento</div>
              </div>
              <div className="stat">
                <div className="stat-figure text-error">
                  <HiOutlineExclamation className="w-8 h-8" />
                </div>
                <div className="stat-title">Agotados</div>
                <div className="stat-value text-error">
                  {dashboardData.metricas.productosAgotados}
                </div>
                <div className="stat-desc">Sin stock disponible</div>
              </div>
              <div className="stat">
                <div className="stat-figure text-success">
                  <HiOutlineCurrencyDollar className="w-8 h-8" />
                </div>
                <div className="stat-title">Valor Inventario</div>
                <div className="stat-value text-success text-lg">
                  {formatCurrency(dashboardData.metricas.valorTotalInventario)}
                </div>
                <div className="stat-desc">Valor total en stock</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Productos con stock bajo */}
              {dashboardData.metricas.detalleStockBajo.length > 0 && (
                <div className="card bg-base-100 shadow">
                  <div className="card-body">
                    <h2 className="card-title text-base-content mb-4">
                      <HiOutlineExclamation className="w-5 h-5 text-warning" />
                      Productos con Stock Bajo
                    </h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {dashboardData.metricas.detalleStockBajo.map((producto) => (
                        <div
                          key={producto.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20"
                        >
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-10 h-10 rounded">
                                <img
                                  src={
                                    producto.image ||
                                    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=40&h=40&fit=crop"
                                  }
                                  alt={producto.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                            <div>
                              <div className="font-semibold text-base-content">{producto.name}</div>
                              <div className="text-sm text-base-content/60">{producto.code}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="badge badge-warning">{producto.stock} en stock</div>
                            <div className="text-xs text-base-content/60">
                              Mín: {producto.stockMin}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Productos agotados */}
              {dashboardData.metricas.detalleAgotados.length > 0 && (
                <div className="card bg-base-100 shadow">
                  <div className="card-body">
                    <h2 className="card-title text-base-content mb-4">
                      <HiOutlineExclamation className="w-5 h-5 text-error" />
                      Productos Agotados
                    </h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {dashboardData.metricas.detalleAgotados.map((producto) => (
                        <div
                          key={producto.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-error/10 border border-error/20"
                        >
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-10 h-10 rounded grayscale">
                                <img
                                  src={
                                    producto.image ||
                                    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=40&h=40&fit=crop"
                                  }
                                  alt={producto.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                            <div>
                              <div className="font-semibold text-base-content">{producto.name}</div>
                              <div className="text-sm text-base-content/60">{producto.code}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="badge badge-error">Agotado</div>
                            <div className="text-xs text-base-content/60">
                              Precio: {formatCurrency(producto.price)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Mensaje si no hay productos con problemas */}
              {dashboardData.metricas.detalleStockBajo.length === 0 &&
                dashboardData.metricas.detalleAgotados.length === 0 && (
                  <div className="lg:col-span-2">
                    <div className="card bg-base-100 shadow">
                      <div className="card-body text-center py-12">
                        <HiOutlineCube className="w-16 h-16 text-success mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-base-content mb-2">
                          ¡Excelente!
                        </h3>
                        <p className="text-base-content/60">
                          Todos los productos tienen stock adecuado. No hay productos agotados ni
                          con stock bajo.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default ReporteList;

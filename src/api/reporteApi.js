import axios from "../api/axiosInstance";

const reporteApi = {
  // Obtener datos del dashboard
  getDashboardData: async () => {
    try {
      // Obtener datos de ventas, productos y clientes en paralelo
      const [ventasResponse, productosResponse, clientesResponse] = await Promise.all([
        axios.get("/orders"),
        axios.get("/products"),
        axios.get("/customers"),
      ]);

      const ventas = ventasResponse.data;
      const productos = productosResponse.data;
      const clientes = clientesResponse.data;

      return {
        ventas,
        productos,
        clientes,
      };
    } catch (error) {
      console.error("Error al obtener datos del dashboard:", error);
      throw error;
    }
  },

  // Obtener reporte de ventas por período
  getVentasPorPeriodo: async (periodo = "7days") => {
    try {
      const response = await axios.get(`/orders`);
      const ventas = response.data;

      // Procesar datos según el período
      const now = new Date();
      let fechaInicio;

      switch (periodo) {
        case "7days":
          fechaInicio = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30days":
          fechaInicio = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          fechaInicio = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      const ventasFiltradas = ventas.filter((venta) => new Date(venta.createdAt) >= fechaInicio);

      return ventasFiltradas;
    } catch (error) {
      console.error("Error al obtener ventas por período:", error);
      throw error;
    }
  },

  // Obtener productos más vendidos
  getProductosMasVendidos: async (limite = 5) => {
    try {
      const response = await axios.get("/orders");
      const ventas = response.data;

      const productosVendidos = {};

      ventas.forEach((venta) => {
        if (venta.items && Array.isArray(venta.items)) {
          venta.items.forEach((item) => {
            const productId = item.id;
            const cantidad = item.OrderProduct?.amount || 1;
            const precio = item.price || 0;

            if (!productosVendidos[productId]) {
              productosVendidos[productId] = {
                id: productId,
                name: item.name,
                code: item.code,
                image: item.image,
                categoryName: item.category?.name || "Sin categoría",
                unidadesVendidas: 0,
                totalVentas: 0,
              };
            }

            productosVendidos[productId].unidadesVendidas += cantidad;
            productosVendidos[productId].totalVentas += precio * cantidad;
          });
        }
      });

      return Object.values(productosVendidos)
        .sort((a, b) => b.unidadesVendidas - a.unidadesVendidas)
        .slice(0, limite);
    } catch (error) {
      console.error("Error al obtener productos más vendidos:", error);
      throw error;
    }
  },

  // Obtener ventas por categoría
  getVentasPorCategoria: async () => {
    try {
      const [ventasResponse, categoriasResponse] = await Promise.all([
        axios.get("/orders"),
        axios.get("/categories"),
      ]);

      const ventas = ventasResponse.data;
      const categorias = categoriasResponse.data;

      const ventasPorCategoria = {};

      // Inicializar con todas las categorías
      categorias.forEach((categoria) => {
        ventasPorCategoria[categoria.id] = {
          id: categoria.id,
          name: categoria.name,
          total: 0,
          cantidad: 0,
        };
      });

      // Procesar ventas
      ventas.forEach((venta) => {
        if (venta.items && Array.isArray(venta.items)) {
          venta.items.forEach((item) => {
            const categoriaId = item.categoryId || item.category?.id;
            const cantidad = item.OrderProduct?.amount || 1;
            const precio = item.price || 0;

            if (categoriaId && ventasPorCategoria[categoriaId]) {
              ventasPorCategoria[categoriaId].total += precio * cantidad;
              ventasPorCategoria[categoriaId].cantidad += cantidad;
            }
          });
        }
      });

      return Object.values(ventasPorCategoria).filter((categoria) => categoria.total > 0);
    } catch (error) {
      console.error("Error al obtener ventas por categoría:", error);
      throw error;
    }
  },

  // Obtener estadísticas de clientes
  getEstadisticasClientes: async () => {
    try {
      const [clientesResponse, ventasResponse] = await Promise.all([
        axios.get("/customers"),
        axios.get("/orders"),
      ]);

      const clientes = clientesResponse.data;
      const ventas = ventasResponse.data;

      const clientesConCompras = clientes.filter(
        (cliente) => cliente.orders && cliente.orders.length > 0
      );

      const clientesSinCompras = clientes.filter(
        (cliente) => !cliente.orders || cliente.orders.length === 0
      );

      // Top clientes por cantidad de pedidos
      const topClientesPorPedidos = clientes
        .map((cliente) => ({
          ...cliente,
          totalPedidos: cliente.orders?.length || 0,
          ultimaCompra:
            cliente.orders?.length > 0
              ? Math.max(...cliente.orders.map((order) => new Date(order.createdAt).getTime()))
              : null,
        }))
        .filter((cliente) => cliente.totalPedidos > 0)
        .sort((a, b) => b.totalPedidos - a.totalPedidos)
        .slice(0, 5);

      // Calcular valor total por cliente
      const clientesConValor = clientes
        .map((cliente) => {
          const ventasCliente = ventas.filter((venta) => venta.customerId === cliente.id);
          const valorTotal = ventasCliente.reduce((total, venta) => {
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
            ...cliente,
            valorTotal,
            totalPedidos: cliente.orders?.length || 0,
          };
        })
        .filter((cliente) => cliente.valorTotal > 0)
        .sort((a, b) => b.valorTotal - a.valorTotal)
        .slice(0, 5);

      return {
        totalClientes: clientes.length,
        clientesActivos: clientesConCompras.length,
        clientesInactivos: clientesSinCompras.length,
        topClientesPorPedidos,
        topClientesPorValor: clientesConValor,
      };
    } catch (error) {
      console.error("Error al obtener estadísticas de clientes:", error);
      throw error;
    }
  },

  // Obtener métricas de inventario
  getMetricasInventario: async () => {
    try {
      const response = await axios.get("/products");
      const productos = response.data;

      const productosConStockBajo = productos.filter(
        (producto) => producto.stock <= producto.stockMin
      );

      const productosAgotados = productos.filter((producto) => producto.stock === 0);

      const valorTotalInventario = productos.reduce(
        (total, producto) => total + producto.price * producto.stock,
        0
      );

      const categorias = [...new Set(productos.map((p) => p.category?.name).filter(Boolean))];

      return {
        totalProductos: productos.length,
        productosStockBajo: productosConStockBajo.length,
        productosAgotados: productosAgotados.length,
        valorTotalInventario,
        totalCategorias: categorias.length,
        detalleStockBajo: productosConStockBajo.slice(0, 10), // Top 10 con stock bajo
        detalleAgotados: productosAgotados.slice(0, 10), // Top 10 agotados
      };
    } catch (error) {
      console.error("Error al obtener métricas de inventario:", error);
      throw error;
    }
  },
};

export default reporteApi;

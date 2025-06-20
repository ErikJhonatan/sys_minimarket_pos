// src/routes/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Login from "../auth/Login";
import Dashboard from "../modules/dashboard/Dashboard";
import Categorias from "../modules/categorias/CategoriaList";
import Clientes from "../modules/clientes/ClienteList";
import VentaList from "../modules/ventas/VentaList";
import NuevaVenta from "../modules/ventas/NuevaVenta";
import Reportes from "../modules/reportes/ReporteList";
import Productos from "../modules/productos/ProductoList";
import ProtectedRoute from "../auth/ProtectedRoute";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Reportes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/productos"
          element={
            <ProtectedRoute>
              <Productos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/categorias"
          element={
            <ProtectedRoute>
              <Categorias />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clientes"
          element={
            <ProtectedRoute>
              <Clientes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ventas"
          element={
            <ProtectedRoute>
              <VentaList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nueva-venta"
          element={
            <ProtectedRoute>
              <NuevaVenta />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reportes"
          element={
            <ProtectedRoute>
              <Reportes />
            </ProtectedRoute>
          }
        />

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;

import React from "react";
import config from "../config";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdCategory,
  MdInventory,
  MdPeople,
  MdPointOfSale,
  MdBarChart,
  MdLogout,
  MdStorefront,
  MdAddShoppingCart,
  MdHistory,
} from "react-icons/md";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      path: "/reportes",
      name: "Dashboard de Ventas",
      icon: <MdBarChart className="h-5 w-5" />,
    },
    {
      path: "/categorias",
      name: "Categorías",
      icon: <MdCategory className="h-5 w-5" />,
    },
    {
      path: "/productos",
      name: "Productos",
      icon: <MdInventory className="h-5 w-5" />,
    },
    {
      path: "/clientes",
      name: "Clientes",
      icon: <MdPeople className="h-5 w-5" />,
    },
    {
      path: "/nueva-venta",
      name: "Nueva Venta",
      icon: <MdAddShoppingCart className="h-5 w-5" />,
    },
    {
      path: "/ventas",
      name: "Historial de Ventas",
      icon: <MdHistory className="h-5 w-5" />,
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem(config.nameItemJwt);
    navigate("/login");
  };

  return (
    <div className="w-64 bg-base-200 h-screen flex flex-col sticky top-0 overflow-y-auto">
      {/* Header */}
      <div className="p-4 flex-shrink-0">
        <div className="flex items-center gap-3 p-3 bg-base-100 rounded-box shadow-sm">
          <div className="avatar avatar-placeholder">
            <div className="bg-primary text-primary-content rounded-lg w-10">
              <MdStorefront className="h-6 w-6" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-base-content">{config.appName}</h1>
            <p className="text-sm text-base-content/70">Sistema POS</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 px-4 overflow-y-auto min-h-0">
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-base-content/60 uppercase tracking-wider px-3 mb-2">
            Navegación
          </h2>
        </div>

        <ul className="menu bg-base-100 rounded-box w-full p-2 gap-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 transition-all duration-200 ${
                  location.pathname === item.path
                    ? "bg-primary text-primary-content font-medium shadow-sm"
                    : "hover:bg-base-200 text-base-content"
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="flex-1">{item.name}</span>
                {location.pathname === item.path && (
                  <div className="w-2 h-2 bg-primary-content rounded-full"></div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* User Section & Logout */}
      <div className="p-4 mt-auto flex-shrink-0">
        <div className="divider my-2"></div>

        <button
          onClick={handleLogout}
          className="btn btn-ghost btn-block justify-start gap-3 text-base-content hover:bg-error hover:text-error-content transition-all duration-200"
        >
          <MdLogout className="h-5 w-5" />
          <span>Cerrar Sesión</span>
        </button>

        <div className="mt-3 p-2 text-center">
          <p className="text-xs text-base-content/50">v1.0.0 - © 2024</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

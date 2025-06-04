import React from 'react';
import config from '../config';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  MdDashboard,
  MdCategory,
  MdInventory,
  MdPeople,
  MdPointOfSale,
  MdBarChart,
  MdLogout
} from 'react-icons/md';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: <MdDashboard className="h-5 w-5" />
    },
    {
      path: '/categorias',
      name: 'Categorías',
      icon: <MdCategory className="h-5 w-5" />
    },
    {
      path: '/productos',
      name: 'Productos',
      icon: <MdInventory className="h-5 w-5" />
    },
    {
      path: '/clientes',
      name: 'Clientes',
      icon: <MdPeople className="h-5 w-5" />
    },
    {
      path: '/ventas',
      name: 'Ventas',
      icon: <MdPointOfSale className="h-5 w-5" />
    },
    {
      path: '/reportes',
      name: 'Reportes',
      icon: <MdBarChart className="h-5 w-5" />
    }
  ];

  const handleLogout = () => {
    // Limpiar localStorage/sessionStorage si es necesario
    localStorage.removeItem(config.nameItemJwt);
    // Redirigir al login
    navigate('/login');
  };

  return (
    <div className="w-64 bg-base-200 min-h-screen p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 p-3">
        <div className="bg-primary p-2 rounded-lg">
          <MdPointOfSale className="h-6 w-6 text-primary-content" />
        </div>
        <div>
          <h1 className="text-lg font-bold">MiniMarket POS</h1>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="space-y-2 flex-1">
        <h2 className="text-sm font-semibold text-base-content/70 uppercase tracking-wider px-3 mb-4">
          Gestión
        </h2>

        <ul className="menu bg-base-200 rounded-box w-full">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary text-primary-content'
                    : 'hover:bg-base-300'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Logout Button */}
      <div className="mt-auto pt-4 border-t border-base-300">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-error hover:text-error-content w-full text-left"
        >
          <MdLogout className="h-5 w-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

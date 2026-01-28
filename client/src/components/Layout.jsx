import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
// 1. Agregamos 'Church' a las importaciones
import { Menu, X, Users, Church, Calendar, DollarSign, Settings, Layers } from 'lucide-react';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { name: 'Personas', icon: <Users size={20} />, path: '/people' },
    { name: 'Planificación', icon: <Church size={20} />, path: '/plans' },
    // 2. Agregamos el nuevo ítem aquí:
    { name: 'Ministerios', icon: <Layers size={20} />, path: '/ministries' },
    { name: 'Eventos', icon: <Calendar size={20} />, path: '/events' },
    { name: 'Donaciones', icon: <DollarSign size={20} />, path: '/giving' },
    { name: 'Admin', icon: <Settings size={20} />, path: '/admin' },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Desktop y Móvil */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary text-white transform transition-transform duration-300 ease-in-out 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col`}
      >
        <div className="p-4 flex justify-between items-center bg-blue-900 md:bg-transparent">
          <h1 className="text-xl font-bold tracking-wide">MDSQ App</h1>
          <button onClick={toggleSidebar} className="md:hidden text-white hover:bg-white/10 rounded p-1">
            <X size={24} />
          </button>
        </div>
        
        <nav className="mt-4 flex-1">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link 
                key={item.name} 
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center px-6 py-3 transition-colors border-l-4
                  ${isActive 
                    ? 'bg-blue-800 border-white text-white' 
                    : 'border-transparent text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer del menú (Usuario actual) */}
        <div className="p-4 bg-blue-900/50 text-sm text-blue-200">
          <p>Host: mdsq.hcloud.one</p>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col overflow-hidden h-screen">
        {/* Header Móvil */}
        <header className="bg-white shadow-sm md:hidden p-4 flex items-center justify-between z-30">
          <div className="flex items-center">
            <button onClick={toggleSidebar} className="text-gray-600 hover:bg-gray-100 p-2 rounded-md">
              <Menu size={24} />
            </button>
            <span className="ml-4 font-semibold text-gray-800">Panel de Control</span>
          </div>
        </header>

        {/* Área de contenido scrolleable */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 relative">
          {children}
        </main>
      </div>
      
      {/* Overlay para móvil */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default Layout;
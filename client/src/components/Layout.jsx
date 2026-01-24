import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Users, Music, Calendar, DollarSign, Settings } from 'lucide-react';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'Personas', icon: <Users size={20} />, path: '/people' },
    { name: 'Planificación', icon: <Music size={20} />, path: '/plans' },
    { name: 'Eventos', icon: <Calendar size={20} />, path: '/events' },
    { name: 'Donaciones', icon: <DollarSign size={20} />, path: '/giving' },
    { name: 'Admin', icon: <Settings size={20} />, path: '/admin' },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Desktop y Móvil */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary text-white transform transition-transform duration-300 ease-in-out 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}
      >
        <div className="p-4 flex justify-between items-center bg-gray-900 md:bg-transparent">
          <h1 className="text-xl font-bold">MDSQ App</h1>
          {/* Botón cerrar solo en móvil */}
          <button onClick={toggleSidebar} className="md:hidden">
            <X size={24} />
          </button>
        </div>
        
        <nav className="mt-4">
          {menuItems.map((item) => (
            <Link 
              key={item.name} 
              to={item.path}
              onClick={() => setIsSidebarOpen(false)} // Auto-ocultar al click
              className="flex items-center px-6 py-3 hover:bg-white/10 transition-colors"
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Móvil */}
        <header className="bg-white shadow-sm md:hidden p-4 flex items-center">
          <button onClick={toggleSidebar} className="text-gray-600">
            <Menu size={24} />
          </button>
          <span className="ml-4 font-semibold text-gray-800">Panel de Control</span>
        </header>

        {/* Área de contenido scrolleable */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
      
      {/* Overlay para móvil */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default Layout;
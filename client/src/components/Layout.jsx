import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, Church, Calendar, Settings, Network, Layers, 
  Menu, X, Scan, QrCode, LogOut, Briefcase, Gift, Shield 
} from 'lucide-react';

const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // ROL POR DEFECTO PARA PRUEBAS (Luego vendrá del login)
  const [currentRole, setCurrentRole] = useState('ADMIN'); 

  const location = useLocation();

  const menusByRole = {
    // ADMIN: Ve todo + Configuración
    ADMIN: [
      { name: 'Personas', icon: <Users size={20} />, path: '/people' },
      { name: 'Planificación', icon: <Church size={20} />, path: '/plans' },
      { name: 'Áreas', icon: <Layers size={20} />, path: '/areas' },
      { name: 'Eventos', icon: <Calendar size={20} />, path: '/events' },
      { name: 'Aniversarios', icon: <Gift size={20} />, path: '/anniversaries' },
      { name: 'Organigrama', icon: <Network size={20} />, path: '/organigram' },
      { name: 'Configuración', icon: <Settings size={20} />, path: '/admin' },
    ],
    // LIDER: Operativo (sin config global)
    LIDER: [
      { name: 'Mi Equipo', icon: <Users size={20} />, path: '/people' },
      { name: 'Mis Planes', icon: <Church size={20} />, path: '/plans' },
      { name: 'Mis Áreas', icon: <Layers size={20} />, path: '/areas' },
      { name: 'Eventos', icon: <Calendar size={20} />, path: '/events' },
      { name: 'Aniversarios', icon: <Gift size={20} />, path: '/anniversaries' },
    ],
    // COLABORADOR: Vista personal
    COLABORADOR: [
      { name: 'Mi Credencial', icon: <QrCode size={20} />, path: '/credential' },
      { name: 'Mis Eventos', icon: <Calendar size={20} />, path: '/events' },
      { name: 'Aniversarios', icon: <Gift size={20} />, path: '/anniversaries' },
      { name: 'Mi Equipo', icon: <Network size={20} />, path: '/organigram' },
    ],
    // RECEPCION: Escaneo + Consulta
    RECEPCION: [
      { name: 'Escanear', icon: <Scan size={20} />, path: '/reception' },
      { name: 'Directorio', icon: <Users size={20} />, path: '/people' }, // <--- AGREGADO OTRA VEZ
    ]
  };

  // Seleccionamos el menú según el rol (fallback a Colaborador si falla)
  const menuItems = menusByRole[currentRole] || menusByRole['COLABORADOR'];

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-blue-900 tracking-tight">MDSQ<span className="text-blue-500">.app</span></h1>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-500"><X size={24} /></button>
        </div>

        {/* SELECTOR DE ROL (SOLO TEST) */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <label className="text-xs font-bold text-gray-400 uppercase">Simular Rol</label>
          <div className="flex items-center gap-2 mt-1">
            <Shield size={16} className="text-gray-500"/>
            <select 
              className="bg-transparent text-sm font-bold text-gray-700 outline-none w-full cursor-pointer"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
            >
              <option value="ADMIN">Administrador</option>
              <option value="LIDER">Líder</option>
              <option value="COLABORADOR">Colaborador</option>
              <option value="RECEPCION">Recepción</option>
            </select>
          </div>
        </div>

        <nav className="p-4 space-y-1 mt-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
          <button className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-500 w-full text-sm font-medium transition-colors">
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-8">
          <button onClick={() => setIsOpen(true)} className="md:hidden text-gray-600 hover:bg-gray-100 p-2 rounded-lg">
            <Menu size={24} />
          </button>
          
          <div className="ml-auto flex items-center gap-4">
             <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-800">Usuario Activo</p>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase">{currentRole}</span>
             </div>
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-white shadow-md flex items-center justify-center text-white font-bold">
               {currentRole[0]}
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50 relative">
           {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
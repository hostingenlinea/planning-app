import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <--- IMPORTANTE
import { 
  Users, Church, Calendar, Settings, Network, Layers, 
  Menu, X, Scan, QrCode, LogOut, Gift 
} from 'lucide-react';

const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth(); // <--- Usamos el usuario real
  const location = useLocation();

  // Mapeo: Rol de DB -> Clave de Menú
  // "Pastor" y "Admin" ven todo. "Lider" ve intermedio. "Colaborador" ve básico.
  let roleKey = 'COLABORADOR';
  const role = user?.role || '';
  
  if (role === 'Admin' || role === 'Pastor') roleKey = 'ADMIN';
  else if (role === 'Lider') roleKey = 'LIDER';
  else if (role === 'Recepción') roleKey = 'RECEPCION';

  const menusByRole = {
    ADMIN: [
      { name: 'Personas', icon: <Users size={20} />, path: '/people' },
      { name: 'Planificación', icon: <Church size={20} />, path: '/plans' },
      { name: 'Áreas', icon: <Layers size={20} />, path: '/areas' },
      { name: 'Eventos', icon: <Calendar size={20} />, path: '/events' },
      { name: 'Aniversarios', icon: <Gift size={20} />, path: '/anniversaries' },
      { name: 'Organigrama', icon: <Network size={20} />, path: '/organigram' },
      { name: 'Configuración', icon: <Settings size={20} />, path: '/admin' },
    ],
    LIDER: [
      { name: 'Mi Equipo', icon: <Users size={20} />, path: '/people' },
      { name: 'Mis Planes', icon: <Church size={20} />, path: '/plans' },
      { name: 'Mis Áreas', icon: <Layers size={20} />, path: '/areas' },
      { name: 'Eventos', icon: <Calendar size={20} />, path: '/events' },
      { name: 'Aniversarios', icon: <Gift size={20} />, path: '/anniversaries' },
    ],
    COLABORADOR: [
      { name: 'Mi Credencial', icon: <QrCode size={20} />, path: '/credential' },
      { name: 'Mis Eventos', icon: <Calendar size={20} />, path: '/events' },
      { name: 'Aniversarios', icon: <Gift size={20} />, path: '/anniversaries' },
      { name: 'Mi Equipo', icon: <Network size={20} />, path: '/organigram' },
    ],
    RECEPCION: [
      { name: 'Escanear', icon: <Scan size={20} />, path: '/reception' },
      { name: 'Directorio', icon: <Users size={20} />, path: '/people' },
    ]
  };

  const menuItems = menusByRole[roleKey] || menusByRole['COLABORADOR'];

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-blue-900 tracking-tight">MDSQ<span className="text-blue-500">.app</span></h1>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-500"><X size={24} /></button>
        </div>

        {/* INFO USUARIO */}
        <div className="px-6 py-6 bg-blue-50 border-b border-blue-100">
          <p className="text-xs font-bold text-blue-400 uppercase mb-1">Hola,</p>
          <h3 className="font-bold text-blue-900 truncate">{user?.name || 'Usuario'}</h3>
          <span className="inline-block mt-1 text-[10px] bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full font-bold uppercase">
            {user?.role}
          </span>
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
          <button 
            onClick={logout} 
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-500 w-full text-sm font-medium transition-colors"
          >
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
             <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white shadow-md flex items-center justify-center overflow-hidden">
               {user?.photo ? (
                 <img src={user.photo} alt="Avatar" className="w-full h-full object-cover"/>
               ) : (
                 <span className="text-blue-600 font-bold">{user?.firstName?.[0] || 'U'}</span>
               )}
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
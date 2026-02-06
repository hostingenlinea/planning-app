import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import { 
  Users, Church, Calendar, Settings, Network, Layers, 
  Menu, X, Scan, QrCode, LogOut, Gift, UserCog, MonitorPlay 
} from 'lucide-react';

const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);

  useEffect(() => {
    if (user?.member?.birthDate) {
      const today = new Date();
      const birth = new Date(user.member.birthDate);
      const tM = today.getMonth(); const tD = today.getDate();
      const bM = birth.getMonth(); const bD = birth.getDate();
      
      if (tM === bM && tD === bD) {
         if (!sessionStorage.getItem('birthdayGreeted')) {
           setShowBirthdayModal(true);
           launchConfetti();
           sessionStorage.setItem('birthdayGreeted', 'true');
         }
      }
    }
  }, [user]);

  const launchConfetti = () => {
    var duration = 3000;
    var end = Date.now() + duration;
    (function frame() {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  };

  // --- LÓGICA DE ROLES ---
  let roleKey = 'COLABORADOR';
  const role = user?.role || '';
  
  if (role === 'Admin' || role === 'Pastor') roleKey = 'ADMIN';
  else if (role === 'Productor') roleKey = 'PRODUCTOR';
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
    PRODUCTOR: [
      { name: 'Planificación', icon: <Church size={20} />, path: '/plans' },
      { name: 'Eventos', icon: <Calendar size={20} />, path: '/events' },
      { name: 'Directorio', icon: <Users size={20} />, path: '/people' },
      { name: 'Aniversarios', icon: <Gift size={20} />, path: '/anniversaries' },
    ],
    LIDER: [
      { name: 'Mi Equipo', icon: <Users size={20} />, path: '/people' },
      { name: 'Planificación', icon: <Church size={20} />, path: '/plans' }, // Acceso a ver
      { name: 'Mis Áreas', icon: <Layers size={20} />, path: '/areas' },
      { name: 'Eventos', icon: <Calendar size={20} />, path: '/events' },
      { name: 'Aniversarios', icon: <Gift size={20} />, path: '/anniversaries' },
    ],
    COLABORADOR: [
      { name: 'Mi Credencial', icon: <QrCode size={20} />, path: '/credential' },
      { name: 'Planificación', icon: <Church size={20} />, path: '/plans' }, // <--- AGREGADO PARA QUE PUEDAN VER
      { name: 'Mis Eventos', icon: <Calendar size={20} />, path: '/events' },
      { name: 'Aniversarios', icon: <Gift size={20} />, path: '/anniversaries' },
      { name: 'Mi Equipo', icon: <Network size={20} />, path: '/organigram' },
    ],
    RECEPCION: [
      { name: 'Escanear', icon: <Scan size={20} />, path: '/reception' },
      { name: 'Directorio', icon: <Users size={20} />, path: '/people' },
      { name: 'Planificación', icon: <Church size={20} />, path: '/plans' }, // <--- AGREGADO (Opcional)
    ]
  };
  const menuItems = menusByRole[roleKey] || menusByRole['COLABORADOR'];

  return (
    <div className="flex h-screen bg-gray-50">
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300`}>
        <div className="p-6 border-b flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-blue-900">MDSQ<span className="text-blue-500">.app</span></h1>
          <button onClick={() => setIsOpen(false)} className="md:hidden"><X size={24} /></button>
        </div>
        <div className="px-6 py-6 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-blue-400 uppercase mb-1">Hola,</p>
            <h3 className="font-bold text-blue-900 truncate max-w-[120px]">{user?.name}</h3>
          </div>
          <Link to="/profile" className="bg-white p-2 rounded-lg text-blue-600 shadow-sm hover:text-blue-800"><UserCog size={20}/></Link>
        </div>
        <nav className="p-4 space-y-1 mt-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>
                {item.icon} {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-500 w-full text-sm font-medium"><LogOut size={20} /> Cerrar Sesión</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-4 md:px-8">
          <button onClick={() => setIsOpen(true)} className="md:hidden text-gray-600 p-2"><Menu size={24} /></button>
          <div className="ml-auto w-10 h-10 rounded-full bg-gray-100 border-2 border-white shadow-md flex items-center justify-center overflow-hidden">
             {user?.photo ? <img src={user.photo} className="w-full h-full object-cover"/> : <span className="text-blue-600 font-bold">{user?.firstName?.[0]}</span>}
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50 relative">
           {children}
        </main>
      </div>

      {showBirthdayModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm mx-4 relative border-4 border-pink-200">
            <button onClick={() => setShowBirthdayModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 text-pink-500 animate-bounce"><Gift size={48} /></div>
            <h2 className="text-3xl font-extrabold text-gray-800 mb-2">¡Feliz Cumpleaños!</h2>
            <h3 className="text-xl font-bold text-pink-600 mb-4">{user.firstName}</h3>
            <p className="text-gray-500 mb-8">¡Que tengas un día extraordinario! Nos alegra mucho tenerte en el equipo.</p>
            <button onClick={() => setShowBirthdayModal(false)} className="bg-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-pink-700 shadow-lg">¡Muchas Gracias! 🎉</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default Layout;
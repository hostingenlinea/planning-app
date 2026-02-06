import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // <--- Agregamos useNavigate
import axios from 'axios';
import { Plus, Calendar, Clock, ChevronRight, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const Plans = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // <--- Hook para redirigir
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false); // <--- Estado para el botón de crear

  // --- PERMISO DE CREAR: SOLO ADMIN, PASTOR, PRODUCTOR ---
  const canCreate = ['Admin', 'Pastor', 'Productor'].includes(user?.role || '');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/services`);
      setServices(res.data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  // --- FUNCIÓN QUE FALTABA: CREAR NUEVO PLAN ---
  const handleCreate = async () => {
    if (!confirm('¿Crear un nuevo plan de reunión?')) return;
    setCreating(true);
    try {
      // Creamos un servicio con fecha de hoy por defecto
      const today = new Date();
      const res = await axios.post(`${API_URL}/api/services`, {
        name: 'Reunión General',
        date: today.toISOString(),
        leader: user.name
      });
      
      // Redirigimos al detalle para editarlo
      navigate(`/plans/${res.data.id}`);
    } catch (error) {
      console.error(error);
      alert('Error al crear el plan');
      setCreating(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-extrabold text-gray-800">Planificación</h1>
           <p className="text-gray-500 mt-1">Reuniones y liturgias</p>
        </div>
        
        {/* BOTÓN "NUEVO PLAN" AHORA SÍ FUNCIONA */}
        {canCreate && (
          <button 
            onClick={handleCreate} 
            disabled={creating}
            className="bg-blue-900 text-white px-5 py-3 rounded-xl hover:bg-blue-800 shadow-lg flex items-center gap-2 font-bold transition-transform active:scale-95 disabled:opacity-50"
          >
            {creating ? <Loader className="animate-spin" size={20}/> : <Plus size={20} />}
            <span>Nuevo Plan</span>
          </button>
        )}
      </div>

      {loading ? <div className="text-center py-20 text-gray-400">Cargando planes...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <Link to={`/plans/${service.id}`} key={service.id} className="block group">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 relative overflow-hidden">
                 
                 <div className="absolute top-0 right-0 bg-blue-50 w-24 h-24 rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:scale-110 transition-transform"></div>

                 <div className="relative z-10">
                   <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">{service.name}</h3>
                   <div className="flex flex-col gap-2 text-sm text-gray-500 mt-4">
                     <div className="flex items-center gap-2">
                       <Calendar size={16} className="text-blue-400"/>
                       {new Date(service.date).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                     </div>
                     <div className="flex items-center gap-2">
                       <Clock size={16} className="text-blue-400"/>
                       {new Date(service.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                     </div>
                   </div>
                 </div>

                 <div className="absolute bottom-6 right-6 text-gray-300 group-hover:text-blue-500 transition-colors">
                   <ChevronRight size={24} />
                 </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Plans;
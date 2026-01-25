import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // <--- 1. Importamos el hook de navegación
import { Plus, Calendar, Clock, ChevronRight } from 'lucide-react';
import CreateServiceModal from '../components/CreateServiceModal';

const API_URL = import.meta.env.VITE_API_URL;

const Plans = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const navigate = useNavigate(); // <--- 2. Inicializamos el hook aquí

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/services`);
      setServices(res.data);
    } catch (error) {
      console.error("Error cargando servicios:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para formatear fechas
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      dayName: new Intl.DateTimeFormat('es-AR', { weekday: 'long' }).format(date),
      dayNumber: date.getDate(),
      month: new Intl.DateTimeFormat('es-AR', { month: 'short' }).format(date),
      time: new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' }).format(date)
    };
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
             Planificación
          </h1>
          <p className="text-gray-500 text-sm mt-1">Administra tus cultos y eventos</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm"
        >
          <Plus size={20} />
          <span className="hidden md:inline">Nuevo Plan</span>
          <span className="md:hidden">Nuevo</span>
        </button>
      </div>

      {/* Grid de Servicios */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Cargando planificación...</div>
      ) : services.length === 0 ? (
        <div className="bg-white p-12 rounded-xl text-center shadow-sm border border-dashed border-gray-300">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">No hay servicios agendados próximamente.</p>
          <button onClick={() => setIsModalOpen(true)} className="text-blue-600 font-medium hover:underline">
            Crea tu primer servicio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => {
            const { dayName, dayNumber, month, time } = formatDate(service.date);
            const isPast = new Date(service.date) < new Date();

            return (
              <div 
                key={service.id} 
                onClick={() => navigate(`/plans/${service.id}`)} // <--- 3. AQUÍ ESTÁ EL CLICK
                className={`bg-white rounded-xl shadow-sm border border-gray-100 p-0 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer ${isPast ? 'opacity-60 grayscale' : ''}`}
              >
                <div className="flex h-full">
                  {/* Columna Fecha (Izquierda) */}
                  <div className={`w-24 flex flex-col items-center justify-center text-white p-2 text-center
                    ${service.type === 'Jóvenes' ? 'bg-orange-500' : 
                      service.type === 'Ensayo' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                    <span className="text-xs uppercase font-bold opacity-80">{month}</span>
                    <span className="text-3xl font-bold">{dayNumber}</span>
                    <span className="text-xs uppercase opacity-80">{dayName.slice(0,3)}</span>
                  </div>

                  {/* Columna Info (Derecha) */}
                  <div className="flex-1 p-4 flex flex-col justify-center">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{service.type}</span>
                      {isPast && <span className="bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded">PASADO</span>}
                    </div>
                    
                    <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                      {service.name}
                    </h3>
                    
                    <div className="flex items-center gap-1 text-gray-500 text-sm mt-2">
                      <Clock size={14} />
                      <span>{time} hs</span>
                    </div>
                  </div>

                  {/* Flecha Acción */}
                  <div className="flex items-center pr-3 text-gray-300 group-hover:text-blue-600 transition-colors">
                    <ChevronRight size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateServiceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onServiceCreated={fetchServices}
      />
    </div>
  );
};

export default Plans;
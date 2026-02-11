import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canManageServices } from '../utils/roles';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import CreateServiceModal from '../components/CreateServiceModal';

const API_URL = import.meta.env.VITE_API_URL;

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null); // Para pasar al modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const canCreate = canManageServices(user?.role);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/services`);
      setEvents(res.data);
    } catch (error) { console.error(error); }
  };

  // --- LÓGICA DEL CALENDARIO ---
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Domingo
    return { days, firstDay };
  };

  const { days, firstDay } = getDaysInMonth(currentDate);
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
    setCurrentDate(new Date(newDate));
  };

  const handleDayClick = (day) => {
    if (!canCreate) return;

    // Crear fecha seleccionada
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    setIsModalOpen(true);
  };

  const handleEventClick = (e, eventId) => {
    e.stopPropagation(); // Evitar que se abra el modal de crear
    navigate(`/plans/${eventId}`);
  };

  // Renderizar celdas
  const renderCalendarDays = () => {
    const blanks = Array(firstDay).fill(null);
    const daysArray = Array.from({ length: days }, (_, i) => i + 1);
    
    return [...blanks, ...daysArray].map((day, index) => {
      if (!day) return <div key={`blank-${index}`} className="bg-gray-50/50 border border-gray-100 min-h-[100px]"></div>;

      // Buscar eventos de este día
      const dayEvents = events.filter(e => {
        const d = new Date(e.date);
        return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
      });

      const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();

      return (
        <div 
          key={day} 
          onClick={() => handleDayClick(day)}
          className={`border border-gray-100 min-h-[100px] p-2 hover:bg-blue-50 transition cursor-pointer relative group ${isToday ? 'bg-blue-50/30' : 'bg-white'}`}
        >
          <span className={`text-sm font-bold ${isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-700'}`}>
            {day}
          </span>
          
          {/* Botón flotante '+' que aparece al hover */}
          {canCreate && (
            <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-blue-400 hover:text-blue-600">
              <Plus size={16}/>
            </button>
          )}

          <div className="mt-2 space-y-1">
            {dayEvents.map(ev => (
              <div 
                key={ev.id}
                onClick={(e) => handleEventClick(e, ev.id)}
                className={`text-[10px] px-1.5 py-1 rounded border truncate font-medium hover:scale-105 transition-transform shadow-sm
                  ${ev.type === 'Jovenes' ? 'bg-orange-100 text-orange-800 border-orange-200' : 
                    ev.type === 'Ensayo' ? 'bg-purple-100 text-purple-800 border-purple-200' : 
                    'bg-blue-100 text-blue-800 border-blue-200'}`}
              >
                {new Date(ev.date).toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})} {ev.name}
              </div>
            ))}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col">
      {/* Header Calendario */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <CalendarIcon size={28} /> Calendario de Eventos
          </h1>
          <p className="text-gray-500">Visualiza y programa tus servicios.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white shadow-sm border p-1 rounded-lg">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded text-gray-600"><ChevronLeft size={20}/></button>
          <span className="font-bold text-lg w-40 text-center text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded text-gray-600"><ChevronRight size={20}/></button>
        </div>
      </div>

      {/* Grilla Semanal */}
      <div className="grid grid-cols-7 bg-gray-100 border border-gray-200 rounded-t-lg">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
          <div key={d} className="p-3 text-center text-sm font-bold text-gray-500 uppercase tracking-wider">{d}</div>
        ))}
      </div>

      {/* Grilla Días */}
      <div className="grid grid-cols-7 border-l border-b border-gray-200 bg-gray-50 flex-1 overflow-auto rounded-b-lg shadow-inner">
        {renderCalendarDays()}
      </div>

      {/* Modal Crear Evento */}
      <CreateServiceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onServiceCreated={fetchEvents}
        preSelectedDate={selectedDate} // Pasamos la fecha clicada
      />
    </div>
  );
};

export default Events;

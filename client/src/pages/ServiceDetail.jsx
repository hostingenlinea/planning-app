import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Clock, Calendar, Plus, Music, Mic, 
  Monitor, Trash2, GripVertical 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para el formulario de nuevo ítem
  const [newItem, setNewItem] = useState({ title: '', duration: 5, type: 'SONG' });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/services/${id}`);
      setService(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      // Calculamos el orden (último + 1)
      const nextOrder = (service.plans.length > 0) 
        ? Math.max(...service.plans.map(p => p.order)) + 1 
        : 1;

      await axios.post(`${API_URL}/api/services/${id}/plan`, {
        ...newItem,
        order: nextOrder
      });
      
      setIsAdding(false);
      setNewItem({ title: '', duration: 5, type: 'SONG' }); // Reset
      fetchService(); // Recargar lista
    } catch (error) {
      alert('Error al agregar ítem');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if(!confirm('¿Borrar este ítem?')) return;
    try {
      await axios.delete(`${API_URL}/api/services/plan/${itemId}`);
      fetchService();
    } catch (error) {
      console.error(error);
    }
  };

  // Icono según tipo
  const getTypeIcon = (type) => {
    switch(type) {
      case 'SONG': return <Music size={18} className="text-blue-500"/>;
      case 'PREACHING': return <Mic size={18} className="text-purple-500"/>;
      case 'MEDIA': return <Monitor size={18} className="text-green-500"/>;
      default: return <Clock size={18} className="text-gray-400"/>;
    }
  };

  // Calcular tiempos acumulados
  let currentTime = new Date(service?.date || new Date());
  
  if (loading) return <div className="p-10 text-center">Cargando culto...</div>;
  if (!service) return <div className="p-10 text-center">No encontrado.</div>;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header de Navegación */}
      <div className="mb-6">
        <Link to="/plans" className="text-gray-500 hover:text-blue-600 flex items-center gap-1 mb-2">
          <ArrowLeft size={18} /> Volver a Planificación
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
            <div className="flex items-center gap-4 text-gray-500 mt-2 text-sm">
              <span className="flex items-center gap-1"><Calendar size={16}/> {new Date(service.date).toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><Clock size={16}/> {new Date(service.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} hs</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-bold uppercase">{service.type}</span>
            </div>
          </div>
          
          <div className="text-right">
             <div className="text-sm text-gray-400">Duración Total</div>
             <div className="text-xl font-bold text-gray-700">
               {service.plans.reduce((acc, curr) => acc + (curr.duration || 0), 0)} min
             </div>
          </div>
        </div>
      </div>

      {/* Área del Cronograma */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-bold text-gray-700">Orden del Servicio</h2>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="text-sm bg-white border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-2 shadow-sm"
          >
            <Plus size={16}/> Agregar Ítem
          </button>
        </div>

        {/* Formulario Rápido para Agregar */}
        {isAdding && (
          <form onSubmit={handleAddItem} className="bg-blue-50 p-4 border-b border-blue-100 flex flex-col md:flex-row gap-3 items-end animate-fade-in">
            <div className="flex-1 w-full">
              <label className="text-xs font-bold text-blue-800 uppercase">Título / Canción</label>
              <input 
                autoFocus
                className="w-full p-2 rounded border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej: Gracia Sublime es"
                value={newItem.title}
                onChange={e => setNewItem({...newItem, title: e.target.value})}
                required
              />
            </div>
            
            <div className="w-full md:w-32">
               <label className="text-xs font-bold text-blue-800 uppercase">Tipo</label>
               <select 
                  className="w-full p-2 rounded border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={newItem.type}
                  onChange={e => setNewItem({...newItem, type: e.target.value})}
               >
                 <option value="SONG">Canción</option>
                 <option value="PREACHING">Prédica</option>
                 <option value="ANNOUNCEMENT">Anuncio</option>
                 <option value="MEDIA">Video/Multimedia</option>
               </select>
            </div>

            <div className="w-full md:w-24">
               <label className="text-xs font-bold text-blue-800 uppercase">Minutos</label>
               <input 
                 type="number"
                 className="w-full p-2 rounded border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
                 value={newItem.duration}
                 onChange={e => setNewItem({...newItem, duration: e.target.value})}
               />
            </div>

            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 h-[42px]">
              Guardar
            </button>
          </form>
        )}

        {/* Lista de Ítems */}
        <div className="divide-y divide-gray-100">
          {service.plans.length === 0 ? (
            <div className="p-8 text-center text-gray-400 italic">
              Aún no hay ítems en el cronograma. ¡Agrega una canción o actividad!
            </div>
          ) : (
            service.plans.map((item, index) => {
              // Calculamos la hora estimada de inicio de este item
              const itemStartTime = new Date(currentTime);
              // Sumamos la duración para el siguiente loop
              currentTime.setMinutes(currentTime.getMinutes() + (item.duration || 0));

              return (
                <div key={item.id} className="group flex items-center p-3 hover:bg-gray-50 transition-colors gap-4">
                  
                  {/* Hora Estimada */}
                  <div className="w-16 text-xs text-gray-400 font-mono text-right hidden md:block">
                    {itemStartTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                  </div>

                  {/* Icono Tipo */}
                  <div className="p-2 bg-white border border-gray-100 rounded-lg shadow-sm">
                    {getTypeIcon(item.type)}
                  </div>

                  {/* Info Principal */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{item.title}</h4>
                    <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{item.duration} min</span>
                  </div>

                  {/* Acciones */}
                  <button 
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-gray-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="cursor-grab text-gray-300 hover:text-gray-500">
                    <GripVertical size={20}/>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
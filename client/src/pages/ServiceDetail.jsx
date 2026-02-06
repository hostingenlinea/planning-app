import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors 
} from '@dnd-kit/core';
import { 
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Calendar, Clock, Music, FileText, GripVertical, Trash2, Save, ArrowLeft, 
  PlayCircle, Timer, MonitorPlay, Mic, Lock, Users, HandHeart, Info, Megaphone,
  HeartHandshake, DoorOpen, Flame
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

// --- DICCIONARIO DE ESTILOS Y TIPOS (Configuración visual de los bloques) ---
const ITEM_STYLES = {
  // Logística y Entrada
  WALKIN:    { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: <DoorOpen size={20}/>, label: 'Walk-in' },
  PREROLL:   { color: 'bg-indigo-50 text-indigo-700 border-indigo-100', icon: <PlayCircle size={20}/>, label: 'Pre-roll' },
  WALKOUT:   { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: <DoorOpen size={20}/>, label: 'Walk-out' },

  // Música
  WORSHIP:   { color: 'bg-purple-50 text-purple-700 border-purple-100', icon: <Music size={20}/>, label: 'Worship' },
  SONG_END:  { color: 'bg-purple-50 text-purple-700 border-purple-100', icon: <Music size={20}/>, label: 'Canción Final' },

  // Conducción y Segmentos
  CONDUCCION:{ color: 'bg-blue-50 text-blue-700 border-blue-100', icon: <Mic size={20}/>, label: 'Conducción' },
  CONEXION:  { color: 'bg-cyan-50 text-cyan-700 border-cyan-100', icon: <Users size={20}/>, label: 'Conexión' },
  NOTICIAS:  { color: 'bg-sky-50 text-sky-700 border-sky-100', icon: <Info size={20}/>, label: 'Noticias' },
  ANUNCIOS:  { color: 'bg-sky-50 text-sky-700 border-sky-100', icon: <Megaphone size={20}/>, label: 'Anuncios' },
  VOLUNTARIO:{ color: 'bg-yellow-50 text-yellow-700 border-yellow-100', icon: <HeartHandshake size={20}/>, label: 'Voluntario del Mes' },

  // Espiritual / Liturgia
  OFRENDAS:  { color: 'bg-green-50 text-green-700 border-green-100', icon: <HandHeart size={20}/>, label: 'Ofrendas' },
  MENSAJE:   { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: <FileText size={20}/>, label: 'Mensaje' },
  MINISTRACION:{ color: 'bg-orange-50 text-orange-700 border-orange-100', icon: <Flame size={20}/>, label: 'Ministración' },
  LLAMADO:   { color: 'bg-red-50 text-red-700 border-red-100', icon: <Users size={20}/>, label: 'Llamado y Oración' },

  // Otros
  GENERIC:   { color: 'bg-white text-gray-700 border-gray-200', icon: <FileText size={20}/>, label: 'Bloque' },
};

// --- COMPONENTE DE FILA (ÍTEM DRAGGEABLE) ---
const SortableItem = ({ item, onDelete, onChange, canEdit }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  
  const style = { transform: CSS.Transform.toString(transform), transition };
  
  // Buscar estilo o usar genérico si no existe
  const theme = ITEM_STYLES[item.type] || ITEM_STYLES.GENERIC;

  return (
    <div ref={setNodeRef} style={style} className={`p-4 rounded-xl border shadow-sm flex items-center gap-4 mb-3 group hover:shadow-md transition-all ${theme.color} bg-white`}>
      {/* Manillar de arrastre */}
      {canEdit ? (
        <div {...attributes} {...listeners} className="text-gray-400 cursor-grab hover:text-gray-600">
          <GripVertical size={20} />
        </div>
      ) : <div className="w-5"></div>}

      {/* Icono */}
      <div className={`p-2 rounded-lg bg-white/60 shadow-sm`}>{theme.icon}</div>

      {/* Inputs de Texto */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
           <input 
             type="text" value={item.title} disabled={!canEdit}
             onChange={(e) => onChange(item.id, 'title', e.target.value)}
             className={`w-full font-bold text-gray-800 outline-none bg-transparent ${!canEdit && 'cursor-default'}`}
           />
           <input 
             type="text" value={item.description || ''} disabled={!canEdit}
             onChange={(e) => onChange(item.id, 'description', e.target.value)}
             className={`w-full text-sm text-gray-500 outline-none bg-transparent placeholder-gray-400 ${!canEdit && 'cursor-default'}`}
             placeholder="Detalles..."
           />
        </div>
        
        {/* Input de Tiempo */}
        <div className="flex items-center gap-2 justify-end md:justify-start">
           <Clock size={14} className="text-gray-400"/>
           <input 
             type="text" value={item.duration} disabled={!canEdit}
             onChange={(e) => onChange(item.id, 'duration', e.target.value)}
             className={`w-16 text-sm font-medium text-gray-600 bg-white/50 rounded px-2 py-1 text-center outline-none ${!canEdit && 'bg-transparent'}`}
           />
        </div>
      </div>

      {/* Botón Eliminar */}
      {canEdit && (
        <button onClick={() => onDelete(item.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [service, setService] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Permisos: Admin, Pastor, Productor
  const canEdit = ['Admin', 'Pastor', 'Productor'].includes(user?.role || '');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/services/${id}`);
      setService(res.data);
      // Ordenamos los ítems por la propiedad 'order'
      setItems(res.data.items ? res.data.items.sort((a, b) => a.order - b.order) : []);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleDragEnd = (event) => {
    if (!canEdit) return;
    const { active, over } = event;
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleChange = (itemId, field, value) => {
    if (!canEdit) return;
    setItems(items.map(i => i.id === itemId ? { ...i, [field]: value } : i));
  };

  const handleAddItem = (type) => {
    if (!canEdit) return;
    const styleDef = ITEM_STYLES[type] || ITEM_STYLES.GENERIC;
    
    const newItem = {
      id: Date.now(), // ID temporal para el frontend
      type,
      title: styleDef.label,
      description: '',
      duration: '5:00',
      isNew: true
    };
    
    setItems([...items, newItem]);
    
    // Auto scroll hacia abajo
    setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleDeleteItem = (itemId) => {
    if (!canEdit) return;
    if (!confirm('¿Quitar este ítem?')) return;
    setItems(items.filter(i => i.id !== itemId));
  };

  const handleSave = async () => {
    if (!canEdit) return;
    setSaving(true);
    try {
      // Preparamos los datos con el orden actualizado
      const payload = { 
        ...service, 
        items: items.map((item, index) => ({ 
          ...item, 
          order: index 
        })) 
      };
      
      await axios.put(`${API_URL}/api/services/${id}`, payload);
      alert('Planificación guardada con éxito ✅');
      fetchService(); // Recargamos para obtener los IDs reales de la base de datos
    } catch (error) {
      console.error(error);
      alert('Error al guardar. Verifica la conexión.');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-48"> 
      
      {/* CABECERA */}
      <div className="mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-blue-900 mb-4 text-sm font-bold">
          <ArrowLeft size={16}/> Volver
        </button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
             <h1 className="text-3xl font-extrabold text-gray-800">{service?.name}</h1>
             <div className="flex items-center gap-4 mt-2 text-gray-500">
               <span className="flex items-center gap-1"><Calendar size={16}/> {service?.date && new Date(service.date).toLocaleDateString()}</span>
             </div>
           </div>
           
           {canEdit && (
             <button onClick={handleSave} disabled={saving} className="bg-blue-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-800 flex items-center gap-2 shadow-lg transition-transform active:scale-95">
               {saving ? 'Guardando...' : <><Save size={18}/> Guardar Cambios</>}
             </button>
           )}
        </div>
      </div>

      {/* AVISO MODO LECTURA */}
      {!canEdit && (
        <div className="bg-gray-100 border border-gray-200 text-gray-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
          <Lock size={16}/> <span>Modo <b>Solo Lectura</b>. No tienes permisos para editar.</span>
        </div>
      )}

      {/* LISTA ORDENABBLE */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map(item => (
              <SortableItem 
                key={item.id} 
                item={item} 
                onDelete={handleDeleteItem} 
                onChange={handleChange} 
                canEdit={canEdit} 
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* BARRA DE HERRAMIENTAS FLOTANTE (Solo si puede editar) */}
      {canEdit && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 shadow-2xl rounded-2xl p-3 flex flex-col gap-2 z-50 max-w-[98vw]">
          
          <div className="text-[10px] font-bold text-gray-400 uppercase text-center mb-1 tracking-widest">Agregar Bloque</div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-2">
            
            {/* GRUPO 1: INICIO */}
            <AddBtn onClick={() => handleAddItem('WALKIN')} icon={<DoorOpen/>} label="Walk-in" color="gray"/>
            <AddBtn onClick={() => handleAddItem('PREROLL')} icon={<PlayCircle/>} label="Preroll" color="indigo"/>
            
            <div className="w-px bg-gray-200 mx-1 shrink-0"></div>

            {/* GRUPO 2: MÚSICA & CONDUCCIÓN */}
            <AddBtn onClick={() => handleAddItem('WORSHIP')} icon={<Music/>} label="Worship" color="purple"/>
            <AddBtn onClick={() => handleAddItem('CONDUCCION')} icon={<Mic/>} label="Conducción" color="blue"/>
            <AddBtn onClick={() => handleAddItem('CONEXION')} icon={<Users/>} label="Conexión" color="cyan"/>
            
            <div className="w-px bg-gray-200 mx-1 shrink-0"></div>

            {/* GRUPO 3: INFO & OFRENDAS */}
            <AddBtn onClick={() => handleAddItem('OFRENDAS')} icon={<HandHeart/>} label="Ofrendas" color="green"/>
            <AddBtn onClick={() => handleAddItem('NOTICIAS')} icon={<Info/>} label="Noticias" color="sky"/>
            <AddBtn onClick={() => handleAddItem('ANUNCIOS')} icon={<Megaphone/>} label="Anuncios" color="sky"/>
            <AddBtn onClick={() => handleAddItem('VOLUNTARIO')} icon={<HeartHandshake/>} label="Voluntario" color="yellow"/>

            <div className="w-px bg-gray-200 mx-1 shrink-0"></div>

            {/* GRUPO 4: MENSAJE & CIERRE */}
            <AddBtn onClick={() => handleAddItem('MENSAJE')} icon={<FileText/>} label="Mensaje" color="emerald"/>
            <AddBtn onClick={() => handleAddItem('MINISTRACION')} icon={<Flame/>} label="Ministración" color="orange"/>
            <AddBtn onClick={() => handleAddItem('LLAMADO')} icon={<Users/>} label="Llamado" color="red"/>
            <AddBtn onClick={() => handleAddItem('SONG_END')} icon={<Music/>} label="Final" color="purple"/>
            <AddBtn onClick={() => handleAddItem('WALKOUT')} icon={<DoorOpen/>} label="Walk-out" color="gray"/>

          </div>
        </div>
      )}
    </div>
  );
};

// Componente pequeño para los botones de la barra
const AddBtn = ({ onClick, icon, label, color }) => {
  const colorClasses = {
    gray: 'hover:bg-gray-100 hover:text-gray-900 text-gray-500',
    indigo: 'hover:bg-indigo-50 hover:text-indigo-700 text-gray-500',
    purple: 'hover:bg-purple-50 hover:text-purple-700 text-gray-500',
    blue: 'hover:bg-blue-50 hover:text-blue-700 text-gray-500',
    cyan: 'hover:bg-cyan-50 hover:text-cyan-700 text-gray-500',
    green: 'hover:bg-green-50 hover:text-green-700 text-gray-500',
    sky: 'hover:bg-sky-50 hover:text-sky-700 text-gray-500',
    yellow: 'hover:bg-yellow-50 hover:text-yellow-700 text-gray-500',
    emerald: 'hover:bg-emerald-50 hover:text-emerald-700 text-gray-500',
    orange: 'hover:bg-orange-50 hover:text-orange-700 text-gray-500',
    red: 'hover:bg-red-50 hover:text-red-700 text-gray-500',
  };

  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition min-w-[70px] shrink-0 ${colorClasses[color] || colorClasses.gray}`}>
      {React.cloneElement(icon, { size: 20 })}
      <span className="text-[9px] font-bold uppercase truncate max-w-full">{label}</span>
    </button>
  );
};

export default ServiceDetail;
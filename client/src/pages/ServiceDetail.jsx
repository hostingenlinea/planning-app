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
  PlayCircle, Timer, MonitorPlay, Mic 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

// --- DICCIONARIO DE ESTILOS POR TIPO ---
const ITEM_STYLES = {
  SONG: { color: 'bg-purple-50 text-purple-700 border-purple-100', icon: <Music size={20}/> },
  TIMELITE: { color: 'bg-orange-50 text-orange-700 border-orange-100', icon: <Timer size={20}/> },
  PREROLL: { color: 'bg-indigo-50 text-indigo-700 border-indigo-100', icon: <PlayCircle size={20}/> },
  LOOP: { color: 'bg-blue-50 text-blue-700 border-blue-100', icon: <MonitorPlay size={20}/> },
  PREDICA: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: <Mic size={20}/> },
  GENERIC: { color: 'bg-gray-50 text-gray-700 border-gray-100', icon: <FileText size={20}/> },
};

const SortableItem = ({ item, onDelete, onChange, canEdit }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  
  const style = { transform: CSS.Transform.toString(transform), transition };
  
  // Obtener estilo según el tipo (o usar genérico si no existe)
  const theme = ITEM_STYLES[item.type] || ITEM_STYLES.GENERIC;

  return (
    <div ref={setNodeRef} style={style} className={`p-4 rounded-xl border shadow-sm flex items-center gap-4 mb-3 group hover:shadow-md transition-all ${theme.color} bg-white`}>
      {/* Manillar (Drag Handle) */}
      {canEdit ? (
        <div {...attributes} {...listeners} className="text-gray-400 cursor-grab hover:text-gray-600">
          <GripVertical size={20} />
        </div>
      ) : <div className="w-5"></div>}

      {/* Icono del Tipo */}
      <div className={`p-2 rounded-lg bg-white/60 shadow-sm`}>
        {theme.icon}
      </div>

      {/* Inputs */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
           <input 
             type="text" value={item.title} placeholder="Título..." disabled={!canEdit}
             onChange={(e) => onChange(item.id, 'title', e.target.value)}
             className={`w-full font-bold text-gray-800 outline-none bg-transparent ${!canEdit && 'cursor-default'}`}
           />
           <input 
             type="text" value={item.description || ''} placeholder="Detalle..." disabled={!canEdit}
             onChange={(e) => onChange(item.id, 'description', e.target.value)}
             className={`w-full text-sm text-gray-500 outline-none bg-transparent placeholder-gray-400 ${!canEdit && 'cursor-default'}`}
           />
        </div>
        <div className="flex items-center gap-2 justify-end md:justify-start">
           <Clock size={14} className="text-gray-400"/>
           <input 
             type="text" value={item.duration} placeholder="00:00" disabled={!canEdit}
             onChange={(e) => onChange(item.id, 'duration', e.target.value)}
             className={`w-16 text-sm font-medium text-gray-600 bg-white/50 rounded px-2 py-1 text-center outline-none ${!canEdit && 'bg-transparent'}`}
           />
        </div>
      </div>

      {/* Botón Borrar */}
      {canEdit && (
        <button onClick={() => onDelete(item.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
};

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [service, setService] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- PERMISOS: Admin, Pastor, Productor ---
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
      // Asegurar que vengan ordenados
      const sorted = res.data.items ? res.data.items.sort((a, b) => a.order - b.order) : [];
      setItems(sorted);
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

  // --- AGREGAR ÍTEMS PREDEFINIDOS ---
  const handleAddItem = (type, defaultTitle) => {
    if (!canEdit) return;
    const newItem = {
      id: Date.now(),
      type,
      title: defaultTitle,
      description: '',
      duration: '5:00',
      isNew: true
    };
    setItems([...items, newItem]);
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
      const payload = {
        ...service,
        items: items.map((item, index) => ({ ...item, order: index }))
      };
      await axios.put(`${API_URL}/api/services/${id}`, payload);
      alert('Planificación guardada');
      fetchService(); 
    } catch (error) {
      alert('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Cargando planificación...</div>;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-32"> {/* pb-32 para dar espacio a la barra inferior */}
      
      {/* HEADER */}
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

      {/* ALERTA READ-ONLY */}
      {!canEdit && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
          <MonitorPlay size={16}/>
          <span>Estás en modo <b>Solo Lectura</b>. Contacta a un Productor para realizar cambios.</span>
        </div>
      )}

      {/* LISTA DRAG & DROP */}
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

      {/* BARRA DE HERRAMIENTAS FLOTANTE (SOLO ADMIN/PASTOR/PRODUCTOR) */}
      {canEdit && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 shadow-2xl rounded-2xl p-2 flex gap-2 overflow-x-auto max-w-[95vw] z-50">
          
          <button onClick={() => handleAddItem('TIMELITE', 'Timelite')} className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-orange-50 text-gray-600 hover:text-orange-600 transition min-w-[80px]">
            <Timer size={20}/> <span className="text-[10px] font-bold uppercase">Timelite</span>
          </button>

          <button onClick={() => handleAddItem('PREROLL', 'Pre-Roll')} className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 transition min-w-[80px]">
            <PlayCircle size={20}/> <span className="text-[10px] font-bold uppercase">Pre-Roll</span>
          </button>

          <button onClick={() => handleAddItem('LOOP', 'Loop Anuncios')} className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition min-w-[80px]">
            <MonitorPlay size={20}/> <span className="text-[10px] font-bold uppercase">Loop</span>
          </button>

          <div className="w-px bg-gray-200 mx-1"></div>

          <button onClick={() => handleAddItem('SONG', 'Nueva Canción')} className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-purple-50 text-gray-600 hover:text-purple-600 transition min-w-[80px]">
            <Music size={20}/> <span className="text-[10px] font-bold uppercase">Canción</span>
          </button>

          <button onClick={() => handleAddItem('PREDICA', 'Mensaje')} className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-emerald-50 text-gray-600 hover:text-emerald-600 transition min-w-[80px]">
            <Mic size={20}/> <span className="text-[10px] font-bold uppercase">Prédica</span>
          </button>

          <div className="w-px bg-gray-200 mx-1"></div>

          <button onClick={() => handleAddItem('GENERIC', 'Bloque')} className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition min-w-[80px]">
            <FileText size={20}/> <span className="text-[10px] font-bold uppercase">Otro</span>
          </button>

        </div>
      )}
    </div>
  );
};

export default ServiceDetail;
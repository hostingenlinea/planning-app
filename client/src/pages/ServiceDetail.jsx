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
  Calendar, Clock, Music, FileText, GripVertical, Trash2, Plus, Save, ArrowLeft 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const SortableItem = ({ item, onDelete, onChange, canEdit }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 mb-3 group hover:border-blue-200 transition-colors">
      {canEdit ? (
        <div {...attributes} {...listeners} className="text-gray-300 cursor-grab hover:text-blue-500">
          <GripVertical size={20} />
        </div>
      ) : <div className="w-5"></div>}

      <div className={`p-2 rounded-lg ${item.type === 'SONG' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
        {item.type === 'SONG' ? <Music size={20}/> : <FileText size={20}/>}
      </div>

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
             className={`w-full text-sm text-gray-500 outline-none bg-transparent ${!canEdit && 'cursor-default'}`}
           />
        </div>
        <div className="flex items-center gap-2">
           <Clock size={14} className="text-gray-400"/>
           <input 
             type="text" value={item.duration} placeholder="00:00" disabled={!canEdit}
             onChange={(e) => onChange(item.id, 'duration', e.target.value)}
             className={`w-16 text-sm font-medium text-gray-600 bg-gray-50 rounded px-2 py-1 text-center outline-none ${!canEdit && 'bg-transparent'}`}
           />
        </div>
      </div>

      {canEdit && (
        <button onClick={() => onDelete(item.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
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

  // --- PERMISO TOTAL: SOLO ADMIN, PASTOR, PRODUCTOR ---
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
      setItems(res.data.items.sort((a, b) => a.order - b.order));
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
    const newItem = { id: Date.now(), type, title: type === 'SONG' ? 'Nueva Canción' : 'Nuevo Bloque', description: '', duration: '5:00', isNew: true };
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
      const payload = { ...service, items: items.map((item, index) => ({ ...item, order: index })) };
      await axios.put(`${API_URL}/api/services/${id}`, payload);
      alert('Planificación guardada');
      fetchService();
    } catch (error) { alert('Error al guardar'); } 
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24">
      <div className="mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-blue-900 mb-4 text-sm font-bold">
          <ArrowLeft size={16}/> Volver
        </button>
        <div className="flex justify-between items-start">
           <div>
             <h1 className="text-3xl font-extrabold text-gray-800">{service?.name}</h1>
             <div className="flex items-center gap-4 mt-2 text-gray-500">
               <span className="flex items-center gap-1"><Calendar size={16}/> {service?.date && new Date(service.date).toLocaleDateString()}</span>
             </div>
           </div>
           {canEdit && (
             <button onClick={handleSave} disabled={saving} className="bg-blue-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-800 flex items-center gap-2 shadow-lg">
               {saving ? 'Guardando...' : <><Save size={18}/> Guardar Cambios</>}
             </button>
           )}
        </div>
      </div>

      {!canEdit && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
          <span>🔒 Estás en modo <b>Solo Lectura</b>. Contacta a un Productor para realizar cambios.</span>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map(item => (
              <SortableItem key={item.id} item={item} onDelete={handleDeleteItem} onChange={handleChange} canEdit={canEdit} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {canEdit && (
        <div className="mt-8 flex gap-4 justify-center border-t pt-8 border-dashed border-gray-300">
          <button onClick={() => handleAddItem('GENERIC')} className="flex items-center gap-2 px-5 py-3 rounded-full bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition"><Plus size={18}/> Agregar Bloque</button>
          <button onClick={() => handleAddItem('SONG')} className="flex items-center gap-2 px-5 py-3 rounded-full bg-purple-50 text-purple-700 font-bold hover:bg-purple-100 transition"><Music size={18}/> Agregar Canción</button>
        </div>
      )}
    </div>
  );
};
export default ServiceDetail;
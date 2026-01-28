import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  // Iconos generales
  ArrowLeft, Clock, Calendar, Plus, Trash2, X, CheckCircle, Users,
  // Iconos para Tipos de Ítems
  Footprints,     // Walk-in
  PlayCircle,     // Preroll
  Music,          // Worship / Canción
  Mic2,           // Conducción
  HeartHandshake, // Conexión
  Gift,           // Ofrendas
  Monitor,        // Noticias
  Megaphone,      // Anuncio
  Star,           // Voluntario
  BookOpen,       // Mensaje
  Sparkles,       // Ministración
  UserPlus,       // Llamado
  LogOut          // Walk-out
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [ministries, setMinistries] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // Estado para cronograma
  const [newItem, setNewItem] = useState({ title: '', duration: 5, type: 'WORSHIP' });
  const [isAddingPlan, setIsAddingPlan] = useState(false);

  // Estado para asignaciones
  const [assigningTeamId, setAssigningTeamId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [serviceRes, minRes] = await Promise.all([
        axios.get(`${API_URL}/api/services/${id}`),
        axios.get(`${API_URL}/api/ministries`)
      ]);
      setService(serviceRes.data);
      setMinistries(minRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE CRONOGRAMA ---
  const handleAddPlanItem = async (e) => {
    e.preventDefault();
    const nextOrder = (service.plans.length > 0) ? Math.max(...service.plans.map(p => p.order)) + 1 : 1;
    await axios.post(`${API_URL}/api/services/${id}/plan`, { ...newItem, order: nextOrder });
    setIsAddingPlan(false);
    setNewItem({ title: '', duration: 5, type: 'WORSHIP' }); // Reset a Worship por defecto
    fetchData();
  };

  const handleDeletePlanItem = async (itemId) => {
    if(!confirm('¿Borrar ítem?')) return;
    await axios.delete(`${API_URL}/api/services/plan/${itemId}`);
    fetchData();
  };

  // --- LÓGICA DE ASIGNACIONES ---
  const handleAssignMember = async (teamId, memberId) => {
    try {
      await axios.post(`${API_URL}/api/services/${id}/assignments`, { teamId, memberId });
      setAssigningTeamId(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al asignar');
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if(!confirm('¿Quitar persona del servicio?')) return;
    await axios.delete(`${API_URL}/api/services/assignments/${assignmentId}`);
    fetchData();
  };

  // --- ICONOS PERSONALIZADOS ---
  const getTypeIcon = (type) => {
    switch(type) {
      case 'WALK_IN': return <Footprints size={18} className="text-gray-400"/>;
      case 'PREROLL': return <PlayCircle size={18} className="text-blue-400"/>;
      case 'WORSHIP': return <Music size={18} className="text-blue-600"/>;
      case 'CONDUCCION': return <Mic2 size={18} className="text-purple-500"/>;
      case 'CONEXION': return <HeartHandshake size={18} className="text-pink-500"/>;
      case 'OFRENDAS': return <Gift size={18} className="text-green-500"/>;
      case 'NOTICIAS': return <Monitor size={18} className="text-orange-500"/>;
      case 'ANUNCIO': return <Megaphone size={18} className="text-orange-600"/>;
      case 'VOLUNTARIO': return <Star size={18} className="text-yellow-500"/>;
      case 'MENSAJE': return <BookOpen size={18} className="text-indigo-600"/>;
      case 'MINISTRACION': return <Sparkles size={18} className="text-purple-400"/>;
      case 'LLAMADO': return <UserPlus size={18} className="text-red-500"/>;
      case 'CANCION_FINAL': return <Music size={18} className="text-blue-800"/>;
      case 'WALK_OUT': return <LogOut size={18} className="text-gray-500"/>;
      default: return <Clock size={18} className="text-gray-400"/>;
    }
  };

  if (loading) return <div className="p-10 text-center">Cargando culto...</div>;
  if (!service) return <div className="p-10 text-center">No encontrado.</div>;

  let currentTime = new Date(service.date);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 border-b pb-4">
        <Link to="/plans" className="text-gray-500 hover:text-blue-600 flex items-center gap-1 mb-2">
          <ArrowLeft size={18} /> Volver
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
            <div className="flex items-center gap-3 text-gray-500 mt-1 text-sm">
              <span className="flex items-center gap-1"><Calendar size={16}/> {new Date(service.date).toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><Clock size={16}/> {new Date(service.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} hs</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-bold uppercase">{service.type}</span>
            </div>
          </div>
          <div className="text-right bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
             <div className="text-xs text-blue-600 font-bold uppercase tracking-wider">Duración</div>
             <div className="text-2xl font-bold text-blue-900">
               {service.plans.reduce((acc, curr) => acc + (curr.duration || 0), 0)} min
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: CRONOGRAMA */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Clock size={20} className="text-gray-400"/> Orden del Servicio
            </h2>
            <button 
              onClick={() => setIsAddingPlan(!isAddingPlan)}
              className="text-sm bg-white border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 text-gray-700 font-medium shadow-sm"
            >
              + Agregar Ítem
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             {/* Formulario Agregar Ítem */}
             {isAddingPlan && (
              <form onSubmit={handleAddPlanItem} className="bg-blue-50 p-4 border-b border-blue-100 flex flex-col md:flex-row gap-2 items-end">
                <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-blue-800">Título</label>
                    <input className="w-full p-2 rounded border text-sm" placeholder="Ej: Gracia Sublime" value={newItem.title} onChange={e=>setNewItem({...newItem, title:e.target.value})} autoFocus />
                </div>
                
                <div className="w-full md:w-auto">
                    <label className="text-xs font-bold text-blue-800">Tipo</label>
                    <select 
                      className="w-full p-2 rounded border text-sm bg-white outline-none" 
                      value={newItem.type} 
                      onChange={e=>setNewItem({...newItem, type:e.target.value})}
                    >
                      <option value="WALK_IN">Walk-in</option>
                      <option value="PREROLL">Preroll</option>
                      <option value="WORSHIP">Worship</option>
                      <option value="CONDUCCION">Conducción</option>
                      <option value="CONEXION">Conexión</option>
                      <option value="OFRENDAS">Ofrendas</option>
                      <option value="NOTICIAS">Noticias</option>
                      <option value="ANUNCIO">Anuncio</option>
                      <option value="VOLUNTARIO">Voluntario del Mes</option>
                      <option value="MENSAJE">Mensaje</option>
                      <option value="MINISTRACION">Ministración</option>
                      <option value="LLAMADO">Llamado y Oración</option>
                      <option value="CANCION_FINAL">Canción Final</option>
                      <option value="WALK_OUT">Walk-out</option>
                    </select>
                </div>

                <div className="w-20">
                    <label className="text-xs font-bold text-blue-800">Min</label>
                    <input type="number" className="w-full p-2 rounded border text-sm" value={newItem.duration} onChange={e=>setNewItem({...newItem, duration:e.target.value})} />
                </div>
                
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-700 h-[38px]">
                  Guardar
                </button>
              </form>
            )}

            {/* Lista de Ítems */}
            <div className="divide-y divide-gray-100">
              {service.plans.map((item) => {
                const start = new Date(currentTime);
                currentTime.setMinutes(currentTime.getMinutes() + (item.duration || 0));
                return (
                  <div key={item.id} className="group flex items-center p-3 hover:bg-gray-50 transition-colors gap-3">
                    <div className="w-12 text-xs text-gray-400 font-mono text-right">{start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                    <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">{getTypeIcon(item.type)}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm">{item.title}</h4>
                      <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{item.duration} min</span>
                    </div>
                    <button onClick={() => handleDeletePlanItem(item.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 p-2"><Trash2 size={16}/></button>
                  </div>
                );
              })}
              {service.plans.length === 0 && <div className="p-8 text-center text-gray-400 text-sm italic">Cronograma vacío.</div>}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: EQUIPOS */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Users size={20} className="text-gray-400"/> Equipos
          </h2>

          <div className="space-y-4">
            {ministries.map(ministry => (
              <div key={ministry.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-100 font-bold text-xs text-gray-500 uppercase tracking-wider">
                  {ministry.name}
                </div>
                
                <div className="divide-y divide-gray-100">
                  {ministry.teams.map(team => {
                    const assignedHere = service.assignments.filter(a => a.teamId === team.id);
                    
                    return (
                      <div key={team.id} className="p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-700 text-sm">{team.name}</span>
                          <button 
                            onClick={() => setAssigningTeamId(assigningTeamId === team.id ? null : team.id)}
                            className="text-blue-600 hover:bg-blue-50 p-1 rounded transition"
                            title="Programar persona"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        {/* Asignados */}
                        <div className="space-y-1">
                          {assignedHere.map(assign => (
                            <div key={assign.id} className="flex items-center justify-between text-sm bg-green-50 text-green-800 px-2 py-1 rounded border border-green-100">
                              <div className="flex items-center gap-2">
                                <CheckCircle size={12} />
                                <span>{assign.member.firstName} {assign.member.lastName}</span>
                              </div>
                              <button onClick={() => handleDeleteAssignment(assign.id)} className="text-green-300 hover:text-red-600">
                                <X size={14}/>
                              </button>
                            </div>
                          ))}
                          {assignedHere.length === 0 && !assigningTeamId && (
                            <div className="text-xs text-gray-400 italic">0 asignados</div>
                          )}
                        </div>

                        {/* SELECTOR */}
                        {assigningTeamId === team.id && (
                          <div className="mt-2 bg-gray-50 p-2 rounded border border-gray-200 animate-fade-in">
                            <p className="text-xs text-gray-500 mb-2 font-medium">Seleccionar de {team.name}:</p>
                            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                              {team.members && team.members.length > 0 ? (
                                team.members.map(tm => {
                                  const isAssigned = assignedHere.some(a => a.memberId === tm.memberId);
                                  if (isAssigned) return null;

                                  return (
                                    <button
                                      key={tm.id}
                                      onClick={() => handleAssignMember(team.id, tm.memberId)}
                                      className="text-left text-sm px-2 py-1.5 bg-white hover:bg-blue-50 border border-gray-100 rounded shadow-sm flex items-center gap-2"
                                    >
                                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                                        {tm.member.firstName[0]}
                                      </div>
                                      {tm.member.firstName} {tm.member.lastName}
                                    </button>
                                  );
                                })
                              ) : (
                                <p className="text-xs text-red-400">Equipo vacío.</p>
                              )}
                              <Link to="/ministries" className="text-xs text-center text-blue-500 hover:underline mt-1 pt-1 border-t block">
                                Gestionar Miembros
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {ministries.length === 0 && <div className="text-center text-gray-400 text-sm">Crea Ministerios para asignar equipos.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
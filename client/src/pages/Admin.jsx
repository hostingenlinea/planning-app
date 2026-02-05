import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Tag, Save, Trash2, Shield, Search, Check, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const Admin = () => {
  const [members, setMembers] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para crear etiqueta
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('blue');

  // Buscador
  const [searchTerm, setSearchTerm] = useState('');

  // Roles definidos
  const ROLES = ['Admin', 'Editor', 'Pastor', 'Pastora', 'Lider', 'Colaborador'];
  const COLORS = ['blue', 'green', 'red', 'yellow', 'purple', 'pink', 'gray'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [memRes, labRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/members`),
        axios.get(`${API_URL}/api/admin/labels`)
      ]);
      // Agregamos una propiedad "_unsaved" falsa al inicio
      const initialMembers = memRes.data.map(m => ({ ...m, _unsaved: false }));
      setMembers(initialMembers);
      setLabels(labRes.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  // --- ETIQUETAS ---
  const handleCreateLabel = async (e) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    try {
      await axios.post(`${API_URL}/api/admin/labels`, { name: newLabel, color: newColor });
      setNewLabel('');
      fetchData(); // Recargamos para que aparezca en la lista
    } catch (error) { alert('Error o etiqueta duplicada'); }
  };

  const handleDeleteLabel = async (id) => {
    if (!confirm('¿Borrar etiqueta? Se quitará de todos los miembros.')) return;
    await axios.delete(`${API_URL}/api/admin/labels/${id}`);
    fetchData();
  };

  // --- MIEMBROS: CAMBIO LOCAL (No guarda en BD todavía) ---
  const handleLocalChange = (memberId, newRole, currentLabelIds, toggleLabelId = null) => {
    let newLabelIds = currentLabelIds.map(l => l.id);

    // Lógica para agregar/quitar etiqueta
    if (toggleLabelId) {
      if (newLabelIds.includes(toggleLabelId)) {
        newLabelIds = newLabelIds.filter(id => id !== toggleLabelId);
      } else {
        newLabelIds.push(toggleLabelId);
      }
    }

    // Actualizamos el estado LOCAL y marcamos como "no guardado"
    const updatedMembers = members.map(m => {
      if (m.id === memberId) {
        // Reconstruimos los objetos labels para que se vean bien visualmente
        const updatedLabelsObject = labels.filter(l => newLabelIds.includes(l.id));
        return { 
          ...m, 
          churchRole: newRole, 
          labels: updatedLabelsObject,
          _unsaved: true // <--- ESTO ACTIVA EL BOTÓN DE GUARDAR
        };
      }
      return m;
    });
    setMembers(updatedMembers);
  };

  // --- MIEMBROS: GUARDAR EN BD (Al hacer click en el botón) ---
  const saveMemberChanges = async (member) => {
    try {
      const labelIds = member.labels.map(l => l.id);
      await axios.put(`${API_URL}/api/admin/members/${member.id}`, {
        churchRole: member.churchRole,
        labelIds: labelIds
      });
      
      // Si salió bien, quitamos la marca de "no guardado"
      const cleanedMembers = members.map(m => 
        m.id === member.id ? { ...m, _unsaved: false } : m
      );
      setMembers(cleanedMembers);

    } catch (error) {
      alert('Error al guardar cambios de ' + member.firstName);
    }
  };

  // Filtrado
  const filteredMembers = members.filter(m => 
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center">Cargando panel...</div>;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-6">
        <Settings size={28} /> Administración
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* PANEL IZQUIERDO: ETIQUETAS */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Tag size={20} className="text-blue-600"/> Etiquetas
            </h2>
            
            <form onSubmit={handleCreateLabel} className="space-y-3 mb-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Nombre</label>
                <input 
                  className="w-full border p-2 rounded text-sm" 
                  placeholder="Ej: Bautizado" 
                  value={newLabel} onChange={e => setNewLabel(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Color</label>
                <div className="flex gap-2 mt-1">
                  {COLORS.map(c => (
                    <button 
                      key={c}
                      type="button"
                      onClick={() => setNewColor(c)}
                      className={`w-6 h-6 rounded-full border-2 ${newColor === c ? 'border-black' : 'border-transparent'}`}
                      style={{ backgroundColor: c === 'white' ? '#eee' : c }}
                    />
                  ))}
                </div>
              </div>
              <button className="w-full bg-blue-900 text-white py-2 rounded font-bold text-sm">
                Crear Etiqueta
              </button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {labels.map(label => (
                <div key={label.id} className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-100">
                  <span className={`text-xs px-2 py-1 rounded-full text-white font-bold bg-${label.color}-500`} style={{backgroundColor: label.color}}>
                    {label.name}
                  </span>
                  <button onClick={() => handleDeleteLabel(label.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: LISTA DE PERSONAS */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center flex-wrap gap-2">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Shield size={20} className="text-purple-600"/> Roles y Permisos
              </h2>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-2.5 text-gray-400"/>
                <input 
                  className="pl-9 pr-3 py-1.5 text-sm border rounded-full outline-none focus:ring-1 focus:ring-blue-500 w-64"
                  placeholder="Buscar persona..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Rol</th>
                    <th className="px-4 py-3">Etiquetas</th>
                    <th className="px-4 py-3 text-center">Guardar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredMembers.map(member => (
                    <tr key={member.id} className={`hover:bg-gray-50 transition-colors ${member._unsaved ? 'bg-orange-50' : ''}`}>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                        {member._unsaved && <span className="text-[10px] text-orange-500 block font-normal">Editado*</span>}
                      </td>
                      
                      {/* SELECTOR DE ROL */}
                      <td className="px-4 py-3">
                        <select 
                          className="border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                          value={member.churchRole || 'Colaborador'}
                          onChange={(e) => handleLocalChange(member.id, e.target.value, member.labels)}
                        >
                          {ROLES.map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </td>

                      {/* CHECKBOXES DE ETIQUETAS */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {labels.map(label => {
                            const hasLabel = member.labels.some(l => l.id === label.id);
                            return (
                              <button
                                key={label.id}
                                onClick={() => handleLocalChange(member.id, member.churchRole, member.labels, label.id)}
                                className={`text-[10px] px-2 py-0.5 rounded-full border transition-all
                                  ${hasLabel 
                                    ? `bg-${label.color}-100 text-${label.color}-800 border-${label.color}-200 font-bold` 
                                    : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400 opacity-60'
                                  }`}
                                style={hasLabel ? { backgroundColor: label.color, color: 'white' } : {}}
                              >
                                {label.name}
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      {/* BOTÓN DE GUARDAR */}
                      <td className="px-4 py-3 text-center">
                        {member._unsaved ? (
                          <button 
                            onClick={() => saveMemberChanges(member)}
                            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow-md animate-pulse"
                            title="Guardar cambios"
                          >
                            <Save size={16} />
                          </button>
                        ) : (
                          <span className="text-gray-300 flex justify-center">
                            <Check size={16} />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Admin;
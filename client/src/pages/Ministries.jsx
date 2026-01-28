import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layers, Plus, Trash2, Users, UserPlus, Search, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const Ministries = () => {
  const [ministries, setMinistries] = useState([]);
  const [allMembers, setAllMembers] = useState([]); // Base completa de usuarios para buscar
  const [loading, setLoading] = useState(true);
  const [newMinistryName, setNewMinistryName] = useState('');
  
  // Estado para controlar inputs y pestañas
  const [activeTab, setActiveTab] = useState({}); // { [ministryId]: 'teams' | 'members' }
  const [addingToMinistry, setAddingToMinistry] = useState(null); // ID del ministerio donde estamos agregando
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [minRes, memRes] = await Promise.all([
        axios.get(`${API_URL}/api/ministries`),
        axios.get(`${API_URL}/api/members`)
      ]);
      setMinistries(minRes.data);
      setAllMembers(memRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Crear Ministerio
  const createMinistry = async (e) => {
    e.preventDefault();
    if (!newMinistryName.trim()) return;
    try {
      await axios.post(`${API_URL}/api/ministries`, { name: newMinistryName });
      setNewMinistryName('');
      fetchData();
    } catch (error) { alert('Error al crear'); }
  };

  // Crear Equipo
  const createTeam = async (ministryId, name) => {
    try {
      await axios.post(`${API_URL}/api/ministries/${ministryId}/teams`, { name });
      fetchData();
    } catch (error) { alert('Error al crear equipo'); }
  };

  // Agregar Miembro al Ministerio
  const addMemberToMinistry = async (ministryId, memberId) => {
    try {
      await axios.post(`${API_URL}/api/ministries/${ministryId}/members`, { memberId });
      setAddingToMinistry(null); // Cerrar buscador
      setSearchTerm('');
      fetchData();
    } catch (error) { 
      alert(error.response?.data?.error || 'Error al agregar miembro'); 
    }
  };

  // Borrar
  const deleteItem = async (url) => {
    if(!confirm('¿Estás seguro?')) return;
    try { await axios.delete(url); fetchData(); } catch (error) { console.error(error); }
  };

  // Manejo del Buscador
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }
    const filtered = allMembers.filter(m => 
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(term.toLowerCase())
    );
    setSearchResults(filtered);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            Ministerios y Equipos
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona tus equipos y quiénes pertenecen a ellos.</p>
        </div>
        
        <form onSubmit={createMinistry} className="flex gap-2 w-full md:w-auto">
          <input 
            type="text" placeholder="Nuevo Ministerio..." 
            className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none flex-1 md:w-64"
            value={newMinistryName} onChange={(e) => setNewMinistryName(e.target.value)}
          />
          <button type="submit" className="bg-blue-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-800">Crear</button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ministries.map((ministry) => {
          const tab = activeTab[ministry.id] || 'teams'; // Default tab: teams

          return (
            <div key={ministry.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[400px]">
              {/* Header */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Layers size={18} className="text-blue-600"/> {ministry.name}
                </h3>
                <button onClick={() => deleteItem(`${API_URL}/api/ministries/${ministry.id}`)} className="text-gray-300 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Pestañas (Tabs) */}
              <div className="flex border-b border-gray-100 text-sm">
                <button 
                  onClick={() => setActiveTab({...activeTab, [ministry.id]: 'teams'})}
                  className={`flex-1 py-2 font-medium ${tab === 'teams' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  Equipos ({ministry.teams.length})
                </button>
                <button 
                  onClick={() => setActiveTab({...activeTab, [ministry.id]: 'members'})}
                  className={`flex-1 py-2 font-medium ${tab === 'members' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  Personas ({ministry.members.length})
                </button>
              </div>

              {/* Contenido */}
              <div className="flex-1 overflow-y-auto p-4 relative">
                
                {/* --- VISTA EQUIPOS --- */}
                {tab === 'teams' && (
                  <ul className="space-y-2">
                    {ministry.teams.map(team => (
                      <li key={team.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded group">
                        <span className="text-gray-700 font-medium">{team.name}</span>
                        <button onClick={() => deleteItem(`${API_URL}/api/ministries/teams/${team.id}`)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                          <X size={14}/>
                        </button>
                      </li>
                    ))}
                    {ministry.teams.length === 0 && <p className="text-gray-400 text-xs italic text-center mt-4">No hay equipos definidos.</p>}
                  </ul>
                )}

                {/* --- VISTA MIEMBROS --- */}
                {tab === 'members' && (
                  <ul className="space-y-2">
                    {ministry.members.map(rel => (
                      <li key={rel.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded group">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                            {rel.member.firstName[0]}{rel.member.lastName[0]}
                          </div>
                          <span className="text-gray-700">{rel.member.firstName} {rel.member.lastName}</span>
                        </div>
                        <button onClick={() => deleteItem(`${API_URL}/api/ministries/members/${rel.id}`)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                          <X size={14}/>
                        </button>
                      </li>
                    ))}
                    {ministry.members.length === 0 && <p className="text-gray-400 text-xs italic text-center mt-4">Nadie pertenece a este ministerio aún.</p>}
                  </ul>
                )}

                {/* --- BUSCADOR FLOTANTE --- */}
                {addingToMinistry === ministry.id && (
                  <div className="absolute inset-0 bg-white z-10 p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <Search size={16} className="text-gray-400"/>
                      <input 
                        autoFocus
                        placeholder={tab === 'teams' ? "Nombre del equipo..." : "Buscar persona..."}
                        className="flex-1 border-b border-gray-300 outline-none pb-1 text-sm"
                        value={searchTerm}
                        onChange={e => handleSearch(e.target.value)}
                        onKeyDown={e => {
                           if(e.key === 'Enter' && tab === 'teams') {
                             createTeam(ministry.id, searchTerm);
                             setAddingToMinistry(null);
                             setSearchTerm('');
                           }
                        }}
                      />
                      <button onClick={() => setAddingToMinistry(null)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
                    </div>

                    {/* Resultados de búsqueda (Solo para Personas) */}
                    {tab === 'members' && (
                      <div className="flex-1 overflow-y-auto border-t border-gray-100 mt-2 pt-2">
                        {searchResults.map(m => (
                          <button 
                            key={m.id}
                            onClick={() => addMemberToMinistry(ministry.id, m.id)}
                            className="w-full text-left p-2 hover:bg-blue-50 rounded flex items-center gap-2 text-sm"
                          >
                            <span className="font-bold text-gray-700">{m.firstName} {m.lastName}</span>
                          </button>
                        ))}
                        {searchTerm.length > 1 && searchResults.length === 0 && (
                          <p className="text-xs text-gray-400 text-center mt-2">No encontrado.</p>
                        )}
                      </div>
                    )}
                    {tab === 'teams' && <p className="text-xs text-gray-400 mt-2">Presiona Enter para crear.</p>}
                  </div>
                )}
              </div>

              {/* Footer Acciones */}
              <div className="p-3 bg-gray-50 border-t border-gray-100">
                <button 
                  onClick={() => {
                    setAddingToMinistry(ministry.id);
                    setSearchTerm('');
                    setSearchResults([]);
                  }}
                  className="w-full text-center py-1.5 border border-dashed border-gray-300 rounded text-sm text-gray-500 hover:border-blue-500 hover:text-blue-600 font-medium flex items-center justify-center gap-2 transition"
                >
                  {tab === 'teams' ? <Plus size={16} /> : <UserPlus size={16} />}
                  {tab === 'teams' ? 'Crear Equipo' : 'Agregar Persona'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Ministries;
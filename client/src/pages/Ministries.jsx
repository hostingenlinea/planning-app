import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layers, Plus, Trash2, Users, Search, X, UserPlus } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const Ministries = () => {
  const [areas, setAreas] = useState([]); // Visualmente son "Áreas"
  const [allMembers, setAllMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newAreaName, setNewAreaName] = useState('');
  const [newTeamNames, setNewTeamNames] = useState({});
  
  const [addingToTeam, setAddingToTeam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [areaRes, memRes] = await Promise.all([
        axios.get(`${API_URL}/api/ministries`), // La API interna sigue usando "ministries"
        axios.get(`${API_URL}/api/members`)
      ]);
      setAreas(areaRes.data);
      setAllMembers(memRes.data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const createArea = async (e) => {
    e.preventDefault();
    if (!newAreaName.trim()) return;
    await axios.post(`${API_URL}/api/ministries`, { name: newAreaName });
    setNewAreaName('');
    fetchData();
  };

  const createTeam = async (areaId) => {
    const name = newTeamNames[areaId];
    if (!name?.trim()) return;
    await axios.post(`${API_URL}/api/ministries/${areaId}/teams`, { name });
    setNewTeamNames({ ...newTeamNames, [areaId]: '' });
    fetchData();
  };

  const addMemberToTeam = async (teamId, memberId) => {
    try {
      await axios.post(`${API_URL}/api/ministries/teams/${teamId}/members`, { memberId });
      setAddingToTeam(null);
      setSearchTerm('');
      fetchData();
    } catch (error) { alert('Ya pertenece a este equipo'); }
  };

  const deleteItem = async (url) => {
    if(!confirm('¿Estás seguro de eliminar esto?')) return;
    await axios.delete(url);
    fetchData();
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.length < 2) { setSearchResults([]); return; }
    setSearchResults(allMembers.filter(m => 
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(term.toLowerCase())
    ));
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Áreas y Equipos</h1>
          <p className="text-gray-500">Estructura las áreas de la iglesia (Ej: Stage, Mujeres).</p>
        </div>
        <form onSubmit={createArea} className="flex gap-2 w-full md:w-auto">
          <input 
            className="border p-2 rounded-lg outline-none w-full md:w-64" 
            placeholder="Nueva Área (Ej: Stage)" 
            value={newAreaName} onChange={e => setNewAreaName(e.target.value)}
          />
          <button className="bg-blue-900 text-white px-4 rounded-lg font-bold">Crear Área</button>
        </form>
      </div>

      {loading && <div className="text-center">Cargando...</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {areas.map((area) => (
          <div key={area.id} className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            {/* Header del Área */}
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <Layers size={20} className="text-blue-600"/> {area.name}
              </h3>
              <button onClick={() => deleteItem(`${API_URL}/api/ministries/${area.id}`)} className="text-gray-400 hover:text-red-500">
                <Trash2 size={18}/>
              </button>
            </div>

            {/* Lista de Equipos */}
            <div className="p-4 bg-gray-50 min-h-[200px]">
              <div className="space-y-4">
                {area.teams.map(team => (
                  <div key={team.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm relative">
                    {/* Header del Equipo */}
                    <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
                      <span className="font-bold text-gray-700 flex items-center gap-2">
                        <Users size={16} className="text-green-600"/> {team.name}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setAddingToTeam(team.id)}
                          className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-medium hover:bg-blue-100 flex items-center gap-1"
                        >
                          <UserPlus size={14}/> Agregar Persona
                        </button>
                        <button onClick={() => deleteItem(`${API_URL}/api/ministries/teams/${team.id}`)} className="text-gray-300 hover:text-red-500">
                          <X size={16}/>
                        </button>
                      </div>
                    </div>

                    {/* Miembros del Equipo */}
                    <div className="flex flex-wrap gap-2">
                      {team.members.length === 0 ? (
                        <span className="text-xs text-gray-400 italic">Sin miembros asignados.</span>
                      ) : (
                        team.members.map(tm => (
                          <div key={tm.id} className="bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-blue-100">
                            {tm.member.firstName} {tm.member.lastName}
                            <button onClick={() => deleteItem(`${API_URL}/api/ministries/teams/members/${tm.id}`)} className="hover:text-red-600 ml-1">
                              <X size={12}/>
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Buscador Flotante */}
                    {addingToTeam === team.id && (
                      <div className="absolute top-10 left-0 right-0 bg-white border border-blue-300 shadow-xl rounded-lg z-10 m-2 p-2 animate-fade-in">
                        <div className="flex items-center gap-2 border-b pb-2 mb-2">
                          <Search size={14} className="text-blue-500"/>
                          <input 
                            autoFocus
                            className="flex-1 outline-none text-sm"
                            placeholder={`Buscar persona para ${team.name}...`}
                            value={searchTerm}
                            onChange={e => handleSearch(e.target.value)}
                          />
                          <button onClick={() => {setAddingToTeam(null); setSearchTerm('');}}><X size={14}/></button>
                        </div>
                        <div className="max-h-32 overflow-y-auto">
                          {searchResults.map(m => (
                            <button 
                              key={m.id}
                              onClick={() => addMemberToTeam(team.id, m.id)}
                              className="w-full text-left text-sm p-1.5 hover:bg-blue-50 rounded block"
                            >
                              {m.firstName} {m.lastName}
                            </button>
                          ))}
                          {searchTerm.length > 1 && searchResults.length === 0 && <p className="text-xs text-center text-gray-400">No encontrado</p>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Crear Nuevo Equipo */}
              <div className="mt-4 flex gap-2">
                <input 
                  className="flex-1 border p-2 rounded text-sm outline-none"
                  placeholder="Nuevo equipo (Ej: General)"
                  value={newTeamNames[area.id] || ''}
                  onChange={e => setNewTeamNames({...newTeamNames, [area.id]: e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && createTeam(area.id)}
                />
                <button onClick={() => createTeam(area.id)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 rounded text-sm font-bold">
                  + Equipo
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ministries;
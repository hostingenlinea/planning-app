import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layers, Plus, Trash2, Users } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const Ministries = () => {
  const [ministries, setMinistries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMinistryName, setNewMinistryName] = useState('');
  
  // Estado para controlar qué input de "Nuevo Equipo" se muestra
  const [activeMinistryId, setActiveMinistryId] = useState(null);
  const [newTeamName, setNewTeamName] = useState('');

  useEffect(() => {
    fetchMinistries();
  }, []);

  const fetchMinistries = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/ministries`);
      setMinistries(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createMinistry = async (e) => {
    e.preventDefault();
    if (!newMinistryName.trim()) return;
    try {
      await axios.post(`${API_URL}/api/ministries`, { name: newMinistryName });
      setNewMinistryName('');
      fetchMinistries();
    } catch (error) {
      alert('Error al crear ministerio');
    }
  };

  const createTeam = async (ministryId) => {
    if (!newTeamName.trim()) return;
    try {
      await axios.post(`${API_URL}/api/ministries/${ministryId}/teams`, { name: newTeamName });
      setNewTeamName('');
      setActiveMinistryId(null); // Cerrar input
      fetchMinistries();
    } catch (error) {
      alert('Error al crear equipo');
    }
  };

  const deleteMinistry = async (id) => {
    if(!confirm('¿Seguro? Se borrarán todos los equipos de este ministerio.')) return;
    try {
      await axios.delete(`${API_URL}/api/ministries/${id}`);
      fetchMinistries();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  const deleteTeam = async (teamId) => {
    if(!confirm('¿Borrar equipo?')) return;
    try {
      await axios.delete(`${API_URL}/api/ministries/teams/${teamId}`);
      fetchMinistries();
    } catch (error) {
      alert('Error al eliminar equipo');
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            Ministerios y Equipos
          </h1>
          <p className="text-gray-500 text-sm mt-1">Estructura tus áreas de servicio (Ej: Alabanza, Multimedia)</p>
        </div>
        
        {/* Formulario Crear Ministerio Inline */}
        <form onSubmit={createMinistry} className="flex gap-2 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Nuevo Ministerio..." 
            className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm flex-1 md:w-64"
            value={newMinistryName}
            onChange={(e) => setNewMinistryName(e.target.value)}
          />
          <button type="submit" className="bg-blue-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-800 transition">
            Crear
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Cargando estructura...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ministries.map((ministry) => (
            <div key={ministry.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
              {/* Header de la Tarjeta */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Layers size={18} className="text-blue-600"/>
                  {ministry.name}
                </h3>
                <button onClick={() => deleteMinistry(ministry.id)} className="text-gray-300 hover:text-red-500 transition">
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Lista de Equipos */}
              <div className="p-4 flex-1">
                {ministry.teams.length > 0 ? (
                  <ul className="space-y-2">
                    {ministry.teams.map(team => (
                      <li key={team.id} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded group">
                        <span className="flex items-center gap-2 text-gray-700">
                           <Users size={14} className="text-gray-400"/> {team.name}
                        </span>
                        <button onClick={() => deleteTeam(team.id)} className="text-red-400 opacity-0 group-hover:opacity-100 transition">
                          <XIconSmall />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 text-xs italic mb-4">Sin equipos creados aún.</p>
                )}
              </div>

              {/* Footer: Agregar Equipo */}
              <div className="p-3 bg-gray-50 border-t border-gray-100">
                {activeMinistryId === ministry.id ? (
                  <div className="flex gap-2 animate-fade-in">
                    <input 
                      autoFocus
                      className="flex-1 text-sm border p-1.5 rounded outline-none"
                      placeholder="Nombre del equipo..."
                      value={newTeamName}
                      onChange={e => setNewTeamName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && createTeam(ministry.id)}
                    />
                    <button onClick={() => createTeam(ministry.id)} className="bg-green-600 text-white px-2 rounded text-xs font-bold">OK</button>
                    <button onClick={() => setActiveMinistryId(null)} className="text-gray-500 px-1"><XIconSmall/></button>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setActiveMinistryId(ministry.id); setNewTeamName(''); }}
                    className="w-full text-left text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <Plus size={16} /> Agregar Equipo
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {ministries.length === 0 && (
            <div className="col-span-full text-center py-10 opacity-50">
              <Layers size={48} className="mx-auto mb-2 text-gray-300"/>
              <p>Crea tu primer ministerio arriba a la derecha (Ej: "Música")</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Componente auxiliar para icono X pequeño
const XIconSmall = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export default Ministries;
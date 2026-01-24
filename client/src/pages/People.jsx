import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Phone, User } from 'lucide-react';
import AddMemberModal from '../components/AddMemberModal'; // <--- Importamos el modal

const API_URL = import.meta.env.VITE_API_URL;

const People = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // <--- Estado para abrir/cerrar

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/members`);
      setMembers(res.data);
    } catch (error) {
      console.error("Error cargando miembros:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para filtrar
  const filteredMembers = members.filter(member => 
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Personas</h1>
          <p className="text-gray-500 text-sm mt-1">Directorio general de la iglesia</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} // <--- Abre el modal
          className="bg-primary hover:bg-secondary text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-sm w-full md:w-auto justify-center"
        >
          <Plus size={20} />
          <span>Nuevo Miembro</span>
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-white p-2 rounded-lg shadow-sm mb-6 border border-gray-200 flex items-center">
        <div className="p-2">
          <Search className="text-gray-400" size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Buscar por nombre o apellido..." 
          className="flex-1 outline-none text-gray-700 p-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista de Tarjetas (Vista Móvil Friendly) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-10 text-gray-500">Cargando directorio...</div>
        ) : filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
            <div key={member.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-4">
              {/* Avatar Placeholder */}
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-primary font-bold text-lg">
                {member.firstName[0]}{member.lastName[0]}
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{member.firstName} {member.lastName}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Phone size={14} />
                  <span>{member.phone || 'Sin teléfono'}</span>
                </div>
              </div>

              {/* Tag de Estado */}
              <div className={`h-3 w-3 rounded-full ${member.baptized ? 'bg-green-500' : 'bg-gray-300'}`} title={member.baptized ? 'Bautizado' : 'No Bautizado'} />
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400">
            <User size={48} className="mb-4 opacity-20" />
            <p>No se encontraron personas con ese nombre.</p>
          </div>
        )}
      </div>

      {/* Renderizamos el Modal */}
      <AddMemberModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onMemberAdded={fetchMembers} // <--- Recarga la lista al guardar
      />
    </div>
  );
};

export default People;
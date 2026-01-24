import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Phone, Mail } from 'lucide-react';

// Usamos la variable de entorno para saber a dónde pedir datos
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const People = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar miembros al iniciar
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/members`);
      setMembers(res.data);
    } catch (error) {
      console.error("Error cargando miembros:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar búsqueda
  const filteredMembers = members.filter(member => 
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header de la sección */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Personas</h1>
        <button className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={20} />
          <span>Nuevo Miembro</span>
        </button>
      </div>

      {/* Barra de Búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center gap-2 border border-gray-200">
        <Search className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Buscar por nombre..." 
          className="flex-1 outline-none text-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla de Miembros */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-600">Nombre</th>
              <th className="text-left p-4 font-semibold text-gray-600">Teléfono</th>
              <th className="text-left p-4 font-semibold text-gray-600">Estado</th>
              <th className="text-right p-4 font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="4" className="p-4 text-center">Cargando...</td></tr>
            ) : filteredMembers.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                </td>
                <td className="p-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400"/> {member.phone || '-'}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.baptized ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {member.baptized ? 'Bautizado' : 'Visitante'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Ver perfil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && filteredMembers.length === 0 && (
           <div className="p-8 text-center text-gray-500">No se encontraron personas.</div>
        )}
      </div>
    </div>
  );
};

export default People;
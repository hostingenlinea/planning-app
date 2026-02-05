import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Search, Plus, Phone, MapPin, Trash2, User } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const People = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para formulario nuevo miembro
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/members`);
      setMembers(res.data);
    } catch (error) {
      console.error("Error al cargar miembros:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/members`, newMember);
      setIsModalOpen(false);
      setNewMember({ firstName: '', lastName: '', phone: '', address: '' });
      fetchMembers();
    } catch (error) {
      alert('Error al crear miembro');
    }
  };

  const handleDelete = async (id) => {
    if(!confirm('¿Estás seguro de eliminar a esta persona? Se borrará de todos los equipos.')) return;
    try {
      await axios.delete(`${API_URL}/api/members/${id}`);
      fetchMembers();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  // Filtrado
  const filteredMembers = members.filter(m => 
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header y Buscador */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Users size={28} /> Directorio
          </h1>
          <p className="text-gray-500 text-sm">Administra a todas las personas de la iglesia.</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-800 flex items-center gap-2"
          >
            <Plus size={20} /> <span className="hidden md:inline">Nuevo</span>
          </button>
        </div>
      </div>

      {/* Lista de Personas */}
      {loading ? (
        <div className="text-center py-10">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <div key={member.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-start gap-4 hover:shadow-md transition-shadow group">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-400 shrink-0">
                {member.firstName[0]}{member.lastName[0]}
              </div>
              
              {/* Info */}
              <div className="flex-1 overflow-hidden">
                <h3 className="font-bold text-gray-800 truncate">{member.firstName} {member.lastName}</h3>
                
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <Phone size={12} /> {member.phone || 'Sin teléfono'}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 truncate">
                  <MapPin size={12} /> {member.address || 'Sin dirección'}
                </div>
              </div>

              {/* Acciones */}
              <button 
                onClick={() => handleDelete(member.id)}
                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          
          {filteredMembers.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-400 italic">
              No se encontraron personas.
            </div>
          )}
        </div>
      )}

      {/* Modal Nuevo Miembro */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <UserPlus size={24} className="text-blue-600"/> Nueva Persona
            </h2>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre</label>
                  <input required className="w-full border p-2 rounded" value={newMember.firstName} onChange={e => setNewMember({...newMember, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Apellido</label>
                  <input required className="w-full border p-2 rounded" value={newMember.lastName} onChange={e => setNewMember({...newMember, lastName: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Teléfono</label>
                <input className="w-full border p-2 rounded" value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Dirección</label>
                <input className="w-full border p-2 rounded" value={newMember.address} onChange={e => setNewMember({...newMember, address: e.target.value})} />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                <button type="submit" className="bg-blue-900 text-white px-4 py-2 rounded font-bold hover:bg-blue-800">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default People;
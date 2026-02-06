import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Search, Plus, Phone, MapPin, Trash2, UserPlus, X, Mail } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const People = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false); // Para evitar doble clic

  // Datos del formulario
  const [newMember, setNewMember] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
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
    setSaving(true);
    try {
      await axios.post(`${API_URL}/api/members`, newMember);
      
      // Limpiar y cerrar
      setIsModalOpen(false);
      setNewMember({ firstName: '', lastName: '', phone: '', email: '', address: '' });
      fetchMembers(); // Recargar lista
    } catch (error) {
      alert('Error al crear miembro. Revisa los datos.');
    } finally {
      setSaving(false);
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
            className="bg-blue-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-800 flex items-center gap-2 shadow-sm"
          >
            <Plus size={20} /> <span className="hidden md:inline">Nuevo</span>
          </button>
        </div>
      </div>

      {/* Lista de Personas */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Cargando directorio...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <div key={member.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-start gap-4 hover:shadow-md transition-shadow group">
              {/* Avatar con iniciales */}
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-xl font-bold text-blue-500 shrink-0 border border-blue-100">
                {member.firstName[0]}{member.lastName[0]}
              </div>
              
              {/* Info */}
              <div className="flex-1 overflow-hidden space-y-1">
                <h3 className="font-bold text-gray-800 truncate">{member.firstName} {member.lastName}</h3>
                
                {member.phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone size={12} /> {member.phone}
                  </div>
                )}
                
                {member.email && (
                   <div className="flex items-center gap-2 text-xs text-gray-500 truncate">
                     <Mail size={12} /> {member.email}
                   </div>
                )}

                {member.address && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 truncate">
                    <MapPin size={12} /> {member.address}
                  </div>
                )}
              </div>

              {/* Acciones */}
              <button 
                onClick={() => handleDelete(member.id)}
                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                title="Eliminar"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          
          {filteredMembers.length === 0 && (
            <div className="col-span-full text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <Users size={48} className="mx-auto text-gray-300 mb-2"/>
              <p className="text-gray-400">No se encontraron personas.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Nuevo Miembro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            
            {/* Cabecera Modal */}
            <div className="bg-blue-900 px-6 py-4 flex justify-between items-center text-white">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <UserPlus size={24} className="text-blue-200"/> Nueva Persona
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <X size={20}/>
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre *</label>
                  <input 
                    required 
                    autoFocus
                    className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={newMember.firstName} 
                    onChange={e => setNewMember({...newMember, firstName: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Apellido *</label>
                  <input 
                    required 
                    className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={newMember.lastName} 
                    onChange={e => setNewMember({...newMember, lastName: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
                <input 
                  type="email"
                  className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={newMember.email} 
                  onChange={e => setNewMember({...newMember, email: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Teléfono</label>
                <input 
                  className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={newMember.phone} 
                  onChange={e => setNewMember({...newMember, phone: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Dirección</label>
                <input 
                  className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={newMember.address} 
                  onChange={e => setNewMember({...newMember, address: e.target.value})} 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="bg-blue-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? 'Guardando...' : 'Guardar Persona'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default People;
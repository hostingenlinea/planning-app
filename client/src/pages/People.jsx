import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Search, MapPin, Phone, User, X, Camera, 
  Trash2, Edit, Loader, Mail 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const People = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    address: '', city: '', birthDate: '', photo: '', 
    churchRole: 'Colaborador', password: '' 
  });

  const isAdmin = user?.role === 'Admin' || user?.role === 'Pastor';

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/members`);
      setMembers(res.data);
      setFilteredMembers(res.data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredMembers(members.filter(m => 
      m.firstName.toLowerCase().includes(term) || m.lastName.toLowerCase().includes(term)
    ));
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ firstName: '', lastName: '', phone: '', email: '', address: '', city: '', birthDate: '', photo: '', churchRole: 'Colaborador', password: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (member) => {
    setEditingId(member.id);
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone || '',
      email: member.email || '',
      address: member.address || '',
      city: member.city || '',
      birthDate: member.birthDate ? member.birthDate.split('T')[0] : '',
      photo: member.photo || '',
      churchRole: member.churchRole || 'Colaborador',
      password: '' // Pass vacía en edición
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 400; canvas.height = 400;
        const ctx = canvas.getContext('2d');
        // Simple center crop logic
        let sWidth = img.width > img.height ? img.height : img.width;
        let sHeight = sWidth;
        let sx = (img.width - sWidth) / 2;
        let sy = (img.height - sHeight) / 2;
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, 400, 400);
        setFormData({ ...formData, photo: canvas.toDataURL('image/jpeg', 0.8) });
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await axios.put(`${API_URL}/api/members/${editingId}`, formData);
        alert('Datos actualizados.');
      } else {
        await axios.post(`${API_URL}/api/members`, formData);
        alert('Persona creada y email enviado.');
      }
      setIsModalOpen(false);
      fetchMembers();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al guardar.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar persona y su usuario de acceso?')) return;
    try {
      await axios.delete(`${API_URL}/api/members/${id}`);
      fetchMembers();
    } catch (error) { alert('Error al eliminar'); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800">Directorio</h1>
        {isAdmin && (
          <button onClick={openCreateModal} className="bg-blue-900 text-white px-5 py-3 rounded-xl hover:bg-blue-800 shadow-lg flex items-center gap-2 font-bold">
            <Plus size={20} /> Nuevo
          </button>
        )}
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
        <input type="text" placeholder="Buscar..." className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 outline-none" value={searchTerm} onChange={handleSearch} />
      </div>

      {loading ? <div className="text-center py-10">Cargando...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map(member => (
            <div key={member.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
              {isAdmin && (
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(member)} className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(member.id)} className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100"><Trash2 size={16} /></button>
                </div>
              )}
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0">
                  {member.photo ? <img src={member.photo} className="w-full h-full object-cover"/> : <span className="text-xl font-bold text-gray-400">{member.firstName[0]}</span>}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 truncate">{member.firstName} {member.lastName}</h3>
                  <span className="text-xs font-bold uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{member.churchRole}</span>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                {member.phone && <div className="flex gap-2"><Phone size={14}/> {member.phone}</div>}
                {member.email && <div className="flex gap-2 truncate"><Mail size={14}/> {member.email}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">{editingId ? 'Editar Persona' : 'Nueva Persona'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="flex justify-center">
                <div className="relative w-32 h-32 rounded-full bg-gray-100 border-4 shadow-lg overflow-hidden group">
                   {formData.photo ? <img src={formData.photo} className="w-full h-full object-cover" /> : <User size={48} className="text-gray-300 m-auto mt-8"/>}
                   <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Nombre" className="border p-3 rounded-xl" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                <input required placeholder="Apellido" className="border p-3 rounded-xl" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                <input required type="email" placeholder="Email" className="border p-3 rounded-xl md:col-span-2" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                
                {!editingId && (
                  <div className="md:col-span-2">
                    <input required type="text" placeholder="Contraseña Inicial" className="w-full border p-3 rounded-xl" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    <p className="text-xs text-gray-400 mt-1">Se enviará por email al usuario.</p>
                  </div>
                )}
                
                <input type="text" placeholder="Teléfono" className="border p-3 rounded-xl" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                <input type="date" className="border p-3 rounded-xl" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                
                <select className="border p-3 rounded-xl" value={formData.churchRole} onChange={e => setFormData({...formData, churchRole: e.target.value})}>
                  <option>Colaborador</option><option>Lider</option><option>Pastor</option><option>Recepción</option>
                </select>
                
                <input type="text" placeholder="Ciudad" className="border p-3 rounded-xl" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                <input type="text" placeholder="Dirección" className="border p-3 rounded-xl md:col-span-2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500">Cancelar</button>
                <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-900 text-white rounded-xl font-bold flex items-center gap-2">
                  {saving && <Loader className="animate-spin" size={16}/>} {editingId ? 'Guardar' : 'Crear'}
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
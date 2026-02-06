import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Search, Plus, Phone, MapPin, Trash2, UserPlus, X, Mail, Cake, Lock, Camera } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const People = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newMember, setNewMember] = useState({
    firstName: '', lastName: '', phone: '', email: '', 
    address: '', city: '', birthDate: '', photo: '', password: ''
  });

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/members`);
      setMembers(res.data);
    } catch (error) {} finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post(`${API_URL}/api/members`, newMember);
      setIsModalOpen(false);
      setNewMember({ firstName: '', lastName: '', phone: '', email: '', address: '', city: '', birthDate: '', photo: '', password: '' });
      fetchMembers();
    } catch (error) { alert('Error al crear. Verifica si el email ya existe.'); } 
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if(!confirm('¿Eliminar persona?')) return;
    try { await axios.delete(`${API_URL}/api/members/${id}`); fetchMembers(); } catch (error) {}
  };

  const filtered = members.filter(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2"><Users size={28} /> Directorio</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input className="w-full pl-10 pr-4 py-2 border rounded-lg" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-900 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
            <Plus size={20} /> <span className="hidden md:inline">Nuevo</span>
          </button>
        </div>
      </div>

      {/* LISTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m) => (
          <div key={m.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
               {m.photo ? <img src={m.photo} className="w-full h-full object-cover"/> : <span className="font-bold text-gray-400">{m.firstName[0]}</span>}
            </div>
            <div className="flex-1 overflow-hidden text-sm space-y-1">
              <h3 className="font-bold text-gray-800 text-base">{m.firstName} {m.lastName}</h3>
              <p className="text-blue-600 text-xs font-bold uppercase">{m.churchRole}</p>
              {m.phone && <div className="flex gap-2 text-gray-500"><Phone size={12}/> {m.phone}</div>}
              {m.city && <div className="flex gap-2 text-gray-500"><MapPin size={12}/> {m.city}</div>}
            </div>
            <button onClick={() => handleDelete(m.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={18}/></button>
          </div>
        ))}
      </div>

      {/* MODAL ALTA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden my-8">
            <div className="bg-blue-900 px-6 py-4 flex justify-between items-center text-white">
              <h2 className="text-lg font-bold flex items-center gap-2"><UserPlus size={24}/> Alta de Persona</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Sección Personal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500">Nombre *</label>
                  <input required className="w-full border p-2 rounded" value={newMember.firstName} onChange={e => setNewMember({...newMember, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500">Apellido *</label>
                  <input required className="w-full border p-2 rounded" value={newMember.lastName} onChange={e => setNewMember({...newMember, lastName: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 flex items-center gap-1"><Cake size={12}/> Cumpleaños</label>
                  <input type="date" className="w-full border p-2 rounded" value={newMember.birthDate} onChange={e => setNewMember({...newMember, birthDate: e.target.value})} />
                </div>
                <div>
                   <label className="text-xs font-bold uppercase text-gray-500 flex items-center gap-1"><MapPin size={12}/> Localidad</label>
                   <input className="w-full border p-2 rounded" placeholder="Ej: Quilmes" value={newMember.city} onChange={e => setNewMember({...newMember, city: e.target.value})} />
                </div>
              </div>

              <div>
                 <label className="text-xs font-bold uppercase text-gray-500">Dirección</label>
                 <input className="w-full border p-2 rounded" placeholder="Calle 123..." value={newMember.address} onChange={e => setNewMember({...newMember, address: e.target.value})} />
              </div>
              
              <div>
                 <label className="text-xs font-bold uppercase text-gray-500 flex items-center gap-1"><Camera size={12}/> Foto (URL)</label>
                 <input className="w-full border p-2 rounded" placeholder="https://..." value={newMember.photo} onChange={e => setNewMember({...newMember, photo: e.target.value})} />
              </div>

              <hr className="border-dashed my-2"/>

              {/* Sección Usuario / Acceso */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-xs font-bold text-blue-800 mb-2 uppercase">Datos de Acceso (Opcional)</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 flex items-center gap-1"><Mail size={12}/> Email</label>
                    <input type="email" className="w-full border p-2 rounded bg-white" placeholder="juan@email.com" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 flex items-center gap-1"><Lock size={12}/> Contraseña</label>
                    <input type="password" className="w-full border p-2 rounded bg-white" placeholder="******" value={newMember.password} onChange={e => setNewMember({...newMember, password: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                <button type="submit" disabled={saving} className="bg-blue-900 text-white px-6 py-2 rounded font-bold hover:bg-blue-800">
                  {saving ? 'Guardando...' : 'Crear'}
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
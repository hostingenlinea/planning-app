import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Search, Plus, Phone, MapPin, Trash2, UserPlus, X, Mail, Cake, Lock, Camera, Upload } from 'lucide-react';

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
    } catch (error) { } finally { setLoading(false); }
  };

  // --- LÓGICA DE FOTO AUTOMÁTICA (4x4) ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Crear un canvas cuadrado (400x400 px para que no pese mucho)
        const canvas = document.createElement('canvas');
        const size = 400;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Calcular recorte para que quede centrada (object-fit: cover)
        let sWidth, sHeight, sx, sy;
        if (img.width > img.height) {
          sHeight = img.height;
          sWidth = img.height;
          sx = (img.width - img.height) / 2;
          sy = 0;
        } else {
          sWidth = img.width;
          sHeight = img.width;
          sx = 0;
          sy = (img.height - img.width) / 2;
        }

        // Dibujar en el canvas redimensionado
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, size, size);

        // Convertir a texto Base64
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // 80% calidad
        setNewMember({ ...newMember, photo: dataUrl });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post(`${API_URL}/api/members`, newMember);
      setIsModalOpen(false);
      // Limpiar formulario
      setNewMember({ firstName: '', lastName: '', phone: '', email: '', address: '', city: '', birthDate: '', photo: '', password: '' });
      fetchMembers();
      alert('¡Persona creada con éxito!'); // Feedback positivo
    } catch (error) {
      console.error(error);
      // AQUI ESTA LA CLAVE: Mostrar el mensaje real del servidor
      const serverMessage = error.response?.data?.error;
      alert(serverMessage || 'Error desconocido al conectar con el servidor.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar persona?')) return;
    try { await axios.delete(`${API_URL}/api/members/${id}`); fetchMembers(); } catch (error) { }
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

      {/* LISTA DE PERSONAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m) => (
          <div key={m.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-4 items-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200 shadow-sm">
              {m.photo ? (
                <img src={m.photo} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                <span className="font-bold text-gray-400 text-lg">{m.firstName[0]}</span>
              )}
            </div>
            <div className="flex-1 overflow-hidden text-sm space-y-0.5">
              <h3 className="font-bold text-gray-800 text-base">{m.firstName} {m.lastName}</h3>
              <p className="text-blue-600 text-[10px] font-bold uppercase tracking-wider">{m.churchRole}</p>
              {m.phone && <div className="flex gap-2 text-gray-500 text-xs"><Phone size={10} /> {m.phone}</div>}
              {m.city && <div className="flex gap-2 text-gray-500 text-xs"><MapPin size={10} /> {m.city}</div>}
            </div>
            <button onClick={() => handleDelete(m.id)} className="text-gray-300 hover:text-red-500 p-2"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>

      {/* MODAL ALTA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden my-8 animate-fade-in">
            <div className="bg-blue-900 px-6 py-4 flex justify-between items-center text-white">
              <h2 className="text-lg font-bold flex items-center gap-2"><UserPlus size={24} /> Alta de Persona</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">

              {/* Sección Foto */}
              <div className="flex justify-center mb-4">
                <div className="relative w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden group hover:border-blue-500 transition-colors cursor-pointer">
                  {newMember.photo ? (
                    <img src={newMember.photo} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <Camera size={24} className="mx-auto mb-1" />
                      <span className="text-[10px] uppercase font-bold">Subir Foto</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Sección Datos */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500">Nombre *</label>
                  <input required className="w-full border p-2 rounded focus:border-blue-500 outline-none" value={newMember.firstName} onChange={e => setNewMember({ ...newMember, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500">Apellido *</label>
                  <input required className="w-full border p-2 rounded focus:border-blue-500 outline-none" value={newMember.lastName} onChange={e => setNewMember({ ...newMember, lastName: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 flex items-center gap-1"><Cake size={12} /> Cumpleaños</label>
                  <input type="date" className="w-full border p-2 rounded focus:border-blue-500 outline-none" value={newMember.birthDate} onChange={e => setNewMember({ ...newMember, birthDate: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 flex items-center gap-1"><MapPin size={12} /> Localidad</label>
                  <input className="w-full border p-2 rounded focus:border-blue-500 outline-none" placeholder="Ej: Quilmes" value={newMember.city} onChange={e => setNewMember({ ...newMember, city: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-gray-500">Dirección</label>
                <input className="w-full border p-2 rounded focus:border-blue-500 outline-none" placeholder="Calle 123..." value={newMember.address} onChange={e => setNewMember({ ...newMember, address: e.target.value })} />
              </div>

              <hr className="border-dashed my-2" />

              {/* Sección Usuario */}
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <p className="text-xs font-bold text-orange-800 mb-2 uppercase flex items-center gap-2">
                  <Lock size={12} /> Datos de Acceso (Obligatorio)
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-600 flex items-center gap-1">Email *</label>
                    <input
                      required // <--- OBLIGATORIO
                      type="email"
                      className="w-full border p-2 rounded bg-white focus:ring-2 focus:ring-orange-200 outline-none"
                      placeholder="juan@email.com"
                      value={newMember.email}
                      onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 flex items-center gap-1">Contraseña *</label>
                    <input
                      required // <--- OBLIGATORIO
                      type="password"
                      className="w-full border p-2 rounded bg-white focus:ring-2 focus:ring-orange-200 outline-none"
                      placeholder="Mínimo 6 caracteres"
                      value={newMember.password}
                      onChange={e => setNewMember({ ...newMember, password: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                <button type="submit" disabled={saving} className="bg-blue-900 text-white px-6 py-2 rounded font-bold hover:bg-blue-800 shadow-md">
                  {saving ? 'Guardando...' : 'Crear Persona'}
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
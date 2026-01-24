import React, { useState } from 'react';
import axios from 'axios';
import { X, Save, Loader, Lock, Mail, MapPin, Calendar } from 'lucide-react';

const AddMemberModal = ({ isOpen, onClose, onMemberAdded }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    birthDate: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/api/members`, formData);
      onMemberAdded(); 
      onClose();       
      // Limpiar formulario
      setFormData({ 
        firstName: '', lastName: '', phone: '', address: '', 
        city: '', birthDate: '', email: '', password: '' 
      }); 
    } catch (err) {
      console.error(err);
      // Mostrar mensaje del servidor o genérico
      setError(err.response?.data?.error || 'Error al guardar. Verifica los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in my-8">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-primary px-6 py-4 text-white">
          <h2 className="text-lg font-bold">Nueva Persona & Usuario</h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="text-red-600 bg-red-50 p-3 rounded-md text-sm font-medium border border-red-200">{error}</div>}
          
          {/* Sección 1: Datos Personales */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-3 border-b pb-2">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input name="firstName" required value={formData.firstName} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" placeholder="Juan" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                <input name="lastName" required value={formData.lastName} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" placeholder="Pérez" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Calendar size={14}/> Fecha de Nacimiento</label>
                <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Phone size={14}/> Teléfono</label>
                <input name="phone" value={formData.phone} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" placeholder="+54 9 11..." />
              </div>
            </div>
          </div>

          {/* Sección 2: Dirección */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-3 border-b pb-2">Domicilio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><MapPin size={14}/> Dirección</label>
                <input name="address" value={formData.address} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" placeholder="Calle y Altura" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Localidad</label>
                <input name="city" value={formData.city} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" placeholder="Ej. Quilmes" />
              </div>
            </div>
          </div>

          {/* Sección 3: Cuenta de Usuario */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-gray-900 font-semibold mb-3 flex items-center gap-2">
              <Lock size={18} className="text-primary"/> 
              Cuenta de Acceso
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Mail size={14}/> Email (Usuario) *</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" placeholder="usuario@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                <input type="password" name="password" required value={formData.password} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" placeholder="******" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition">Cancelar</button>
            <button type="submit" disabled={loading}
              className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-70 shadow-sm">
              {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
              Guardar Usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
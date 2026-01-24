import React, { useState } from 'react';
import axios from 'axios';
// Importamos solo íconos básicos que seguro existen
import { X, Save, Loader } from 'lucide-react';

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

  // Si no está abierto, no renderizamos nada
  if (!isOpen) return null;

  const API_URL = import.meta.env.VITE_API_URL;

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
      setFormData({ 
        firstName: '', lastName: '', phone: '', address: '', 
        city: '', birthDate: '', email: '', password: '' 
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error al guardar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Usamos 'fixed' y z-index alto para asegurar que se vea sobre todo
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-blue-900 px-6 py-4 text-white">
          <h2 className="text-lg font-bold">Nuevo Registro</h2>
          <button onClick={onClose} type="button" className="text-white hover:bg-white/20 p-2 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded border border-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Datos Personales */}
            <div className="col-span-1 md:col-span-2">
                <h3 className="font-bold text-gray-700 border-b pb-2 mb-4">Datos Personales</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input name="firstName" required value={formData.firstName} onChange={handleChange}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
              <input name="lastName" required value={formData.lastName} onChange={handleChange}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input name="phone" value={formData.phone} onChange={handleChange}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Nacimiento</label>
              <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            {/* Dirección */}
             <div className="col-span-1 md:col-span-2 mt-2">
                <h3 className="font-bold text-gray-700 border-b pb-2 mb-4">Dirección</h3>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Calle y Altura</label>
              <input name="address" value={formData.address} onChange={handleChange}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localidad</label>
              <input name="city" value={formData.city} onChange={handleChange}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            {/* Usuario */}
             <div className="col-span-1 md:col-span-2 mt-2">
                <h3 className="font-bold text-gray-700 border-b pb-2 mb-4">Cuenta de Acceso</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (Usuario) *</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
              <input type="password" name="password" required value={formData.password} onChange={handleChange}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t mt-4">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-800 transition flex items-center gap-2">
              {loading ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
import React, { useState } from 'react';
import axios from 'axios';
import { X, Calendar, Clock, Loader, LayoutList } from 'lucide-react';

const CreateServiceModal = ({ isOpen, onClose, onServiceCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    date: '', // Fecha y hora combinadas
    type: 'Culto General'
  });
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/services`, formData);
      onServiceCreated();
      onClose();
      setFormData({ name: '', date: '', type: 'Culto General' }); // Limpiar
    } catch (error) {
      alert('Error al crear el servicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in overflow-hidden">
        
        <div className="bg-blue-900 px-6 py-4 flex justify-between items-center text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Calendar size={20} /> Nuevo Servicio
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Servicio</label>
            <input 
              required
              autoFocus
              type="text"
              placeholder="Ej: Culto Domingo, Reunión de Jóvenes..."
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <div className="relative">
              <LayoutList size={16} className="absolute left-3 top-3 text-gray-400" />
              <select 
                className="w-full border p-2 pl-9 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="Culto">Culto</option>
                <option value="Noche ADN">Noche ADN</option>
                <option value="Jovenes">Jóvenes</option>
                <option value="Ensayo">Ensayo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y Hora</label>
            <div className="relative">
              <Clock size={16} className="absolute left-3 top-3 text-gray-400" />
              <input 
                required
                type="datetime-local"
                className="w-full border p-2 pl-9 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader className="animate-spin" size={18}/> : 'Agendar'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateServiceModal;
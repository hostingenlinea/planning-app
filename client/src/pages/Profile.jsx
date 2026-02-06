import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Camera, Lock, Save, UserCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const Profile = () => {
  const { user, login } = useAuth();
  const [photo, setPhoto] = useState(user.photo || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Redimensionar imagen a 400x400
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 400; 
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        let sWidth, sHeight, sx, sy;
        if (img.width > img.height) {
          sHeight = img.height; sWidth = img.height;
          sx = (img.width - img.height) / 2; sy = 0;
        } else {
          sWidth = img.width; sHeight = img.width;
          sx = 0; sy = (img.height - img.width) / 2;
        }
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, size, size);
        setPhoto(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if(!confirm('¿Estás seguro de guardar los cambios?')) return;
    
    setLoading(true);
    try {
      await axios.put(`${API_URL}/api/auth/profile`, {
        userId: user.id,
        photo,
        password
      });

      // Actualizar sesión local
      const updatedUser = { ...user, photo };
      login(updatedUser); 
      
      alert('Perfil actualizado con éxito');
      setPassword(''); 
    } catch (error) {
      console.error(error);
      alert('Error al actualizar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
        <UserCircle size={32}/> Mis Datos
      </h1>

      <form onSubmit={handleUpdate} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        
        {/* FOTO */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden group cursor-pointer hover:opacity-90 transition-opacity">
             {photo ? (
               <img src={photo} className="w-full h-full object-cover" alt="Preview" />
             ) : (
               <span className="text-4xl font-bold text-gray-300">{user.firstName?.[0]}</span>
             )}
             
             <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
             
             <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <Camera className="text-white" size={32}/>
             </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Toca para cambiar foto</p>
        </div>

        {/* DATOS DE LECTURA */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Nombre</label>
            <div className="font-medium text-gray-700 bg-gray-50 p-2 rounded">{user.firstName} {user.lastName}</div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
            <div className="font-medium text-gray-700 bg-gray-50 p-2 rounded">{user.email}</div>
          </div>
        </div>

        {/* PASSWORD */}
        <div className="border-t border-dashed pt-6 mt-6">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Lock size={16}/> Cambiar Contraseña
          </h3>
          <input 
            type="password"
            placeholder="Escribe para cambiar (o deja vacío)"
            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition flex items-center gap-2 shadow-lg"
          >
            {loading ? 'Guardando...' : <><Save size={20}/> Guardar Cambios</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
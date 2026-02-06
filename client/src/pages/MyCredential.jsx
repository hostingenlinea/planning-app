import React from 'react';
import QRCode from "react-qr-code";
import { useAuth } from '../context/AuthContext';

const MyCredential = () => {
  const { user } = useAuth();

  if (!user) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] p-6 bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 text-center max-w-sm w-full relative overflow-hidden">
        
        {/* Decoración superior */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>

        {/* Foto */}
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 overflow-hidden border-4 border-white shadow-md">
           {user.photo ? (
             <img src={user.photo} className="w-full h-full object-cover" alt="Perfil" />
           ) : (
             <span className="text-3xl font-bold">{user.firstName?.[0] || 'U'}</span>
           )}
        </div>
        
        {/* Datos Reales */}
        <h1 className="text-2xl font-bold text-gray-800 uppercase">{user.firstName} {user.lastName}</h1>
        <p className="text-blue-600 font-bold mb-6 uppercase tracking-widest text-xs bg-blue-50 inline-block px-3 py-1 rounded-full mt-2">
          {user.role}
        </p>

        {/* QR con ID Real */}
        <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-300 inline-block mb-6">
          <QRCode value={user.memberId?.toString() || "0"} size={160} />
        </div>

        <p className="text-gray-400 text-xs">
          ID: {user.memberId} • Presenta este código en recepción.
        </p>
      </div>
    </div>
  );
};

export default MyCredential;
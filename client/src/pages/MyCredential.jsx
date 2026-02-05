import React from 'react';
import QRCode from "react-qr-code";
import { User } from 'lucide-react';

const MyCredential = () => {
  // SIMULACIÓN: Usamos un ID fijo para probar
  const myId = 1; 
  const myName = "Juan Perez";
  const myRole = "Baterista";

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] p-6 bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 text-center max-w-sm w-full">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
          <User size={40} />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800">{myName}</h1>
        <p className="text-blue-600 font-medium mb-6 uppercase tracking-widest text-xs">{myRole}</p>

        <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-300 inline-block mb-6">
          <QRCode value={myId.toString()} size={180} />
        </div>

        <p className="text-gray-400 text-sm">
          Presenta este código en recepción para dar tu presente.
        </p>
      </div>
    </div>
  );
};

export default MyCredential;
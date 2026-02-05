import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Scan, CheckCircle, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const Reception = () => {
  const [inputId, setInputId] = useState('');
  const [lastCheckIn, setLastCheckIn] = useState(null);
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchHistory();
    inputRef.current?.focus();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/attendance`);
      setHistory(res.data);
    } catch (error) {}
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!inputId) return;

    try {
      const res = await axios.post(`${API_URL}/api/attendance`, { memberId: inputId });
      setLastCheckIn(res.data.member);
      fetchHistory();
      setInputId(''); 
    } catch (error) {
      alert('Error: Código no válido o persona no encontrada');
      setInputId('');
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* SCANNER */}
      <div className="flex flex-col items-center justify-center bg-blue-900 rounded-2xl p-10 text-white shadow-2xl relative overflow-hidden">
        <Scan size={64} className="mb-4 text-blue-300 animate-pulse"/>
        <h1 className="text-3xl font-bold mb-2">Punto de Acceso</h1>
        <p className="text-blue-200 mb-8">Escanea la credencial digital</p>

        <form onSubmit={handleScan} className="w-full max-w-xs relative">
          <input 
            ref={inputRef}
            autoFocus
            type="number" 
            value={inputId}
            onChange={e => setInputId(e.target.value)}
            className="w-full text-center text-3xl font-bold text-gray-900 py-3 rounded-lg outline-none focus:ring-4 focus:ring-blue-500"
            placeholder="ID..."
            onBlur={() => setTimeout(() => inputRef.current?.focus(), 100)} 
          />
        </form>

        {lastCheckIn && (
          <div className="mt-8 bg-green-500/20 border border-green-500/50 p-4 rounded-xl flex items-center gap-4 animate-fade-in w-full">
            <div className="bg-green-500 rounded-full p-2 text-white">
              <CheckCircle size={32} />
            </div>
            <div>
              <p className="text-green-300 text-xs uppercase font-bold">¡Bienvenido!</p>
              <p className="text-2xl font-bold">{lastCheckIn.firstName} {lastCheckIn.lastName}</p>
            </div>
          </div>
        )}
      </div>

      {/* HISTORIAL */}
      <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden flex flex-col h-[500px]">
        <div className="p-4 border-b bg-gray-50 font-bold text-gray-700 flex items-center gap-2">
          <Clock size={18}/> Últimos Ingresos
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.map(record => (
            <div key={record.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
               <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                 {record.member.firstName[0]}
               </div>
               <div className="flex-1">
                 <p className="font-bold text-gray-800">{record.member.firstName} {record.member.lastName}</p>
                 <p className="text-xs text-gray-500">
                   {new Date(record.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} hs
                 </p>
               </div>
               <div className="text-green-500"><CheckCircle size={16} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reception;
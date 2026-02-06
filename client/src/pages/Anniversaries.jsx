import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Cake, Gift, MapPin } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const Anniversaries = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const currentMonth = new Date().getMonth();
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/members`);
      const birthdays = res.data.filter(m => {
        if (!m.birthDate) return false;
        
        const isThisMonth = new Date(m.birthDate).getMonth() === currentMonth;
        // FILTRO: Excluir al usuario logueado
        const isNotMe = user ? m.id !== user.memberId : true; 

        return isThisMonth && isNotMe;
      }).sort((a, b) => {
        return new Date(a.birthDate).getDate() - new Date(b.birthDate).getDate();
      });

      setMembers(birthdays);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const getAge = (dateString) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col items-center justify-center mb-10 text-center">
        <div className="bg-pink-100 p-4 rounded-full mb-4 text-pink-500">
          <Cake size={48} />
        </div>
        <h1 className="text-4xl font-bold text-gray-800">Cumpleaños de {monthNames[currentMonth]}</h1>
        <p className="text-gray-500 mt-2">¡Celebremos la vida de nuestro equipo!</p>
      </div>

      {loading ? (
        <div className="text-center py-10">Cargando festejos...</div>
      ) : members.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-xl border border-dashed">
          <p className="text-gray-400">No hay otros cumpleaños este mes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map(member => {
             const day = new Date(member.birthDate).getDate();
             const isToday = day === new Date().getDate();

             return (
               <div key={member.id} className={`relative bg-white p-6 rounded-2xl shadow-sm border-2 overflow-hidden hover:shadow-lg transition-shadow group ${isToday ? 'border-pink-400 ring-4 ring-pink-50' : 'border-gray-100'}`}>
                 {isToday && (
                   <div className="absolute top-0 right-0 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">¡ES HOY!</div>
                 )}
                 <div className="flex items-center gap-4">
                   <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-white shadow flex items-center justify-center overflow-hidden shrink-0">
                      {member.photo ? <img src={member.photo} className="w-full h-full object-cover" /> : <span className="text-2xl font-bold text-gray-400">{member.firstName[0]}</span>}
                   </div>
                   <div>
                     <h3 className="text-xl font-bold text-gray-800">{member.firstName} {member.lastName}</h3>
                     <p className="text-sm text-blue-600 font-bold uppercase tracking-wide">{member.churchRole}</p>
                     <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                       <Gift size={14} className="text-pink-400"/> <span>Cumple {getAge(member.birthDate)} años</span>
                     </div>
                   </div>
                 </div>
                 <div className="mt-6 flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                   <div className="flex flex-col items-center px-4 border-r border-gray-200">
                      <span className="text-xs text-gray-400 uppercase font-bold">Día</span>
                      <span className="text-2xl font-bold text-gray-800">{day}</span>
                   </div>
                   <div className="flex-1 text-center text-sm text-gray-600 italic">"¡Bendiciones!"</div>
                 </div>
               </div>
             )
          })}
        </div>
      )}
    </div>
  );
};

export default Anniversaries;
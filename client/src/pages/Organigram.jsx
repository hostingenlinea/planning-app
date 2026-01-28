import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Network, Layers, Users, User } from 'lucide-react';
import MemberDetailModal from '../components/MemberDetailModal'; // <--- Importamos el modal

const API_URL = import.meta.env.VITE_API_URL;

const Organigram = () => {
  const [ministries, setMinistries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el modal
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/ministries`);
      setMinistries(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar datos completos de la persona al hacer clic
  const handleMemberClick = async (memberId) => {
    try {
      const res = await axios.get(`${API_URL}/api/members/${memberId}`);
      setSelectedMember(res.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error cargando detalles", error);
    }
  };

  if (loading) return <div className="p-10 text-center">Cargando estructura...</div>;

  return (
    <div className="p-4 md:p-6 h-[calc(100vh-80px)] overflow-hidden flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Network size={28} /> Organigrama
        </h1>
        <p className="text-gray-500">Vista jerárquica de la iglesia.</p>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 rounded-xl border border-gray-200 shadow-inner p-8 cursor-grab active:cursor-grabbing">
        <div className="tree w-max mx-auto">
          <ul>
            <li>
              <div className="bg-blue-900 text-white p-4 rounded-lg shadow-lg border-2 border-blue-800 w-48 mx-auto hover:scale-105 transition-transform">
                <div className="font-bold text-lg mb-1">MDS Quilmes</div>
                <div className="text-xs text-blue-200">Iglesia Principal</div>
              </div>

              {ministries.length > 0 && (
                <ul>
                  {ministries.map((ministry) => (
                    <li key={ministry.id}>
                      <div className="bg-white p-3 rounded-lg shadow-md border-t-4 border-blue-500 w-40 mx-auto hover:shadow-xl transition-shadow relative group z-10">
                        <Layers size={20} className="mx-auto text-blue-500 mb-2"/>
                        <div className="font-bold text-gray-800 text-sm">{ministry.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{ministry.teams.length} Equipos</div>
                      </div>

                      {ministry.teams.length > 0 && (
                        <ul>
                          {ministry.teams.map((team) => (
                            <li key={team.id}>
                              <div className="bg-white p-2 rounded shadow border border-gray-200 w-36 mx-auto hover:bg-blue-50 transition-colors">
                                <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                                    <Users size={14} />
                                </div>
                                <div className="font-semibold text-gray-700 text-xs">{team.name}</div>
                                
                                {team.members && team.members.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                                        {team.members.map(tm => (
                                            <button 
                                              key={tm.id} 
                                              onClick={() => handleMemberClick(tm.member.id)} // <--- CLICK AQUÍ
                                              className="w-full text-[10px] text-gray-600 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-1 bg-gray-50 rounded py-1 transition-colors cursor-pointer"
                                            >
                                                <User size={8} />
                                                {tm.member.firstName}
                                            </button>
                                        ))}
                                    </div>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </div>
      </div>

      {/* MODAL DE DETALLES */}
      <MemberDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        member={selectedMember} 
      />
    </div>
  );
};

export default Organigram;
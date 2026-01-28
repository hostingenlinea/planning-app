import React from 'react';
import { X, Phone, MapPin, Calendar, Mail, Shield, User } from 'lucide-react';

const MemberDetailModal = ({ isOpen, onClose, member }) => {
  if (!isOpen || !member) return null;

  // Formatear fecha
  const birthDate = member.birthDate 
    ? new Date(member.birthDate).toLocaleDateString() 
    : 'No registrada';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative">
        
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 h-24 relative">
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Foto de Perfil (Avatar) */}
        <div className="relative px-6">
          <div className="-mt-12 mb-4">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-400 shadow-md">
              {member.firstName[0]}{member.lastName[0]}
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{member.firstName} {member.lastName}</h2>
            <p className="text-gray-500 text-sm flex items-center gap-1">
              <Shield size={14} className="text-blue-500"/> 
              {member.user ? 'Usuario del Sistema' : 'Miembro'}
            </p>
          </div>

          {/* Datos de Contacto */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Phone size={16} />
              </div>
              <span className="text-sm">{member.phone || 'Sin teléfono'}</span>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <MapPin size={16} />
              </div>
              <span className="text-sm">
                {member.address ? `${member.address}, ${member.city || ''}` : 'Sin dirección'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                <Calendar size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Cumpleaños</span>
                <span className="text-sm font-medium">{birthDate}</span>
              </div>
            </div>
            
            {member.user && (
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                  <Mail size={16} />
                </div>
                <span className="text-sm">{member.user.email}</span>
              </div>
            )}
          </div>

          {/* Equipos */}
          <div className="border-t pt-4 mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Equipos</h3>
            <div className="flex flex-wrap gap-2">
              {member.teams && member.teams.length > 0 ? (
                member.teams.map((tm) => (
                  <span key={tm.id} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium border border-gray-200">
                    {tm.team.name}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400 italic">Sin equipos asignados.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetailModal;
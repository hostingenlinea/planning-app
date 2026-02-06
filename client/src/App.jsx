import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';

// --- IMPORTACIONES ---
import People from './pages/People';
import Plans from './pages/Plans';
import ServiceDetail from './pages/ServiceDetail';
import Ministries from './pages/Ministries'; 
import Organigram from './pages/Organigram';
import Events from './pages/Events';
import Admin from './pages/Admin';
import Anniversaries from './pages/Anniversaries';
import MyCredential from './pages/MyCredential';
import Reception from './pages/Reception';
import Profile from './pages/Profile'; // <--- Nueva Página

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center text-gray-500">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* LOGIN */}
          <Route path="/login" element={<Login />} />

          {/* RUTAS PROTEGIDAS */}
          <Route path="/*" element={
            <ProtectedRoute>
              <Routes>
                <Route path="/" element={<Navigate to="/events" replace />} />
                
                <Route path="/people" element={<People />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/plans/:id" element={<ServiceDetail />} />
                <Route path="/areas" element={<Ministries />} />
                <Route path="/organigram" element={<Organigram />} />
                <Route path="/events" element={<Events />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/anniversaries" element={<Anniversaries />} />
                
                {/* Módulos de Usuario */}
                <Route path="/credential" element={<MyCredential />} />
                <Route path="/reception" element={<Reception />} />
                <Route path="/profile" element={<Profile />} /> {/* <--- Ruta */}
                
                <Route path="*" element={<div className="p-10 text-center text-gray-400">Página no encontrada</div>} />
              </Routes>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
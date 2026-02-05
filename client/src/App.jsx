import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// --- IMPORTACIONES DE PÁGINAS ---
import People from './pages/People';
import Plans from './pages/Plans';         // <--- 1. Importamos el tablero principal
import ServiceDetail from './pages/ServiceDetail'; // <--- 2. Importamos el detalle (si ya lo creaste)
import Ministries from './pages/Ministries';
import Organigram from './pages/Organigram';
import Events from './pages/Events';
import Admin from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Redirección inicial */}
          <Route path="/" element={<Navigate to="/people" replace />} />

          {/* Módulo de Personas */}
          <Route path="/people" element={<People />} />

          {/* --- MÓDULO DE PLANIFICACIÓN --- */}
          {/* Esta es la ruta que te faltaba conectar: */}
          <Route path="/plans" element={<Plans />} />
          
          {/* Ruta dinámica para ver el detalle de un culto (ej: /plans/4) */}
          {/* Si aún no creaste ServiceDetail.jsx, comenta esta línea temporalmente */}
          <Route path="/plans/:id" element={<ServiceDetail />} />

          {/* Módulo de Areas */}
          <Route path="/areas" element={<Ministries />} />

          {/* Módulo Organigrama */}
          <Route path="/organigram" element={<Organigram />} />

          {/* Módulo Eventos */}
          <Route path="/events" element={<Events />} />

          <Route path="/giving" element={
            <div className="p-8 text-gray-500">
              <h2 className="text-2xl font-bold mb-2">Donaciones</h2>
              <p>Este módulo está en construcción.</p>
            </div>
          } />

          {/* Módulo Administrador */}
          <Route path="/admin" element={<Admin />} />

          {/* Ruta de Error 404 */}
          <Route path="*" element={
            <div className="p-8 text-red-500 font-bold">
              Página no encontrada.
            </div>
          } />

        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
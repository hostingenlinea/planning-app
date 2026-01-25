import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import People from './pages/People';
import Plans from './pages/Plans';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* --- RUTAS PRINCIPALES --- */}
          
          {/* Al entrar a la web, redirigir automáticamente a /people */}
          <Route path="/" element={<Navigate to="/people" replace />} />

          {/* Módulo de Personas */}
          <Route path="/people" element={<People />} />

          {/* --- MÓDULOS PENDIENTES (Placeholders) --- */}
          {/* Estas rutas sirven para que los botones del menú no den error 404 */}
          <Route path="/plans" element={<Plans />} />
          
          <Route path="/events" element={
            <div className="p-8 text-gray-500">
              <h2 className="text-2xl font-bold mb-2">Eventos</h2>
              <p>Este módulo está en construcción.</p>
            </div>
          } />

          <Route path="/giving" element={
            <div className="p-8 text-gray-500">
              <h2 className="text-2xl font-bold mb-2">Donaciones</h2>
              <p>Este módulo está en construcción.</p>
            </div>
          } />

          <Route path="/admin" element={
            <div className="p-8 text-gray-500">
              <h2 className="text-2xl font-bold mb-2">Administración</h2>
              <p>Configuraciones generales del sistema.</p>
            </div>
          } />

          {/* Ruta para páginas no encontradas (404) */}
          <Route path="*" element={
            <div className="p-8 text-red-500">
              Página no encontrada.
            </div>
          } />

        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
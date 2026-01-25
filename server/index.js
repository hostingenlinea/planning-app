require('dotenv').config(); // Carga variables de entorno si estás en local
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

// --- IMPORTACIÓN DE RUTAS ---
// Asegúrate de que el archivo 'server/routes/members.routes.js' exista
const memberRoutes = require('./routes/members.routes');
const serviceRoutes = require('./routes/services.routes');

// Inicializar App y Base de Datos
const app = express();
const prisma = new PrismaClient();

// --- CONFIGURACIÓN DE SEGURIDAD (CORS) ---
// Define quién tiene permiso para pedir datos a esta API
const allowedOrigins = [
  'https://mdsq.hcloud.one',   // Tu Frontend en Producción
  'http://localhost:5173',     // Tu entorno Local (Vite)
  'http://localhost:3000'      // Postman o pruebas locales
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (como Postman o curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'La política CORS no permite acceso desde este origen.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true // Permite cookies/headers de autorización
}));

// --- MIDDLEWARES GLOBALES ---
app.use(express.json()); // Para que el servidor entienda JSON en el body

// --- RUTAS DE SALUD (Health Check) ---
// Esta ruta es vital para que Coolify sepa que tu app arrancó bien
app.get('/', (req, res) => {
  res.send('API MDSQ Planning App - Online 🚀');
});

// --- CONEXIÓN DE MÓDULOS (RUTAS) ---
// Aquí iremos agregando los demás módulos (cultos, canciones, etc.)
app.use('/api/members', memberRoutes);
app.use('/api/services', serviceRoutes);

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo exitosamente en el puerto ${PORT}`);
});
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

// --- IMPORTACIÓN DE RUTAS ---
const memberRoutes = require('./routes/members.routes');
const serviceRoutes = require('./routes/services.routes');
const ministryRoutes = require('./routes/ministries.routes');
const adminRoutes = require('./routes/admin.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const authRoutes = require('./routes/auth.routes'); // <--- 1. AGREGADO AQUÍ

// Inicializar
const app = express();
const prisma = new PrismaClient();

// --- CONFIGURACIÓN CORS ---
const allowedOrigins = [
  'https://mdsq.hcloud.one',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('La política CORS no permite acceso.'), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// --- CONFIGURACIÓN BODY PARSER (10MB PARA FOTOS) ---
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// --- RUTA DE SALUD ---
app.get('/', (req, res) => {
  res.send('API MDSQ Planning App - Online 🚀');
});

// --- CONEXIÓN DE MÓDULOS ---
app.use('/api/members', memberRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/ministries', ministryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/auth', authRoutes); // <--- 2. CONECTADO AQUÍ

// --- INICIO ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
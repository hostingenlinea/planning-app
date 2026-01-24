const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const app = express();
const prisma = new PrismaClient();

app.use(cors()); // En producción, configura esto con tu dominio frontend
app.use(express.json());

// Endpoint de Salud (Para Coolify)
app.get('/', (req, res) => res.send('API MDSQ Online'));

// Ejemplo: Obtener Miembros
app.get('/api/members', async (req, res) => {
  const members = await prisma.member.findMany();
  res.json(members);
});

// Aquí irían tus rutas de autenticación, servicios, MinIO, etc.

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
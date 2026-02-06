const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Buscar Usuario por Email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        member: { // Traemos también los datos de perfil (Member)
          include: { labels: true } 
        } 
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // 2. Verificar Contraseña
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // 3. Preparar datos para el frontend
    // Usaremos el rol de iglesia (Member) si existe, sino el del usuario
    const userRole = user.member?.churchRole || 'Colaborador';
    
    // Devolvemos el usuario limpio (sin password)
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: userRole, // "Pastor", "Lider", "Colaborador", "Admin"
      memberId: user.member?.id,
      photo: user.member?.photo,
      firstName: user.member?.firstName
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
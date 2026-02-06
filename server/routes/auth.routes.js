const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log(`🔍 Intentando login con: ${email}`); // <--- LOG 1

  try {
    // 1. Buscar Usuario
    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        member: { include: { labels: true } } 
      }
    });

    if (!user) {
      console.log('❌ Usuario no encontrado en tabla User'); // <--- LOG 2
      return res.status(401).json({ error: 'Usuario no encontrado.' });
    }

    console.log('✅ Usuario encontrado. Verificando contraseña...'); // <--- LOG 3

    // 2. Verificar Contraseña
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      console.log('❌ Contraseña incorrecta'); // <--- LOG 4
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

    console.log('🎉 Login exitoso'); // <--- LOG 5

    // 3. Responder
    const userRole = user.member?.churchRole || 'Colaborador';
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: userRole,
      memberId: user.member?.id,
      photo: user.member?.photo,
      firstName: user.member?.firstName
    });

  } catch (error) {
    console.error('💥 Error en servidor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ==========================================
// RUTA 1: LOGIN (POST)
// ==========================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log(`🔍 Intentando login con: ${email}`);

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        member: { include: { labels: true } } 
      }
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    console.log('🎉 Login exitoso');

    // Usar rol de iglesia si existe, sino el del usuario
    const userRole = user.member?.churchRole || user.role || 'Colaborador';
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: userRole, 
      memberId: user.member?.id,
      photo: user.member?.photo,
      firstName: user.member?.firstName,
      lastName: user.member?.lastName // Agregamos apellido para mostrar en credencial
    });

  } catch (error) {
    console.error('💥 Error en servidor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// RUTA 2: ACTUALIZAR PERFIL (PUT)
// ==========================================
router.put('/profile', async (req, res) => {
  const { userId, photo, password } = req.body;

  try {
    const updateData = {};
    const memberUpdateData = {};

    // 1. Si hay contraseña nueva, la encriptamos
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // 2. Si hay foto, preparamos la actualización para la tabla Member
    if (photo) {
      memberUpdateData.photo = photo;
    }

    // 3. Ejecutar transacción
    await prisma.$transaction(async (prisma) => {
      // Actualizar User
      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({
          where: { id: parseInt(userId) },
          data: updateData
        });
      }

      // Actualizar Member (Foto)
      if (Object.keys(memberUpdateData).length > 0) {
        const member = await prisma.member.findUnique({ where: { userId: parseInt(userId) } });
        if (member) {
          await prisma.member.update({
            where: { id: member.id },
            data: memberUpdateData
          });
        }
      }
    });

    res.json({ success: true, message: 'Perfil actualizado' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

// ==========================================
// RUTA 3: RESCATE / EMERGENCIA (GET)
// ==========================================
router.get('/rescue', async (req, res) => {
  const email = 'admin@mdsq.com';
  const password = 'admin123';
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await prisma.user.findUnique({ where: { email } });
    
    if (existingUser) {
        await prisma.member.deleteMany({ where: { userId: existingUser.id } });
        await prisma.user.delete({ where: { email } });
    }

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'ADMIN',
        member: {
          create: {
            firstName: 'Super',
            lastName: 'Admin',
            churchRole: 'Pastor',
            email: email,
            address: 'Oficina Central',
            city: 'Quilmes'
          }
        }
      }
    });

    res.send(`<h1>¡Usuario de Rescate Creado! 🚑</h1><p>Email: ${email}<br>Pass: ${password}</p>`);

  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

module.exports = router;
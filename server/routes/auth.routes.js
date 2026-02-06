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
    // 1. Buscar Usuario y traer datos de su Miembro asociado
    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        member: { include: { labels: true } } 
      }
    });

    if (!user) {
      console.log('❌ Usuario no encontrado en base de datos');
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // 2. Verificar Contraseña
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    console.log('🎉 Login exitoso');

    // 3. Definir Rol para el Frontend
    // Si tiene rol de iglesia (Pastor, Lider) lo usamos, sino el del sistema
    const userRole = user.member?.churchRole || user.role || 'Colaborador';
    
    // 4. Responder al Frontend
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

// ==========================================
// RUTA 2: RESCATE / EMERGENCIA (GET)
// ==========================================
router.get('/rescue', async (req, res) => {
  const email = 'admin@mdsq.com';
  const password = 'admin123';
  
  try {
    console.log('🚑 Iniciando protocolo de rescate...');

    // 1. Encriptar contraseña nueva
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Limpieza: Si ya existe ese usuario, lo borramos para crearlo limpio
    const existingUser = await prisma.user.findUnique({ where: { email } });
    
    if (existingUser) {
        console.log('♻️ Usuario existente detectado. Borrando...');
        // Borramos primero el miembro asociado (por las relaciones)
        await prisma.member.deleteMany({ where: { userId: existingUser.id } });
        // Borramos el usuario
        await prisma.user.delete({ where: { email } });
    }

    // 3. Crear el Super Admin Nuevo
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'ADMIN', // Rol interno
        member: {
          create: {
            firstName: 'Super',
            lastName: 'Admin',
            churchRole: 'Pastor', // Rol para ver todo el menú
            email: email,
            address: 'Oficina Central',
            city: 'Quilmes'
          }
        }
      }
    });

    console.log('✅ Usuario de rescate creado con éxito.');

    // 4. Respuesta visual
    res.send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: green;">¡Usuario de Rescate Creado! 🚑</h1>
        <p>Ya puedes iniciar sesión con estos datos:</p>
        <div style="background: #f0f0f0; display: inline-block; padding: 20px; border-radius: 10px; text-align: left;">
          <p>📧 Email: <b>${email}</b></p>
          <p>🔑 Password: <b>${password}</b></p>
        </div>
        <br><br>
        <a href="https://mdsq.hcloud.one/login" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ir al Login</a>
      </div>
    `);

  } catch (error) {
    console.error(error);
    res.status(500).send(`<h1>Error Grave 💥</h1><p>${error.message}</p>`);
  }
});

module.exports = router;
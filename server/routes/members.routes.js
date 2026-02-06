const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Importar el enviador de correos
// (Asegúrate de que este archivo exista en server/config/mailer.js)
const { sendWelcomeEmail } = require('../config/mailer');

// ==========================================
// RUTA 1: OBTENER TODOS LOS MIEMBROS (GET)
// ==========================================
router.get('/', async (req, res) => {
  try {
    const members = await prisma.member.findMany({ 
      orderBy: { lastName: 'asc' },
      include: { user: true } // Incluimos info del usuario si existe
    });
    res.json(members);
  } catch (error) {
    console.error("Error al obtener miembros:", error);
    res.status(500).json({ error: 'Error al obtener el listado.' });
  }
});

// ==========================================
// RUTA 2: CREAR MIEMBRO + USUARIO + EMAIL (POST)
// ==========================================
router.post('/', async (req, res) => {
  const { 
    firstName, lastName, phone, address, 
    city, birthDate, photo, 
    email, password 
  } = req.body;

  // 1. Validaciones básicas
  if (!firstName || !lastName) {
    return res.status(400).json({ error: 'Nombre y Apellido son obligatorios.' });
  }
  // Ahora el email y password son obligatorios para poder entrar
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y Contraseña son obligatorios para el acceso.' });
  }

  try {
    // 2. Verificar si el email ya existe en la tabla de Usuarios
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Este email ya está registrado en el sistema.' });
    }

    // 3. Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Transacción: Crear Usuario + Miembro (Todo o nada)
    const result = await prisma.$transaction(async (tx) => {
      // A. Crear Usuario (Login)
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name: `${firstName} ${lastName}`,
          role: 'USER' // Por defecto entra como usuario base
        }
      });

      // B. Crear Miembro (Perfil) ligado al usuario
      const newMember = await tx.member.create({
        data: {
          firstName, 
          lastName, 
          phone, 
          address, 
          city, 
          photo, 
          email,
          birthDate: birthDate ? new Date(birthDate) : null,
          userId: newUser.id
        }
      });

      return { newUser, newMember };
    });

    // 5. ENVIAR EMAIL DE BIENVENIDA 📧
    // Lo hacemos fuera de la transacción para no bloquear la respuesta si el email tarda
    try {
      console.log(`📧 Enviando bienvenida a ${email}...`);
      await sendWelcomeEmail(email, firstName, password); // Enviamos password original (texto plano)
    } catch (mailError) {
      console.error("⚠️ El usuario se creó, pero falló el envío de email:", mailError);
      // No retornamos error al frontend, porque el usuario YA se creó.
    }

    // Devolvemos el miembro creado
    res.json(result.newMember);

  } catch (error) {
    console.error("Error en creación:", error);
    // Manejo de error de duplicados (P2002 es el código de Prisma para unique constraint)
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'El email ya existe (Conflicto de base de datos).' });
    }
    res.status(500).json({ error: 'Error interno al crear el registro.' });
  }
});

// ==========================================
// RUTA 3: ELIMINAR MIEMBRO Y USUARIO (DELETE)
// ==========================================
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Buscar el miembro primero para saber su userId
    const member = await prisma.member.findUnique({ where: { id } });

    if (!member) return res.status(404).json({ error: 'Miembro no encontrado' });

    // Ejecutamos eliminación en orden (primero dependencias, luego miembro, luego usuario)
    await prisma.$transaction(async (tx) => {
      // 1. Borrar dependencias del miembro
      await tx.teamMember.deleteMany({ where: { memberId: id } });
      await tx.serviceAssignment.deleteMany({ where: { memberId: id } });
      await tx.attendance.deleteMany({ where: { memberId: id } });
      
      // 2. Borrar Miembro
      await tx.member.delete({ where: { id } });

      // 3. Si tenía usuario asociado, borrarlo también (para liberar el email)
      if (member.userId) {
        await tx.user.delete({ where: { id: member.userId } });
      }
    });

    res.json({ success: true, message: 'Registro eliminado correctamente' });

  } catch (error) { 
    console.error("Error al eliminar:", error);
    res.status(400).json({ error: 'Error al eliminar el registro.' }); 
  }
});

module.exports = router;
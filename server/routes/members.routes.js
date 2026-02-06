const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET: Obtener todos
router.get('/', async (req, res) => {
  try {
    const members = await prisma.member.findMany({ 
      orderBy: { lastName: 'asc' },
      include: { user: true } // Incluimos info del usuario si existe
    });
    res.json(members);
  } catch (error) { res.status(500).json({ error: 'Error' }); }
});

// POST: Crear Miembro (CREDENCIALES OBLIGATORIAS)
router.post('/', async (req, res) => {
  const { 
    firstName, lastName, phone, address, 
    city, birthDate, photo, 
    email, password // <--- AHORA SON OBLIGATORIOS
  } = req.body;

  // 1. Validaciones
  if (!firstName || !lastName) {
    return res.status(400).json({ error: 'Nombre y Apellido son obligatorios.' });
  }
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y Contraseña son obligatorios para el acceso.' });
  }

  try {
    // 2. Verificar si el email ya existe en la tabla de Usuarios antes de intentar nada
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Este email ya está registrado en el sistema.' });
    }

    // 3. Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Transacción: Crear Usuario + Miembro
    const result = await prisma.$transaction(async (prisma) => {
      // A. Crear Usuario (Login)
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: `${firstName} ${lastName}`,
          role: 'USER' // Por defecto entra como usuario base, luego el Admin le sube el rol
        }
      });

      // B. Crear Miembro (Perfil)
      const newMember = await prisma.member.create({
        data: {
          firstName, lastName, phone, address, city, photo, email,
          birthDate: birthDate ? new Date(birthDate) : null,
          userId: newUser.id
        }
      });

      return newMember;
    });

    res.json(result);

  } catch (error) {
    console.error("Error en creación:", error);
    // Si falla por restricción única (doble seguridad)
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'El email ya existe (Conflicto de base de datos).' });
    }
    res.status(500).json({ error: 'Error interno al crear el registro.' });
  }
});

// DELETE: Borrar Miembro Y SU USUARIO
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Buscar el miembro para obtener su userId
    const member = await prisma.member.findUnique({ where: { id } });

    if (!member) return res.status(404).json({ error: 'No encontrado' });

    // Borrar dependencias
    await prisma.teamMember.deleteMany({ where: { memberId: id } });
    await prisma.serviceAssignment.deleteMany({ where: { memberId: id } });
    await prisma.attendance.deleteMany({ where: { memberId: id } });
    
    // Borrar Miembro
    await prisma.member.delete({ where: { id } });

    // Si tenía usuario asociado, borrarlo también para liberar el email
    if (member.userId) {
      await prisma.user.delete({ where: { id: member.userId } });
    }

    res.json({ success: true });
  } catch (error) { 
    console.error(error);
    res.status(400).json({ error: 'Error al eliminar' }); 
  }
});

module.exports = router;
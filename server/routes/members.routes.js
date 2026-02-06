const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET: Obtener todos
router.get('/', async (req, res) => {
  try {
    const members = await prisma.member.findMany({ orderBy: { lastName: 'asc' } });
    res.json(members);
  } catch (error) { res.status(500).json({ error: 'Error' }); }
});

// POST: Crear Miembro COMPLETO
router.post('/', async (req, res) => {
  const { 
    firstName, lastName, phone, address, 
    city, birthDate, photo, // Nuevos campos perfil
    email, password         // Campos para Login
  } = req.body;

  if (!firstName || !lastName) {
    return res.status(400).json({ error: 'Nombre y Apellido requeridos' });
  }

  try {
    // Si viene password, creamos Usuario + Miembro (Login habilitado)
    if (email && password) {
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await prisma.$transaction(async (prisma) => {
        // 1. Crear Usuario
        const newUser = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name: `${firstName} ${lastName}`,
            role: 'USER'
          }
        });

        // 2. Crear Miembro ligado
        const newMember = await prisma.member.create({
          data: {
            firstName, lastName, phone, address, city, photo, email,
            birthDate: birthDate ? new Date(birthDate) : null,
            userId: newUser.id
          }
        });
        return newMember;
      });
      return res.json(result);
    }

    // Si NO hay password, creamos solo el Miembro (Sin login)
    const simpleMember = await prisma.member.create({
      data: {
        firstName, lastName, phone, address, city, photo, email,
        birthDate: birthDate ? new Date(birthDate) : null,
      }
    });
    res.json(simpleMember);

  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') return res.status(400).json({ error: 'El email ya existe.' });
    res.status(400).json({ error: 'Error al crear' });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.teamMember.deleteMany({ where: { memberId: id } });
    await prisma.serviceAssignment.deleteMany({ where: { memberId: id } });
    await prisma.attendance.deleteMany({ where: { memberId: id } }); // Borrar asistencias también
    await prisma.member.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) { res.status(400).json({ error: 'Error al eliminar' }); }
});

module.exports = router;
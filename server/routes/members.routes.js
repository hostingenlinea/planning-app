const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendWelcomeEmail } = require('../config/mailer');

// 1. LISTAR
router.get('/', async (req, res) => {
  try {
    const members = await prisma.member.findMany({ 
      orderBy: { lastName: 'asc' },
      include: { user: true } 
    });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el listado.' });
  }
});

// 2. CREAR (POST) + EMAIL
router.post('/', async (req, res) => {
  const { 
    firstName, lastName, phone, address, 
    city, birthDate, photo, 
    email, password, churchRole 
  } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'Faltan datos obligatorios (Nombre, Email, Pass).' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email ya registrado.' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name: `${firstName} ${lastName}`,
          role: 'USER'
        }
      });

      const newMember = await tx.member.create({
        data: {
          firstName, lastName, phone, address, city, photo, email,
          churchRole: churchRole || 'Colaborador',
          birthDate: birthDate ? new Date(birthDate) : null,
          userId: newUser.id
        }
      });
      return { newUser, newMember };
    });

    // Enviar Email (Async)
    sendWelcomeEmail(email, firstName, password).catch(console.error);

    res.json(result.newMember);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear usuario.' });
  }
});

// 3. EDITAR (PUT) - NUEVO
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { 
    firstName, lastName, phone, address, 
    city, birthDate, photo, email, churchRole 
  } = req.body;

  try {
    const currentMember = await prisma.member.findUnique({ where: { id } });
    if (!currentMember) return res.status(404).json({ error: 'No encontrado' });

    await prisma.$transaction(async (tx) => {
      // Actualizar Miembro
      await tx.member.update({
        where: { id },
        data: {
          firstName, lastName, phone, address, city, photo, email, churchRole,
          birthDate: birthDate ? new Date(birthDate) : null,
        }
      });

      // Actualizar Usuario (Email y Nombre)
      if (currentMember.userId && email) {
        await tx.user.update({
          where: { id: currentMember.userId },
          data: {
            email: email,
            name: `${firstName} ${lastName}`
          }
        });
      }
    });

    res.json({ success: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al editar.' });
  }
});

// 4. ELIMINAR (DELETE)
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const member = await prisma.member.findUnique({ where: { id } });
    if (!member) return res.status(404).json({ error: 'No encontrado' });

    await prisma.$transaction(async (tx) => {
      await tx.teamMember.deleteMany({ where: { memberId: id } });
      await tx.serviceAssignment.deleteMany({ where: { memberId: id } });
      await tx.attendance.deleteMany({ where: { memberId: id } });
      await tx.member.delete({ where: { id } });
      if (member.userId) await tx.user.delete({ where: { id: member.userId } });
    });

    res.json({ success: true });
  } catch (error) { 
    res.status(500).json({ error: 'Error al eliminar.' }); 
  }
});

module.exports = router;
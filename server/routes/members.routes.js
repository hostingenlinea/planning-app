const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET: Obtener todos los miembros
router.get('/', async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      orderBy: { lastName: 'asc' },
      include: { user: true }
    });
    res.json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener miembros' });
  }
});

// GET: Obtener UN miembro por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const member = await prisma.member.findUnique({
      where: { id: parseInt(id) },
      include: {
        teams: { include: { team: true } },
        user: true
      }
    });

    if (!member) return res.status(404).json({ error: 'Miembro no encontrado' });
    res.json(member);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

// POST: Crear Miembro (Flexible: Con o Sin Usuario)
router.post('/', async (req, res) => {
  const { 
    firstName, lastName, phone, address, city, 
    birthDate, email, password 
  } = req.body;

  // Validación Mínima: Nombre y Apellido siempre requeridos
  if (!firstName || !lastName) {
    return res.status(400).json({ error: 'Nombre y Apellido son obligatorios.' });
  }

  try {
    // CASO 1: Viene con Email y Password -> Crear Usuario + Miembro (Tu lógica avanzada)
    if (email && password) {
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await prisma.$transaction(async (prisma) => {
        // A. Crear Usuario
        const newUser = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name: `${firstName} ${lastName}`,
            role: 'USER'
          }
        });

        // B. Crear Miembro asociado
        const newMember = await prisma.member.create({
          data: {
            firstName, lastName, phone, address, city,
            birthDate: birthDate ? new Date(birthDate) : null,
            userId: newUser.id
          }
        });
        return newMember;
      });

      return res.json(result);
    }

    // CASO 2: Solo datos básicos -> Crear SOLO Miembro (Lógica para el Directorio rápido)
    const simpleMember = await prisma.member.create({
      data: {
        firstName, lastName, phone, address, city,
        birthDate: birthDate ? new Date(birthDate) : null,
        // userId se queda nulo porque no tiene login todavía
      }
    });

    res.json(simpleMember);

  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'El correo electrónico ya existe.' });
    }
    res.status(400).json({ error: 'Error al crear el registro.' });
  }
});

// DELETE: Borrar Miembro (Esto faltaba en tu código)
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    // 1. Borrar referencias (Equipos, Asignaciones)
    // Usamos deleteMany por seguridad, si no hay nada no falla
    await prisma.teamMember.deleteMany({ where: { memberId: id } });
    await prisma.serviceAssignment.deleteMany({ where: { memberId: id } });
    
    // 2. Borrar el Miembro
    await prisma.member.delete({ where: { id } });
    
    // Opcional: Si tenía usuario asociado, podrías borrarlo aquí también,
    // pero por seguridad a veces es mejor dejar el usuario o borrarlo manual.
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'No se pudo eliminar el miembro' });
  }
});

module.exports = router;
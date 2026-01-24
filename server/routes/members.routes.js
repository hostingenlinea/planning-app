const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Obtener todos los miembros
router.get('/', async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      orderBy: { lastName: 'asc' }
    });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener miembros' });
  }
});

// 2. Crear un nuevo miembro
router.post('/', async (req, res) => {
  const { firstName, lastName, phone, email } = req.body;
  try {
    // Opcional: Crear usuario asociado si se requiere login (lo haremos simple por ahora)
    const newMember = await prisma.member.create({
      data: {
        firstName,
        lastName,
        phone,
        // email se guardaría en User si hubiera login, por ahora lo manejamos simple o lo omitimos del modelo básico
      }
    });
    res.json(newMember);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear miembro' });
  }
});

module.exports = router;
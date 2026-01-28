const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // Necesario para encriptar la contraseña
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET: Obtener todos los miembros
router.get('/', async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      orderBy: { lastName: 'asc' },
      include: { user: true } // Incluimos datos del usuario (email) si se necesita
    });
    res.json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener miembros' });
  }
});

// POST: Crear un nuevo Usuario + Miembro
router.post('/', async (req, res) => {
  const { 
    firstName, lastName, phone, address, city, 
    birthDate, email, password 
  } = req.body;

  // Validaciones básicas
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (Email, Contraseña, Nombre).' });
  }

  try {
    // 1. Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Usamos una transacción para crear ambos registros o ninguno si falla
    const result = await prisma.$transaction(async (prisma) => {
      // A. Crear Usuario (Login)
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: `${firstName} ${lastName}`,
          role: 'USER'
        }
      });

      // B. Crear Miembro (Datos Perfil) asociado al usuario
      const newMember = await prisma.member.create({
        data: {
          firstName,
          lastName,
          phone,
          address,
          city,
          // Convertir string de fecha a objeto Date si viene dato
          birthDate: birthDate ? new Date(birthDate) : null,
          userId: newUser.id
        }
      });

      return newMember;
    });

    res.json(result);

  } catch (error) {
    console.error(error);
    // Manejo de error si el email ya existe (código P2002 de Prisma)
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    }
    res.status(400).json({ error: 'Error al crear el registro.' });
  }
});

// GET: Obtener UN miembro por ID con todos sus detalles
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const member = await prisma.member.findUnique({
      where: { id: parseInt(id) },
      include: {
        teams: {
          include: { team: true } // Para ver en qué equipos sirve
        },
        user: true // Para ver su email de acceso si tiene
      }
    });

    if (!member) return res.status(404).json({ error: 'Miembro no encontrado' });
    res.json(member);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

module.exports = router;
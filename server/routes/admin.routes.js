const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// --- ETIQUETAS (LABELS) ---

// GET: Todas las etiquetas disponibles
router.get('/labels', async (req, res) => {
  const labels = await prisma.label.findMany();
  res.json(labels);
});

// POST: Crear nueva etiqueta (Ej: "Bautizado")
router.post('/labels', async (req, res) => {
  try {
    const { name, color } = req.body;
    const label = await prisma.label.create({
      data: { name, color }
    });
    res.json(label);
  } catch (error) {
    res.status(400).json({ error: 'La etiqueta ya existe' });
  }
});

// DELETE: Borrar etiqueta
router.delete('/labels/:id', async (req, res) => {
  await prisma.label.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

// --- GESTIÓN DE MIEMBROS (ROLES Y ETIQUETAS) ---

// GET: Miembros con sus etiquetas para la tabla de admin
router.get('/members', async (req, res) => {
  const members = await prisma.member.findMany({
    include: { labels: true },
    orderBy: { lastName: 'asc' }
  });
  res.json(members);
});

// PUT: Actualizar Rol y Etiquetas de una persona
router.put('/members/:id', async (req, res) => {
  const { id } = req.params;
  const { churchRole, labelIds } = req.body; // labelIds es un array de IDs [1, 2]

  try {
    // Primero desconectamos todas las etiquetas viejas y conectamos las nuevas
    // Es la forma más segura de "actualizar" relaciones en Prisma
    await prisma.member.update({
      where: { id: parseInt(id) },
      data: {
        churchRole: churchRole,
        labels: {
          set: [], // Borra las anteriores
          connect: labelIds.map(lid => ({ id: parseInt(lid) })) // Pone las nuevas
        }
      }
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error al actualizar miembro' });
  }
});

module.exports = router;
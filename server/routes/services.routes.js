const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET: Obtener próximos servicios (y recientes)
router.get('/', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { date: 'desc' }, // Ordenar por fecha (el más nuevo arriba)
      take: 50 // Limitamos a 50 para empezar
    });
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cargar los servicios' });
  }
});

// POST: Crear un nuevo servicio
router.post('/', async (req, res) => {
  const { name, date, type } = req.body;

  if (!name || !date) {
    return res.status(400).json({ error: 'Nombre y fecha son obligatorios' });
  }

  try {
    const newService = await prisma.service.create({
      data: {
        name,
        type: type || 'General',
        // Convertimos el string que envía el frontend a objeto Date real
        date: new Date(date) 
      }
    });
    res.json(newService);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'No se pudo crear el servicio' });
  }
});

module.exports = router;
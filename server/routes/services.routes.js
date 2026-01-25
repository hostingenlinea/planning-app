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

// GET: Obtener un servicio por ID con su cronograma
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const service = await prisma.service.findUnique({
      where: { id: parseInt(id) },
      include: {
        plans: {
          orderBy: { order: 'asc' } // Ordenar ítems por orden de secuencia (1, 2, 3...)
        },
        assignments: {
          include: {
            member: true,
            team: true
          }
        }
      }
    });
    
    if (!service) return res.status(404).json({ error: 'Servicio no encontrado' });
    res.json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el servicio' });
  }
});

// POST: Agregar un ítem al cronograma (Plan)
router.post('/:id/plan', async (req, res) => {
  const { id } = req.params;
  const { title, type, duration, order } = req.body;

  try {
    const newItem = await prisma.servicePlanItem.create({
      data: {
        serviceId: parseInt(id),
        title,
        type,      // SONG, PREACHING, ANNOUNCEMENT, MEDIA
        duration: parseInt(duration) || 0,
        order: parseInt(order) || 1
      }
    });
    res.json(newItem);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error al agregar ítem' });
  }
});

// DELETE: Borrar un ítem del cronograma
router.delete('/plan/:itemId', async (req, res) => {
  const { itemId } = req.params;
  try {
    await prisma.servicePlanItem.delete({
      where: { id: parseInt(itemId) }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Error al eliminar ítem' });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. OBTENER TODOS LOS PLANES
router.get('/', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { date: 'desc' },
      include: { items: true }
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener planes' });
  }
});

// 2. OBTENER UN PLAN DETALLADO
router.get('/:id', async (req, res) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { items: { orderBy: { order: 'asc' } } }
    });
    if (!service) return res.status(404).json({ error: 'Plan no encontrado' });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el detalle' });
  }
});

// 3. CREAR NUEVO PLAN
router.post('/', async (req, res) => {
  const { name, date, leader } = req.body;
  try {
    const newService = await prisma.service.create({
      data: {
        name,
        date: new Date(date),
        leader
      }
    });
    res.json(newService);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el plan' });
  }
});

// 4. ACTUALIZAR PLAN E ÍTEMS (SOLUCIÓN AL ERROR DE GUARDADO)
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, date, leader, items } = req.body;

  try {
    // Usamos una transacción para asegurar que todo se guarde bien o nada
    await prisma.$transaction(async (tx) => {
      
      // A. Actualizar datos del servicio
      await tx.service.update({
        where: { id },
        data: { 
          name, 
          date: new Date(date), 
          leader 
        }
      });

      // B. REEMPLAZO TOTAL DE ÍTEMS
      // 1. Borramos todos los ítems viejos de este servicio
      // (Usamos la relación 'items' que definiste en tu schema.prisma)
      await tx.serviceItem.deleteMany({
        where: { serviceId: id }
      });

      // 2. Creamos los nuevos (así evitamos conflictos de IDs temporales)
      if (items && items.length > 0) {
        await tx.serviceItem.createMany({
          data: items.map((item, index) => ({
            serviceId: id,
            type: item.type,
            title: item.title,
            description: item.description || '',
            duration: item.duration || '5:00',
            order: index // Guardamos el orden visual
          }))
        });
      }
    });

    res.json({ success: true });

  } catch (error) {
    console.error("Error al guardar plan:", error);
    res.status(500).json({ error: 'Error interno al guardar los cambios.' });
  }
});

// 5. ELIMINAR PLAN
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // Borrar ítems primero (por si la cascada no está configurada)
    await prisma.serviceItem.deleteMany({ where: { serviceId: id } });
    await prisma.service.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

module.exports = router;
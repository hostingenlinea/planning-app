const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const normalizeRole = (value) =>
  String(value || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const canManageServices = (rawRole) => {
  const role = normalizeRole(rawRole);
  return ['admin', 'pastor', 'pastora', 'productor'].includes(role);
};

const requireServiceManager = (req, res, next) => {
  const roleFromHeader = req.headers['x-user-role'];

  if (!roleFromHeader) {
    return res.status(401).json({ error: 'Falta contexto de usuario.' });
  }

  if (!canManageServices(roleFromHeader)) {
    return res.status(403).json({ error: 'No tienes permisos para modificar eventos.' });
  }

  next();
};

const toDurationInt = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, Math.floor(value));
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  // Soporta "5" o "5:00"; guardamos minutos como Int
  if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10);

  const mmss = trimmed.match(/^(\d+):(\d{1,2})$/);
  if (!mmss) return null;

  const minutes = parseInt(mmss[1], 10);
  const seconds = parseInt(mmss[2], 10);
  return minutes + Math.floor(seconds / 60);
};

const formatDuration = (value) => {
  if (value === null || value === undefined) return '5:00';
  if (!Number.isFinite(value)) return '5:00';
  return `${value}:00`;
};

const toServiceDto = (service) => ({
  ...service,
  items: (service.plans || [])
    .sort((a, b) => a.order - b.order)
    .map((plan) => ({
      id: plan.id,
      serviceId: plan.serviceId,
      type: plan.type,
      title: plan.title,
      description: '',
      duration: formatDuration(plan.duration),
      order: plan.order,
      resourceId: plan.resourceId || null
    }))
});

// 1. OBTENER TODOS LOS PLANES
router.get('/', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { date: 'desc' },
      include: { plans: { orderBy: { order: 'asc' } } }
    });

    res.json(services.map(toServiceDto));
  } catch (error) {
    console.error('Error al obtener planes:', error);
    res.status(500).json({ error: 'Error al obtener planes' });
  }
});

// 2. OBTENER UN PLAN DETALLADO
router.get('/:id', async (req, res) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: parseInt(req.params.id, 10) },
      include: { plans: { orderBy: { order: 'asc' } } }
    });

    if (!service) return res.status(404).json({ error: 'Plan no encontrado' });
    res.json(toServiceDto(service));
  } catch (error) {
    console.error('Error al obtener detalle:', error);
    res.status(500).json({ error: 'Error al obtener el detalle' });
  }
});

// 3. CREAR NUEVO PLAN
router.post('/', requireServiceManager, async (req, res) => {
  const { name, date, type } = req.body;

  if (!name || !date) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (name, date).' });
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return res.status(400).json({ error: 'Fecha invalida.' });
  }

  try {
    const newService = await prisma.service.create({
      data: {
        name,
        date: parsedDate,
        type: type || 'Culto'
      },
      include: { plans: { orderBy: { order: 'asc' } } }
    });

    res.json(toServiceDto(newService));
  } catch (error) {
    console.error('Error al crear plan:', error);
    res.status(500).json({ error: 'Error al crear el plan' });
  }
});

// 4. ACTUALIZAR PLAN E ITEMS
router.put('/:id', requireServiceManager, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, date, type, items } = req.body;

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return res.status(400).json({ error: 'Fecha invalida.' });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.service.update({
        where: { id },
        data: {
          name,
          date: parsedDate,
          type: type || 'Culto'
        }
      });

      await tx.servicePlanItem.deleteMany({
        where: { serviceId: id }
      });

      if (Array.isArray(items) && items.length > 0) {
        await tx.servicePlanItem.createMany({
          data: items.map((item, index) => ({
            serviceId: id,
            type: item.type || 'GENERIC',
            title: item.title || 'Bloque',
            duration: toDurationInt(item.duration),
            order: index,
            resourceId: item.resourceId || null
          }))
        });
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error al guardar plan:', error);
    res.status(500).json({ error: 'Error interno al guardar los cambios.' });
  }
});

// 5. ELIMINAR PLAN
router.delete('/:id', requireServiceManager, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    await prisma.servicePlanItem.deleteMany({ where: { serviceId: id } });
    await prisma.service.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar plan:', error);
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET: Obtener todos los ministerios con sus equipos
router.get('/', async (req, res) => {
  try {
    const ministries = await prisma.ministry.findMany({
      include: { teams: true },
      orderBy: { name: 'asc' }
    });
    res.json(ministries);
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar ministerios' });
  }
});

// POST: Crear Ministerio
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nombre requerido' });
  
  try {
    const newMinistry = await prisma.ministry.create({ data: { name } });
    res.json(newMinistry);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear ministerio' });
  }
});

// POST: Agregar Equipo a un Ministerio
router.post('/:id/teams', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  
  try {
    const newTeam = await prisma.team.create({
      data: {
        name,
        ministryId: parseInt(id)
      }
    });
    res.json(newTeam);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear equipo' });
  }
});

// DELETE: Borrar Ministerio
router.delete('/:id', async (req, res) => {
  try {
    // Nota: Esto fallará si hay equipos, a menos que configuremos borrado en cascada.
    // Por seguridad, Prisma pide borrar los hijos primero manualmente o configurar Cascade.
    // Para simplificar ahora, asumimos borrado directo si está vacío o configuración DB.
    await prisma.team.deleteMany({ where: { ministryId: parseInt(req.params.id) } }); // Limpiamos equipos primero
    await prisma.ministry.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'No se pudo eliminar' });
  }
});

// DELETE: Borrar Equipo
router.delete('/teams/:teamId', async (req, res) => {
  try {
    await prisma.team.delete({ where: { id: parseInt(req.params.teamId) } });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'No se pudo eliminar el equipo' });
  }
});

module.exports = router;
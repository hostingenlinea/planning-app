const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET: Obtener ministerios con Equipos Y Miembros
router.get('/', async (req, res) => {
  try {
    const ministries = await prisma.ministry.findMany({
      include: { 
        teams: true,
        members: {
          include: { member: true } // Traer nombre y apellido del miembro
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(ministries);
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar ministerios' });
  }
});

// POST: Crear Ministerio (Igual que antes)
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

// POST: Agregar Equipo (Igual que antes)
router.post('/:id/teams', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const newTeam = await prisma.team.create({
      data: { name, ministryId: parseInt(id) }
    });
    res.json(newTeam);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear equipo' });
  }
});

// --- NUEVA RUTA: Agregar MIEMBRO al Ministerio ---
router.post('/:id/members', async (req, res) => {
  const { id } = req.params; // ID del Ministerio
  const { memberId, role } = req.body; // ID de la Persona

  try {
    // Verificar si ya existe para no duplicar
    const exists = await prisma.ministryMember.findFirst({
      where: { ministryId: parseInt(id), memberId: parseInt(memberId) }
    });

    if (exists) {
      return res.status(400).json({ error: 'Esta persona ya está en el ministerio' });
    }

    const newAssignment = await prisma.ministryMember.create({
      data: {
        ministryId: parseInt(id),
        memberId: parseInt(memberId),
        role: role || 'Voluntario'
      },
      include: { member: true }
    });
    res.json(newAssignment);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error al agregar miembro' });
  }
});

// DELETE: Quitar Miembro del Ministerio
router.delete('/members/:id', async (req, res) => {
  try {
    await prisma.ministryMember.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'No se pudo quitar al miembro' });
  }
});

// DELETE: Borrar Ministerio (Con limpieza de dependencias)
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    // Usar transacción para borrar todo lo relacionado primero
    await prisma.$transaction([
      prisma.team.deleteMany({ where: { ministryId: id } }),
      prisma.ministryMember.deleteMany({ where: { ministryId: id } }),
      prisma.ministry.delete({ where: { id: id } })
    ]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'No se pudo eliminar el ministerio' });
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
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET: Ministerios -> Equipos -> Miembros (Vital para la Planificación)
router.get('/', async (req, res) => {
  try {
    const ministries = await prisma.ministry.findMany({
      include: { 
        teams: {
          include: {
            members: {
              include: { member: true } // Traemos los nombres de las personas
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(ministries);
  } catch (error) {
    console.error("Error cargando ministerios:", error);
    res.status(500).json({ error: 'Error al cargar datos' });
  }
});

// POST: Crear Ministerio
router.post('/', async (req, res) => {
  const { name } = req.body;
  try {
    const newMinistry = await prisma.ministry.create({ data: { name } });
    res.json(newMinistry);
  } catch (error) { res.status(400).json({ error: 'Error al crear' }); }
});

// POST: Crear Equipo
router.post('/:id/teams', async (req, res) => {
  const { name } = req.body;
  try {
    const newTeam = await prisma.team.create({
      data: { name, ministryId: parseInt(req.params.id) }
    });
    res.json(newTeam);
  } catch (error) { res.status(400).json({ error: 'Error al crear equipo' }); }
});

// POST: Agregar Persona a un EQUIPO
router.post('/teams/:teamId/members', async (req, res) => {
  const { teamId } = req.params;
  const { memberId } = req.body;

  try {
    const newMember = await prisma.teamMember.create({
      data: {
        teamId: parseInt(teamId),
        memberId: parseInt(memberId)
      },
      include: { member: true }
    });
    res.json(newMember);
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Ya existe en el equipo.' });
    res.status(400).json({ error: 'Error al agregar' });
  }
});

// DELETE: Quitar Persona del Equipo
router.delete('/teams/members/:id', async (req, res) => {
  try {
    await prisma.teamMember.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) { res.status(400).json({ error: 'Error al quitar miembro' }); }
});

// DELETE: Borrar Equipo
router.delete('/teams/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.teamMember.deleteMany({ where: { teamId: id } });
    await prisma.team.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) { res.status(400).json({ error: 'Error al borrar equipo' }); }
});

// DELETE: Borrar Ministerio
router.delete('/:id', async (req, res) => {
  try {
    const ministryId = parseInt(req.params.id);
    const teams = await prisma.team.findMany({ where: { ministryId } });
    const teamIds = teams.map(t => t.id);

    if (teamIds.length > 0) {
      await prisma.teamMember.deleteMany({ where: { teamId: { in: teamIds } } });
      await prisma.team.deleteMany({ where: { ministryId } });
    }
    await prisma.ministry.delete({ where: { id: ministryId } });
    res.json({ success: true });
  } catch (error) { res.status(400).json({ error: 'Error al borrar' }); }
});

module.exports = router;
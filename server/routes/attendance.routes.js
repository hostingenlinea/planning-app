const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET: Ver últimas asistencias (para la pantalla de recepción)
router.get('/', async (req, res) => {
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const list = await prisma.attendance.findMany({
    where: { date: { gte: today } }, // Solo las de hoy
    include: { member: true },
    orderBy: { date: 'desc' },
    take: 20
  });
  res.json(list);
});

// POST: Registrar Presente (Scan)
router.post('/', async (req, res) => {
  const { memberId } = req.body; // Recibimos el ID del QR

  try {
    // Verificar si existe el miembro
    const member = await prisma.member.findUnique({ where: { id: parseInt(memberId) } });
    if (!member) return res.status(404).json({ error: 'Miembro no encontrado' });

    // Registrar asistencia
    const attendance = await prisma.attendance.create({
      data: { memberId: parseInt(memberId) }
    });

    // Devolver datos del miembro para mostrar "¡Bienvenido Juan!"
    res.json({ success: true, member, attendance });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar' });
  }
});

module.exports = router;
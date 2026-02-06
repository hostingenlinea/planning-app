const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const { sendBirthdayEmail } = require('../config/mailer');
const prisma = new PrismaClient();

const initBirthdayCron = () => {
  // Ejecutar todos los días a las 08:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Ejecutando revisión diaria de cumpleaños...');
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    try {
      const members = await prisma.member.findMany({
        where: {
          NOT: { birthDate: null },
          NOT: { email: null }
        },
        select: { email: true, firstName: true, birthDate: true }
      });

      const birthdayBoys = members.filter(m => {
        const d = new Date(m.birthDate);
        return d.getMonth() === currentMonth && d.getDate() === currentDay;
      });

      if (birthdayBoys.length > 0) {
        console.log(`🎉 Hoy cumplen años ${birthdayBoys.length} personas.`);
        for (const member of birthdayBoys) {
          if (member.email) {
            await sendBirthdayEmail(member.email, member.firstName);
          }
        }
      } else {
        console.log('📅 Hoy no hay cumpleaños.');
      }

    } catch (error) {
      console.error('Error en cron de cumpleaños:', error);
    }
  });
};

module.exports = initBirthdayCron;
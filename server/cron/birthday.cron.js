const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const { sendBirthdayEmail } = require('../config/mailer');
const { sendBirthdayWhatsApp } = require('../config/whatsapp'); // <--- IMPORTAR
const prisma = new PrismaClient();

const initBirthdayCron = () => {
  // Ejecutar todos los días a las 09:00 AM (Hora un poco más tarde es mejor)
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Revisando cumpleaños del día...');
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    try {
      const members = await prisma.member.findMany({
        where: { NOT: { birthDate: null } },
        select: { email: true, firstName: true, birthDate: true, phone: true }
      });

      const birthdayBoys = members.filter(m => {
        const d = new Date(m.birthDate);
        return d.getMonth() === currentMonth && d.getDate() === currentDay;
      });

      if (birthdayBoys.length > 0) {
        console.log(`🎉 Hoy hay ${birthdayBoys.length} cumpleaños.`);
        
        for (const member of birthdayBoys) {
          if (member.email) await sendBirthdayEmail(member.email, member.firstName);
          if (member.phone) await sendBirthdayWhatsApp(member.phone, member.firstName);
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
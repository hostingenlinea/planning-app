const nodemailer = require('nodemailer');

// Configuración del transporte (usando Gmail como ejemplo)
// NOTA: Si usas Gmail, debes crear una "Contraseña de Aplicación" en tu cuenta de Google.
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, // Tu email (ej: mdsq.app@gmail.com)
    pass: process.env.EMAIL_PASS  // Tu contraseña de aplicación
  }
});

// Función para enviar credenciales de bienvenida
const sendWelcomeEmail = async (email, name, password) => {
  try {
    await transporter.sendMail({
      from: '"MDSQ App" <no-reply@mdsq.app>',
      to: email,
      subject: 'Bienvenido al equipo MDSQ 🚀',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #1e3a8a; padding: 20px; text-align: center; color: white;">
            <h1>¡Bienvenido, ${name}!</h1>
          </div>
          <div style="padding: 20px;">
            <p>Nos alegra mucho que te unas al equipo. Aquí tienes tus credenciales para acceder a la plataforma:</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;">📧 <strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0;">🔑 <strong>Contraseña:</strong> ${password}</p>
            </div>
            <p>Por favor, ingresa y cambia tu contraseña y foto de perfil en la sección "Mis Datos".</p>
            <a href="https://mdsq.hcloud.one/login" style="display: inline-block; background-color: #1e3a8a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Ir a la App</a>
          </div>
        </div>
      `
    });
    console.log(`📧 Email de bienvenida enviado a ${email}`);
  } catch (error) {
    console.error('❌ Error enviando email de bienvenida:', error);
  }
};

// Función para enviar saludo de cumpleaños
const sendBirthdayEmail = async (email, name) => {
  try {
    await transporter.sendMail({
      from: '"Familia MDSQ" <no-reply@mdsq.app>',
      to: email,
      subject: '¡Feliz Cumpleaños! 🎂',
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #db2777;">¡Feliz Cumpleaños, ${name}! 🎉</h1>
          <p style="font-size: 18px; color: #555;">Hoy celebramos tu vida y agradecemos a Dios por tenerte en nuestro equipo.</p>
          <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDdtY254YmF5dXlpYnZ6YmF5dXlpYnZ6/l4KibWpBGWchSqCRy/giphy.gif" alt="Fiesta" style="width: 100%; max-width: 300px; border-radius: 10px; margin: 20px 0;">
          <p>¡Que tengas un día increíble lleno de bendiciones!</p>
          <p style="font-weight: bold;">- El equipo de MDSQ</p>
        </div>
      `
    });
    console.log(`🎂 Email de cumpleaños enviado a ${name}`);
  } catch (error) {
    console.error('❌ Error enviando email de cumpleaños:', error);
  }
};

module.exports = { sendWelcomeEmail, sendBirthdayEmail };
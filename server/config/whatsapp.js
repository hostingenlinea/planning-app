const axios = require('axios');

// Configuración para 360Messenger
const WA_API_URL = 'https://api.360messenger.com/v2';
const WA_TOKEN = process.env.WA_API_KEY; // Tu Token de 360Messenger

const sendWhatsAppMessage = async (phone, text) => {
  if (!WA_TOKEN) {
    console.log('⚠️ WhatsApp no configurado (Falta WA_API_KEY). Mensaje omitido.');
    return;
  }

  try {
    // Limpieza del número (360Messenger suele requerir el número limpio con código país)
    // Ejemplo: 5491122334455
    const cleanPhone = phone.replace(/\D/g, ''); 

    const payload = {
      to: cleanPhone,
      type: "text",
      text: {
        body: text
      }
    };

    // Según su documentación v2
    const res = await axios.post(`${WA_API_URL}/message/send`, payload, {
      headers: {
        'token': WA_TOKEN, // Usualmente es 'token' o 'apikey' en 360Messenger
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ WhatsApp enviado a ${cleanPhone}`);
    return res.data;

  } catch (error) {
    console.error('❌ Error enviando WhatsApp:', error.response?.data || error.message);
  }
};

// --- MENSAJES PERSONALIZADOS ---

// 1. Bienvenida (Estilo Iglesia)
const sendWelcomeWhatsApp = async (phone, name, email, password) => {
  const message = `¡Bendiciones ${name}! 🙌
  
Nos llena de alegría darte la bienvenida a la familia MDSQ. Es un honor servir juntos.

Aquí tienes tus credenciales para acceder a nuestra App de gestión:
📧 *Email:* ${email}
🔑 *Clave:* ${password}

Puedes ingresar aquí: https://mdsq.hcloud.one/login

¡Oramos para que esta herramienta sea de gran bendición en tu servicio! 🙏`;

  await sendWhatsAppMessage(phone, message);
};

// 2. Cumpleaños (Estilo Iglesia)
const sendBirthdayWhatsApp = async (phone, name) => {
  const message = `¡Feliz Cumpleaños ${name}! 🎂🎉

Damos gracias a Dios por tu vida en este día especial. Que Su gracia y favor te sigan acompañando en este nuevo año.

"Jehová te bendiga, y te guarde; Jehová haga resplandecer su rostro sobre ti." - Números 6:24

¡Te amamos y celebramos tu vida!
- Familia MDSQ`;

  await sendWhatsAppMessage(phone, message);
};

module.exports = { sendWelcomeWhatsApp, sendBirthdayWhatsApp };
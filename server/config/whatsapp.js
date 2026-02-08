const axios = require('axios');

// Variables de entorno (Coolify o .env en local)
const WA_API_URL = process.env.WA_API_URL; // ej: https://api.360messenger.com
const WA_TOKEN = process.env.WA_API_KEY;

// ===============================
// FUNCIÓN BASE DE ENVÍO
// ===============================
const sendWhatsAppMessage = async (phone, text) => {
  if (!WA_API_URL || !WA_TOKEN) {
    console.log('⚠️ Faltan credenciales de WhatsApp (WA_API_URL / WA_API_KEY).');
    return;
  }

  try {
    // Limpieza de teléfono (Argentina → 549)
    let cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length === 10) {
      cleanPhone = '549' + cleanPhone;
    } else if (cleanPhone.startsWith('54') && !cleanPhone.startsWith('549')) {
      cleanPhone = '549' + cleanPhone.slice(2);
    }

    // 👉 PAYLOAD CORRECTO PARA 360MESSENGER
    const payload = {
      to: cleanPhone,
      body: text
    };

    const url = `${WA_API_URL}/v2/sendMessage`;

    // 🔍 LOGS CLAROS (para debug)
    console.log('📤 Enviando WhatsApp');
    console.log('URL:', url);
    console.log('TELÉFONO:', cleanPhone);
    console.log('MENSAJE:\n', text);

    const res = await axios.post(url, payload, {
      headers: {
        apikey: WA_TOKEN, // 🔑 HEADER CORRECTO
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ WhatsApp enviado correctamente a ${cleanPhone}`);
    return res.data;

  } catch (error) {
    console.error('❌ Error WhatsApp URL:', `${WA_API_URL}/v2/sendMessage`);
    console.error('❌ Detalle:', error.response?.data || error.message);
  }
};

// ===============================
// MENSAJE DE BIENVENIDA
// ===============================
const sendWelcomeWhatsApp = async (phone, name, email, password) => {
  const message = `¡Bendiciones ${name}! 🙌

Bienvenido a la familia MDSQ.

Tus credenciales:
📧 Email: ${email}
🔑 Clave: ${password}

Ingresa en:
https://mdsq.hcloud.one/login`;

  await sendWhatsAppMessage(phone, message);
};

// ===============================
// MENSAJE DE CUMPLEAÑOS
// ===============================
const sendBirthdayWhatsApp = async (phone, name) => {
  const message = `¡Feliz Cumpleaños ${name}! 🎂🎉

Damos gracias a Dios por tu vida.
¡Que tengas un día bendecido!

- Familia MDSQ`;

  await sendWhatsAppMessage(phone, message);
};

module.exports = {
  sendWelcomeWhatsApp,
  sendBirthdayWhatsApp
};

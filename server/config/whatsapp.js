const axios = require('axios');

// CONFIGURACIÓN 
// Si tienes una URL específica en tu dashboard, úsala. Si no, esta es la estándar WABA.
const WA_API_URL = process.env.WA_API_URL || 'https://waba.360messenger.com/v1'; 
const WA_TOKEN = process.env.WA_API_KEY;

const sendWhatsAppMessage = async (phone, text) => {
  if (!WA_TOKEN) {
    console.log('⚠️ Faltan credenciales de WhatsApp (WA_API_KEY).');
    return;
  }

  try {
    // 1. LIMPIEZA DE TELÉFONO
    // Quitamos caracteres no numéricos
    let cleanPhone = phone.replace(/\D/g, ''); 

    // Lógica Argentina (Asegurar 549)
    if (cleanPhone.length === 10) { // Ej: 1122334455 -> 5491122334455
        cleanPhone = '+549' + cleanPhone;
    } else if (cleanPhone.length === 12 && cleanPhone.startsWith('+54')) { // Ej: 5411... -> 54911...
        cleanPhone = '+549' + cleanPhone.slice(2);
    }

    // 2. PAYLOAD (Estructura Estándar de WhatsApp Cloud API / 360)
    const payload = {
      recipient_type: "individual",
      to: cleanPhone,
      type: "text",
      text: {
        body: text
      }
    };

    console.log(`📡 Enviando a: ${WA_API_URL}/messages`);
    
    // 3. PETICIÓN (Probamos con el header 'apikey')
    const res = await axios.post(`${WA_API_URL}/messages`, payload, {
      headers: {
        'apikey': WA_TOKEN, // <--- CAMBIO CLAVE: Usualmente es 'apikey' o 'D360-API-KEY'
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ WhatsApp enviado a ${cleanPhone}`);
    return res.data;

  } catch (error) {
    console.error('❌ Error enviando WhatsApp:');
    if (error.response) {
      // El servidor respondió con error
      console.error(`Status: ${error.response.status} - ${error.response.statusText}`);
      console.error('Data:', error.response.data);
      
      if (error.response.status === 403) {
        console.error('👉 CAUSA 403: Tu API Key es incorrecta o el Header no es "apikey".');
        console.error('👉 REVISAR: Verifica que WA_API_KEY en Coolify sea correcta.');
      }
    } else {
      console.error(error.message);
    }
  }
};

// --- MENSAJES ---

const sendWelcomeWhatsApp = async (phone, name, email, password) => {
  const message = `¡Bendiciones ${name}! 🙌
  
Bienvenido a la familia MDSQ.
Tus credenciales:
📧 Email: ${email}
🔑 Clave: ${password}
  
Ingresa en: https://mdsq.hcloud.one/login`;

  await sendWhatsAppMessage(phone, message);
};

const sendBirthdayWhatsApp = async (phone, name) => {
  const message = `¡Feliz Cumpleaños ${name}! 🎂🎉
  
Damos gracias a Dios por tu vida. ¡Que tengas un día bendecido!
- Familia MDSQ`;

  await sendWhatsAppMessage(phone, message);
};

module.exports = { sendWelcomeWhatsApp, sendBirthdayWhatsApp };
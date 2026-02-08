const axios = require('axios');

// AJUSTE 1: URL Base Correcta según tu documentación (v2)
// Si esta falla, prueba con 'https://waba-v2.360messenger.com' o quita el '/v2' de aquí y ponlo abajo.
const WA_API_URL = process.env.WA_API_BASE; 
const WA_TOKEN = process.env.WA_API_KEY;

const sendWhatsAppMessage = async (phone, text) => {
  if (!WA_TOKEN) {
    console.log('⚠️ Faltan credenciales de WhatsApp.');
    return;
  }

  try {
    // AJUSTE 2: Limpieza de teléfono para Argentina (549...)
    // Quitamos el '+' y cualquier espacio
    let cleanPhone = phone.replace(/\D/g, ''); 

    // Si el número viene como "1122334455" (sin 54), le agregamos el 549
    if (cleanPhone.length === 10) {
        cleanPhone = '549' + cleanPhone;
    } 
    // Si viene como "5411..." (sin el 9), a veces es necesario el 9 para WhatsApp
    else if (cleanPhone.startsWith('54') && !cleanPhone.startsWith('549')) {
        cleanPhone = '549' + cleanPhone.slice(2);
    }

    // Configuración del envío
    const payload = {
      to: cleanPhone,
      type: "text",
      text: {
        body: text
      }
    };

    // Petición AXIOS
    const res = await axios.post(`${WA_API_URL}/v2/sendMessage`, payload, {
      headers: {
        'token': WA_TOKEN, // Tu docu dice 'token', a veces es 'apikey'
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ WhatsApp enviado a ${cleanPhone}`);
    return res.data;

  } catch (error) {
    // Mejor manejo de errores para ver qué pasa
    console.error('❌ Error WhatsApp URL:', `${WA_API_URL}/v2/sendMessage`);
    console.error('❌ Detalle:', error.response?.data || error.message);
  }
};

// ... (El resto de las funciones sendWelcomeWhatsApp y sendBirthdayWhatsApp quedan IGUAL) ...
// Copia las funciones de abajo del archivo anterior
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
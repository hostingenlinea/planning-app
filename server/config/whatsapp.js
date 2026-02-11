const axios = require('axios');

// Base URL de 360Messenger (sin slash final)
// Ejemplo recomendado: https://api.360messenger.com/v2
const WA_API_URL = (process.env.WA_API_URL || 'https://api.360messenger.com/v2').replace(/\/+$/, '');
const WA_TOKEN = process.env.WA_API_KEY;

// Endpoint configurable para soportar variantes de cuenta/proveedor
// Ejemplos: /sendMessage, /messages
const WA_SEND_PATH = process.env.WA_SEND_PATH || '/sendMessage';

// Estrategia de auth configurable
// bearer -> Authorization: Bearer <token>
// apikey -> apikey: <token>
// d360   -> D360-API-KEY: <token>
const WA_AUTH_MODE = (process.env.WA_AUTH_MODE || 'bearer').toLowerCase();

const buildHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (!WA_TOKEN) return headers;

  if (WA_AUTH_MODE === 'apikey') {
    headers.apikey = WA_TOKEN;
  } else if (WA_AUTH_MODE === 'd360') {
    headers['D360-API-KEY'] = WA_TOKEN;
  } else {
    headers.Authorization = `Bearer ${WA_TOKEN}`;
  }

  return headers;
};

const normalizePhone = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');

  // Si llega 11 + 8 digitos (10 digitos total) asumimos AR y agregamos 549
  // 1122334455 -> 5491122334455
  if (digits.length === 10) {
    return `549${digits}`;
  }

  // Si llega 54 + 10 digitos (12 total), forzamos 549 + 10 digitos
  // 541122334455 -> 5491122334455
  if (digits.length === 12 && digits.startsWith('54')) {
    return `549${digits.slice(2)}`;
  }

  return digits;
};

const sendWhatsAppMessage = async (phone, text) => {
  if (!WA_TOKEN) {
    console.log('Faltan credenciales de WhatsApp (WA_API_KEY).');
    return;
  }

  const cleanPhone = normalizePhone(phone);
  const sendUrl = `${WA_API_URL}${WA_SEND_PATH.startsWith('/') ? WA_SEND_PATH : `/${WA_SEND_PATH}`}`;

  // Payload default para 360Messenger v2 (/sendMessage)
  const payload = {
    phonenumber: cleanPhone,
    message: text
  };

  try {
    console.log(`Enviando WhatsApp a: ${sendUrl}`);

    const res = await axios.post(sendUrl, payload, {
      headers: buildHeaders(),
      timeout: 15000
    });

    console.log(`WhatsApp enviado a ${cleanPhone}`);
    return res.data;
  } catch (error) {
    console.error('Error enviando WhatsApp:');

    if (error.response) {
      console.error(`Status: ${error.response.status} - ${error.response.statusText}`);
      console.error('Data:', error.response.data);

      if (error.response.status === 404) {
        console.error('Diagnostico 404: revisa WA_API_URL y WA_SEND_PATH en entorno.');
      }

      if (error.response.status === 401 || error.response.status === 403) {
        console.error('Diagnostico auth: revisa WA_API_KEY y WA_AUTH_MODE (bearer/apikey/d360).');
      }
    } else {
      console.error(error.message);
    }

    throw error;
  }
};

const sendWelcomeWhatsApp = async (phone, name, email, password) => {
  const message = `Bendiciones ${name}!

Bienvenido a la familia MDSQ.
Tus credenciales:
Email: ${email}
Clave: ${password}

Ingresa en: https://mdsq.hcloud.one/login`;

  await sendWhatsAppMessage(phone, message);
};

const sendBirthdayWhatsApp = async (phone, name) => {
  const message = `Feliz Cumpleanos ${name}!

Damos gracias a Dios por tu vida. Que tengas un dia bendecido!
- Familia MDSQ`;

  await sendWhatsAppMessage(phone, message);
};

module.exports = { sendWelcomeWhatsApp, sendBirthdayWhatsApp };

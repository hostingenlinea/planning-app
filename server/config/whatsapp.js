const axios = require('axios');

// Modos soportados:
// - legacy: https://api.360messenger.com/sendMessage/{apikey} + form fields (phonenumber,text)
// - v2:     endpoint/header definidos por entorno (mantenido como opcion)
const WA_MODE = (process.env.WA_MODE || 'legacy').toLowerCase();

const WA_TOKEN = process.env.WA_API_KEY;

const WA_API_URL = (
  process.env.WA_API_URL ||
  (WA_MODE === 'legacy' ? 'https://api.360messenger.com' : 'https://api.360messenger.com/v2')
).replace(/\/+$/, '');

const WA_SEND_PATH = process.env.WA_SEND_PATH || (WA_MODE === 'legacy' ? '/sendMessage' : '/sendMessage');
const WA_AUTH_MODE = (process.env.WA_AUTH_MODE || (WA_MODE === 'legacy' ? 'apikey_url' : 'bearer')).toLowerCase();

const buildHeaders = () => {
  const headers = {};

  if (WA_MODE === 'legacy') {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
  } else {
    headers['Content-Type'] = 'application/json';
  }

  if (!WA_TOKEN) return headers;

  if (WA_AUTH_MODE === 'apikey') {
    headers.apikey = WA_TOKEN;
  } else if (WA_AUTH_MODE === 'd360') {
    headers['D360-API-KEY'] = WA_TOKEN;
  } else if (WA_AUTH_MODE === 'bearer') {
    headers.Authorization = `Bearer ${WA_TOKEN}`;
  }

  return headers;
};

const buildSendUrl = () => {
  const path = WA_SEND_PATH.startsWith('/') ? WA_SEND_PATH : `/${WA_SEND_PATH}`;

  // Formato documentado en guia oficial:
  // https://api.360messenger.com/sendMessage/apikey
  if (WA_AUTH_MODE === 'apikey_url') {
    return `${WA_API_URL}${path}/${WA_TOKEN}`;
  }

  return `${WA_API_URL}${path}`;
};

const normalizePhone = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');

  // AR local (10 digitos) -> 549 + numero
  if (digits.length === 10) {
    return `549${digits}`;
  }

  // AR con prefijo 54 + 10 digitos -> forzar 549 + 10 digitos
  if (digits.length === 12 && digits.startsWith('54')) {
    return `549${digits.slice(2)}`;
  }

  return digits;
};

const buildPayload = (phone, text) => {
  const cleanPhone = normalizePhone(phone);

  if (WA_MODE === 'legacy') {
    // Guia oficial usa campo "text" (no "message")
    return new URLSearchParams({
      phonenumber: cleanPhone,
      text
    });
  }

  // Variante v2 no oficializada en este repo, mantenida por compatibilidad
  return {
    phonenumber: cleanPhone,
    message: text
  };
};

const sendWhatsAppMessage = async (phone, text) => {
  if (!WA_TOKEN) {
    console.log('Faltan credenciales de WhatsApp (WA_API_KEY).');
    return;
  }

  const sendUrl = buildSendUrl();
  const payload = buildPayload(phone, text);

  try {
    console.log(`Enviando WhatsApp a: ${sendUrl}`);

    const res = await axios.post(sendUrl, payload, {
      headers: buildHeaders(),
      timeout: 15000
    });

    console.log(`WhatsApp enviado a ${normalizePhone(phone)}`);
    return res.data;
  } catch (error) {
    console.error('Error enviando WhatsApp:');

    if (error.response) {
      console.error(`Status: ${error.response.status} - ${error.response.statusText}`);
      console.error('Data:', error.response.data);

      if (error.response.status === 400) {
        console.error('Diagnostico 400: revisa formato de payload, numero y modo (legacy/v2).');
      }

      if (error.response.status === 404) {
        console.error('Diagnostico 404: revisa WA_API_URL y WA_SEND_PATH en entorno.');
      }

      if (error.response.status === 401 || error.response.status === 403) {
        console.error('Diagnostico auth: revisa WA_API_KEY y WA_AUTH_MODE.');
      }
    } else {
      console.error(error.message);
    }

    throw error;
  }
};

const sendWelcomeWhatsApp = async (phone, name, email, password) => {
  const message = `Hola ${name}, bendiciones!

Nos alegra mucho darte la bienvenida a la familia de la Iglesia MDS Quilmes.
Oramos para que este nuevo tiempo sea de crecimiento, fe y prop\u00F3sito.

Tus datos de acceso fueron enviados a tu correo.
Si no los encontr\u00E1s, revis\u00E1 la carpeta de spam o escribinos.

Pod\u00E9s ingresar desde:
https://mdsq.hcloud.one/login`;

  await sendWhatsAppMessage(phone, message);
};

const sendBirthdayWhatsApp = async (phone, name) => {
  const message = `Feliz cumplea\u00F1os, ${name}!\n\nHoy damos gracias a Dios por tu vida y por todo lo que \u00C9l hace en vos.\nOramos para que este nuevo a\u00F1o este lleno de paz, salud, amor y prop\u00F3sito.\n\nTe abrazamos con mucho cari\u00F1o.\n- Familia MDSQ`;

  await sendWhatsAppMessage(phone, message);
};

module.exports = { sendWelcomeWhatsApp, sendBirthdayWhatsApp };




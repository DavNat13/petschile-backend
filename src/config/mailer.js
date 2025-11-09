// src/config/mailer.js
import sgMail from '@sendgrid/mail';

/**
 * --- INICIALIZACIÓN DEL SERVICIO DE CORREO ---
 * * Verificamos si la API Key de SendGrid está presente en las variables de entorno.
 * Si no está, la aplicación no podrá enviar correos, por lo que lanzamos
 * un error fatal para detener el servidor e informar del problema.
 */
if (!process.env.SENDGRID_API_KEY) {
  console.error("FATAL ERROR: SENDGRID_API_KEY no está definida en .env");
  // Detenemos la aplicación si la variable crítica falta
  process.exit(1); 
}

// Seteamos la API key globalmente en el módulo de SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

console.log('📧 Servicio de Correo (SendGrid) configurado y listo.');

/**
 * --- FUNCIÓN GENÉRICA PARA ENVIAR CORREOS ---
 * * Envía un correo electrónico utilizando SendGrid.
 * Está diseñada para ser llamada desde cualquier servicio (ej: contactService).
 * * @param {object} mailOptions - Opciones del correo.
 * @param {string} mailOptions.to - Email del destinatario.
 * @param {string} mailOptions.subject - Asunto del correo.
 * @param {string} mailOptions.html - Contenido HTML del correo.
 */
export const sendEmail = async (mailOptions) => {
  
  // 1. Verificación de argumentos básicos
  if (!mailOptions || !mailOptions.to || !mailOptions.subject || !mailOptions.html) {
    console.error("Error en 'sendEmail': Faltan opciones de correo (to, subject, html).");
    // Lanzamos un error para que el servicio que la llamó lo sepa
    throw new Error("Argumentos inválidos para 'sendEmail'.");
  }

  // 2. Construcción del mensaje (formato SendGrid)
  // Usamos el 'EMAIL_USER' del .env como el correo verificado en SendGrid
  const msg = {
    to: mailOptions.to,
    from: {
      name: 'Equipo de Pets Chile', // El nombre que verá el destinatario
      email: process.env.EMAIL_USER, // El "Single Sender" verificado en SendGrid
    },
    subject: mailOptions.subject,
    html: mailOptions.html,
    // (Opcional) Podemos agregar una versión de texto plano por seguridad
    // text: mailOptions.text || 'Por favor, mira este correo en un cliente compatible con HTML.',
  };

  // 3. Intento de envío con manejo de errores robusto
  try {
    
    // Enviamos el correo
    await sgMail.send(msg);

    // (Opcional) Loguear éxito en modo de desarrollo
    // console.log(`Correo enviado exitosamente a ${msg.to} con asunto: ${msg.subject}`);

  } catch (error) {
    
    // --- Manejo de Errores de SendGrid ---
    // Si el error viene de la API de SendGrid, tendrá detalles útiles.
    if (error.response) {
      // 'error.response.body' contiene la respuesta JSON de SendGrid
      console.error("Error desde la API de SendGrid:", JSON.stringify(error.response.body, null, 2));
    } else {
      // Si es un error de red o de otro tipo
      console.error("Error al enviar el correo (no es de SendGrid):", error.message);
    }

    // --- IMPORTANTE: Lanzar el error de nuevo ---
    // Esto es crucial para que el servicio que llamó a esta función 
    // (ej: contactService.replyToRequest) detenga su ejecución 
    // y no actualice la base de datos ni envíe un '200 OK' al frontend.
    // El 'catch' en el controlador capturará este error y enviará un '500'.
    throw new Error('El servicio de correo falló al intentar enviar el mensaje.');
  }
};
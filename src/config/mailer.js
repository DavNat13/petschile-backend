// src/config/mailer.js
import nodemailer from 'nodemailer';

// 1. Creamos el "Transportador" (El servicio que envía el correo)
// (Usamos Gmail como ejemplo, pero puedes cambiarlo por SendGrid, etc.)
export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // Puerto seguro
  secure: true, // true para 465, false para otros (como 587)
  auth: {
    user: process.env.EMAIL_USER, // Tu email (del .env)
    pass: process.env.EMAIL_PASS, // Tu contraseña de aplicación (del .env)
  },
});

// 2. Verificamos que la conexión funcione al iniciar
transporter.verify()
  .then(() => {
    console.log('📧 Nodemailer está listo para enviar correos.');
  })
  .catch(console.error);

/**
 * Función genérica para enviar correos
 * @param {object} mailOptions - Opciones (from, to, subject, html)
 */
export const sendEmail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    // No lanzamos un error fatal, solo lo logueamos
  }
};
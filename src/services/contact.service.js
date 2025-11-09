// src/services/contact.service.js
import { prisma } from '../config/prisma.js';
import { sendEmail } from '../config/mailer.js'; 
import { auditService } from './audit.service.js'; 

export const contactService = {
  findAll: async (status) => {
    const whereClause = {};

    if (status) {
      // Si se pide un estado específico (ej: "ARCHIVADO"), lo filtramos
      whereClause.estado = status;
    } else {
      // Por defecto (si no hay filtro), ocultamos los archivados
      whereClause.NOT = {
        estado: 'ARCHIVADO'
      };
    }

    return await prisma.contactRequest.findMany({
      where: whereClause,
      orderBy: { fecha: 'desc' }
    });
  },

  findOne: async (id) => {
    return await prisma.contactRequest.findUnique({
      where: { id },
    });
  },

  create: async (data) => await prisma.contactRequest.create({ data }),
  
  updateStatus: async (id, status) => {
    return await prisma.contactRequest.update({
      where: { id },
      data: { estado: status },
    });
  },
  
  remove: async (id) => await prisma.contactRequest.delete({ where: { id } }),

  // (Función 'replyToRequest' no cambia)
  replyToRequest: async (id, replyText, adminUser) => {
    // 1. Encontrar la solicitud original
    const request = await prisma.contactRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new Error('Solicitud no encontrada.');
    }

    // 2. Definir el contenido del correo
    const mailOptions = {
      from: `"Equipo de Pets Chile" <${process.env.EMAIL_USER}>`,
      to: request.email, // Email del cliente
      subject: `Respuesta a tu solicitud: "${request.asunto}"`,
      html: `
        <p>Hola ${request.nombre},</p>
        <p>Gracias por contactarnos. Aquí tienes la respuesta a tu solicitud sobre "${request.asunto}":</p>
        
        <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
          <p style="white-space: pre-wrap;">${replyText}</p>
        </div>
        
        <hr>
        <p><strong>Mensaje original:</strong></p>
        <blockquote style="border-left: 2px solid #ccc; padding-left: 10px; margin-left: 5px; color: #555;">
          <p style="white-space: pre-wrap;">${request.mensaje}</p>
        </blockquote>
        
        <p>Saludos,<br>El equipo de Pets Chile</p>
      `
    };

    // 3. Enviar el correo
    await sendEmail(mailOptions);

    // 4. Actualizar el estado de la solicitud en la BD
    const updatedRequest = await prisma.contactRequest.update({
      where: { id },
      data: { estado: 'Respondido' },
    });

    // 5. Registrar en la auditoría
    await auditService.createLog(
      adminUser.id,
      'CONTACT_REPLY',
      'ContactRequest',
      id,
      { 
        old: { estado: request.estado }, 
        new: { estado: 'Respondido' },
        reply: replyText // Guardamos la respuesta en el log
      }
    );

    return updatedRequest;
  }
};
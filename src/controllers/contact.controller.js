// src/controllers/contact.controller.js
import { contactService } from '../services/contact.service.js';
import { auditService } from '../services/audit.service.js';

export const contactController = {
  // Ruta pública (sin cambios)
  create: async (req, res) => {
    try {
      const newRequest = await contactService.create(req.body);
      res.status(201).json(newRequest);
    } catch (e) { res.status(500).json({ message: e.message }); }
  },

  // --- Rutas de Admin/Vendedor ---
  getAll: async (req, res) => {
    try {
      // Leemos el filtro de estado desde la URL (ej: /api/contact?status=Pendiente)
      const { status } = req.query;
      const requests = await contactService.findAll(status); // Pasamos el filtro al servicio
      res.status(200).json(requests);
    } catch (e) { res.status(500).json({ message: e.message }); }
  },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const oldRequest = await contactService.findOne(id); 
      const updated = await contactService.updateStatus(id, status);

      // Creamos un log de auditoría genérico para cualquier cambio de estado
      // (Esto funcionará para "Respondido", "Cerrado" y "Archivado")
      await auditService.createLog(
        req.user.id,
        'CONTACT_STATUS_UPDATE',
        'ContactRequest',
        updated.id,
        { old: { estado: oldRequest?.estado }, new: { estado: updated.estado } }
      );

      res.status(200).json(updated);
    } catch (e) { res.status(500).json({ message: e.message }); }
  },

  remove: async (req, res) => {
    try {
      const { id } = req.params;
      // (La seguridad de Rol ya se manejó en contact.routes.js)
      const requestToDelete = await contactService.findOne(id);
      await contactService.remove(id);

      await auditService.createLog(
        req.user.id,
        'CONTACT_DELETE',
        'ContactRequest',
        id,
        { old: requestToDelete }
      );
      
      res.status(204).send();
    } catch (e) { res.status(500).json({ message: e.message }); }
  },

  // (Función 'reply')
  reply: async (req, res) => {
    try {
      const { id } = req.params;
      const { replyText } = req.body; 
      const adminUser = req.user; 

      if (!replyText) {
        return res.status(400).json({ message: 'El texto de la respuesta no puede estar vacío.' });
      }

      const updatedRequest = await contactService.replyToRequest(
        id,
        replyText,
        adminUser 
      );

      res.status(200).json(updatedRequest);

    } catch (e) { 
      console.error("Error en contactController.reply:", e);
      res.status(500).json({ message: e.message }); 
    }
  },
};
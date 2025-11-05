// src/controllers/contact.controller.js
import { contactService } from '../services/contact.service.js';
import { auditService } from '../services/audit.service.js';

export const contactController = {
  // Ruta pública para que cualquiera envíe un formulario
  create: async (req, res) => {
    try {
      const newRequest = await contactService.create(req.body);
      res.status(201).json(newRequest);
    } catch (e) { res.status(500).json({ message: e.message }); }
  },

  // --- Rutas de Admin/Vendedor ---
  getAll: async (req, res) => {
    try {
      const requests = await contactService.findAll();
      res.status(200).json(requests);
    } catch (e) { res.status(500).json({ message: e.message }); }
  },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // 1. Obtenemos el estado "antiguo" (ahora 'findOne' existe)
      const oldRequest = await contactService.findOne(id); 

      // 2. Actualizamos
      const updated = await contactService.updateStatus(id, status);

      // Usamos '.estado' en lugar de '.status'
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

      // 1. Obtenemos la solicitud que se va a eliminar
      const requestToDelete = await contactService.findOne(id);

      // 2. Eliminamos
      await contactService.remove(id);

      // 3. (Log de auditoría - sin cambios)
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
};
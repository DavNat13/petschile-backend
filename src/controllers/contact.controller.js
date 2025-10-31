// src/controllers/contact.controller.js
import { contactService } from '../services/contact.service.js';

export const contactController = {
  // Ruta pública para que cualquiera envíe un formulario
  create: async (req, res) => {
    try {
      // (Aquí deberías validar el body)
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
      const { status } = req.body;
      const updated = await contactService.updateStatus(req.params.id, status);
      res.status(200).json(updated);
    } catch (e) { res.status(500).json({ message: e.message }); }
  },
  remove: async (req, res) => {
    try {
      await contactService.remove(req.params.id);
      res.status(204).send();
    } catch (e) { res.status(500).json({ message: e.message }); }
  },
};
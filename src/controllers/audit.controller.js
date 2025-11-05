// src/controllers/audit.controller.js
import { auditService } from '../services/audit.service.js';

/**
 * Controlador para manejar la lectura de logs de auditoría.
 */
export const auditController = {
  
  /**
   * Obtiene todos los registros de auditoría.
   * Ruta: GET /api/audit
   * Acceso: Solo ADMIN
   */
  getAll: async (req, res) => {
    
    // Llama al servicio que busca en la base de datos
    const logs = await auditService.findAllLogs();
    
    // Envía la respuesta
    res.status(200).json(logs);
  },

};
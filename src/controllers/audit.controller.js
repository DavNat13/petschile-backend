// src/controllers/audit.controller.js
import { auditService } from '../services/audit.service.js';

/**
 * Controlador para manejar la lectura de logs de auditoría.
 */
export const auditController = {
  
  /**
   * Obtiene todos los registros de auditoría (ahora con filtros).
   * Ruta: GET /api/audit
   * Acceso: Solo ADMIN
   */
  getAll: async (req, res) => {
    try {
      // 1. Extraemos los filtros (roleFilter en lugar de userId)
      const { searchTerm, roleFilter, actionType, entityType } = req.query;

      // 2. Creamos un objeto de opciones para el servicio
      const options = {
        searchTerm,
        roleFilter, 
        actionType,
        entityType
      };

      // 3. Pasamos las opciones al servicio
      const logs = await auditService.findAllLogs(options);
      
      res.status(200).json(logs);

    } catch (error) {
      console.error("Error en auditController.getAll:", error);
      res.status(500).json({ message: 'Error al obtener el historial de auditoría', error: error.message });
    }
  },

  /**
   * Obtiene estadísticas sobre los logs de auditoría para el Dashboard.
   * Ruta: GET /api/audit/stats
   * Acceso: Solo ADMIN
   */
  getStats: async (req, res) => {
    try {
      const stats = await auditService.getStats();
      res.status(200).json(stats);
    } catch (error) {
      console.error("Error en auditController.getStats:", error);
      res.status(500).json({ message: 'Error al obtener estadísticas de auditoría', error: error.message });
    }
  },

};
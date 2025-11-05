// src/services/audit.service.js
import { prisma } from '../config/prisma.js';

export const auditService = {

  /**
   * Crea un nuevo registro de auditoría.
   * Esta es la función que llaman todos los controladores.
   * @param {string} userId - ID del usuario que realiza la acción
   * @param {string} action - Tipo de acción (ej. "PRODUCT_CREATE")
   * @param {string} entity - Entidad afectada (ej. "Product")
   * @param {string} entityId - ID de la entidad afectada
   * @param {object} changes - JSON con los datos { old, new }
   */
  createLog: async (userId, action, entity, entityId, changes = null) => {
    try {
      return await prisma.auditLog.create({
        data: {
          userId,
          action,
          entity,
          entityId,
          changes,
        },
      });
    } catch (error) {
      // Si falla el log, no queremos que falle la operación principal.
      // Lo registramos en la consola del servidor.
      console.error('Error al crear el log de auditoría:', error.message);
    }
  },

  /**
   * Obtiene todos los registros de auditoría (para el Admin).
   * Incluye los datos del usuario que realizó la acción.
   */
  findAllLogs: async () => {
    return await prisma.auditLog.findMany({
      include: {
        // Incluimos solo la info necesaria del usuario
        user: {
          select: {
            nombre: true,
            apellidos: true,
            email: true,
            role: {
              select: {
                nombre: true
              }
            }
          },
        },
      },
      // Los más nuevos primero
      orderBy: {
        timestamp: 'desc',
      },
    });
  },
  
};
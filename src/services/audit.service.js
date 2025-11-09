// src/services/audit.service.js
import { prisma } from '../config/prisma.js';

export const auditService = {

  /**
   * Crea un nuevo registro de auditoría.
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
      console.error('Error al crear el log de auditoría:', error.message);
    }
  },

  /**
   * Obtiene todos los registros de auditoría (filtrados y ordenados).
   */
  findAllLogs: async (options = {}) => {
    const { searchTerm, roleFilter, actionType, entityType } = options;

    const where = {
      AND: [], 
    };

    if (roleFilter) {
      where.AND.push({
        user: {
          role: {
            nombre: roleFilter
          }
        }
      });
    }
    
    if (entityType) {
      where.AND.push({ entity: entityType });
    }

    if (actionType) {
      if (actionType === 'DELETE') {
        where.AND.push({
          OR: [
            { action: { contains: 'DELETE', mode: 'insensitive' } },
            { action: { contains: 'ARCHIVE', mode: 'insensitive' } }
          ]
        });
      } else {
        where.AND.push({ action: { contains: actionType, mode: 'insensitive' } });
      }
    }

    if (searchTerm) {
      where.AND.push({
        OR: [
          { action: { contains: searchTerm, mode: 'insensitive' } },
          { entity: { contains: searchTerm, mode: 'insensitive' } },
          { entityId: { contains: searchTerm, mode: 'insensitive' } },
          { user: { email: { contains: searchTerm, mode: 'insensitive' } } },
          { user: { nombre: { contains: searchTerm, mode: 'insensitive' } } },
          { user: { apellidos: { contains: searchTerm, mode: 'insensitive' } } }
        ]
      });
    }

    const finalWhere = where.AND.length > 0 ? where : {};

    return await prisma.auditLog.findMany({
      where: finalWhere, 
      include: {
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
      orderBy: {
        timestamp: 'desc',
      },
      take: 200, 
    });
  },
  
  /**
   * Calcula estadísticas agregadas sobre los logs de auditoría.
   */
  getStats: async () => {
    try {
      // Ejecutamos todos los conteos en paralelo para máxima eficiencia
      const [totalChanges, createChanges, updateChanges, deleteChanges] = await Promise.all([
        // 1. Cambios generales
        prisma.auditLog.count(),
        
        // 2. Cantidad de "CREATE"
        prisma.auditLog.count({
          where: { action: { contains: 'CREATE', mode: 'insensitive' } }
        }),
        
        // 3. Cantidad de "UPDATE"
        prisma.auditLog.count({
          where: { action: { contains: 'UPDATE', mode: 'insensitive' } }
        }),
        
        // 4. Cantidad de "DELETE" (incluyendo ARCHIVE)
        prisma.auditLog.count({
          where: { 
            OR: [
              { action: { contains: 'DELETE', mode: 'insensitive' } },
              { action: { contains: 'ARCHIVE', mode: 'insensitive' } }
            ]
          }
        })
      ]);

      return {
        totalChanges,
        createChanges,
        updateChanges,
        deleteChanges
      };

    } catch (error) {
      console.error('Error al calcular estadísticas de auditoría:', error);
      throw new Error('Error al calcular estadísticas de auditoría.');
    }
  }
  
};
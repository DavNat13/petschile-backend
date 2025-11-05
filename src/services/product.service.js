// src/services/product.service.js
import { prisma } from '../config/prisma.js';

export const productService = {
  
  /**
   * (PÚBLICO) Obtiene todos los productos ACTIVOS
   */
  findAll: async () => {
    return await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        category: true,
        alimento: { include: { brand: true } },
        juguete: true,
        accesorio: true,
        higiene: true,
      },
    });
  },

  /**
   * (PÚBLICO) Obtiene un producto por 'codigo' (SKU) si está ACTIVO
   */
  findOneByCodigo: async (codigo) => {
    return await prisma.product.findUnique({
      where: { 
        codigo: codigo,
        status: 'ACTIVE'
       }, 
      include: {
        category: true,
        alimento: { include: { brand: true } },
        juguete: true,
        accesorio: true,
        higiene: true,
      },
    });
  },

  /**
   * (ADMIN) Obtiene TODOS los productos (activos y archivados).
   */
  findAllForAdmin: async () => {
    return await prisma.product.findMany({
      // Sin filtro de 'status'
      include: {
        category: true,
        alimento: { include: { brand: true } },
        juguete: true,
        accesorio: true,
        higiene: true,
      },
      orderBy: {
        nombre: 'asc' // Ordenados alfabéticamente
      }
    });
  },

  /**
   * (ADMIN) Obtiene un producto por 'id' (UUID) sin importar el estado.
   */
  findOneById: async (id) => {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        alimento: { include: { brand: true } },
        juguete: true,
        accesorio: true,
        higiene: true,
      },
    });
  },

  create: async (data) => {
    return await prisma.product.create({ data });
  },

  update: async (id, data) => {
    return await prisma.product.update({
      where: { id },
      data,
    });
  },

  /**
   * (ADMIN) Archiva un producto (Soft Delete)
   */
  remove: async (id) => {
    try {
      // 1. Borramos todas las referencias en los carritos (seguro de hacer)
      await prisma.cartItem.deleteMany({ where: { productId: id } });
      
      // Ya NO comprobamos OrderItem.
      // Ya NO borramos los Atributos (el producto debe mantenerlos).
      // Simplemente actualizamos el estado a 'ARCHIVED'.
       return await prisma.product.update({
         where: { id: id },
         data: { status: 'ARCHIVED' },
       });
      
    } catch (error) {
      // Este catch es ahora solo para errores inesperados de la BD
      console.error("Error en el servicio de archivar producto:", error);
      throw error;
    }
  },

  /**
   * (ADMIN) Restaura un producto cambiando su estado a 'ACTIVE'.
   */
  restore: async (id) => {
    try {
      return await prisma.product.update({
        where: { id: id },
        data: { status: 'ACTIVE' },
      });
    } catch (error) {
      console.error("Error en el servicio de restaurar producto:", error);
      throw error;
    }
  },
};
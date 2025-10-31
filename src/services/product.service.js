// src/services/product.service.js
import { prisma } from '../config/prisma.js';

export const productService = {
  
  findAll: async () => {
    return await prisma.product.findMany({
      // Incluimos la categoría y los atributos específicos
      include: {
        category: true,
        alimento: { include: { brand: true } },
        juguete: true,
        accesorio: true,
        higiene: true,
      },
    });
  },

  findOne: async (id) => {
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

  /**
   * Crea un producto. Requiere un objeto 'data' complejo
   * que el controlador (o middleware) debe construir.
   */
  create: async (data) => {
    // El 'data' debe venir listo de Prisma (con escrituras anidadas)
    // Ej: { nombre: '...', precio: 100, categoryId: 1, 
    //      alimento: { create: { medidaKg: 10, brandId: 1 } } }
    return await prisma.product.create({ data });
  },

  /**
   * Actualiza un producto.
   */
  update: async (id, data) => {
    // Similar a 'create', el 'data' debe venir listo
    // Ej: { nombre: '...', precio: 150, 
    //      alimento: { update: { medidaKg: 12 } } }
    return await prisma.product.update({
      where: { id },
      data,
    });
  },

  /**
   * Elimina un producto.
   * IMPORTANTE: Prisma borrará en cascada los atributos (alimento, etc.)
   * pero fallará si el producto está en un OrderItem.
   * (Una mejor práctica sería "desactivar" el producto en lugar de borrarlo).
   */
  remove: async (id) => {
    try {
      // Primero borramos los atributos específicos (buena práctica)
      await prisma.attributeAlimento.deleteMany({ where: { productId: id } });
      await prisma.attributeJuguete.deleteMany({ where: { productId: id } });
      await prisma.attributeAccesorio.deleteMany({ where: { productId: id } });
      await prisma.attributeHigiene.deleteMany({ where: { productId: id } });
      
      // Luego borramos el producto
      return await prisma.product.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2003') { // Error de Foreign Key
        throw new Error('No se puede eliminar: El producto está asociado a uno o más pedidos.');
      }
      throw error;
    }
  },
};
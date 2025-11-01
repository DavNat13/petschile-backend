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

  // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
  // Cambiamos el parámetro de 'id' a 'codigo' para que sea más claro.
  // El controlador (product.controller.js) le pasará el 'codigo' de la URL a esta función.
  findOne: async (codigo) => {
    return await prisma.product.findUnique({
      // Buscamos por 'codigo' (que es @unique en tu schema) en lugar de 'id'
      where: { codigo }, 
      include: {
        category: true,
        alimento: { include: { brand: true } },
        juguete: true,
        accesorio: true,
        higiene: true,
      },
    });
  },
  // --- FIN DE LA CORRECCIÓN ---

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
    
    // NOTA: La actualización SÍ usa el 'id' (UUID), lo cual es correcto
    // para las rutas de admin. Solo la vista PÚBLICA usa el 'codigo'.
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
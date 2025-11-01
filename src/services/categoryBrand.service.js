// src/services/categoryBrand.service.js
import { prisma } from '../config/prisma.js';

// Un servicio simple para obtener las listas de categorías y marcas
export const categoryBrandService = {
  
  /**
   * Encuentra todas las categorías
   */
  findAllCategories: async () => {
    return await prisma.category.findMany({
      orderBy: { nombre: 'asc' }, // Las ordenamos alfabéticamente
    });
  },

  /**
   * Encuentra todas las marcas
   */
  findAllBrands: async () => {
    return await prisma.brand.findMany({
      orderBy: { nombre: 'asc' }, // Las ordenamos alfabéticamente
    });
  },
};
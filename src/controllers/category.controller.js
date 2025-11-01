// src/controllers/category.controller.js
import { categoryBrandService } from '../services/categoryBrand.service.js';
import { asyncHandler } from '../utils/errorHandler.js'; // Usamos nuestro wrapper

export const categoryController = {
  
  /**
   * Obtiene todas las categorías
   */
  getAll: asyncHandler(async (req, res) => {
    // Usamos la función 'findAllCategories' del nuevo servicio
    const categories = await categoryBrandService.findAllCategories();
    res.status(200).json(categories);
  }),
};
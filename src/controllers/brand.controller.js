// src/controllers/brand.controller.js
import { categoryBrandService } from '../services/categoryBrand.service.js';
import { asyncHandler } from '../utils/errorHandler.js'; // Usamos nuestro wrapper

export const brandController = {
  
  /**
   * Obtiene todas las marcas
   */
  getAll: asyncHandler(async (req, res) => {
    // Usamos la función 'findAllBrands' del nuevo servicio
    const brands = await categoryBrandService.findAllBrands();
    res.status(200).json(brands);
  }),
};
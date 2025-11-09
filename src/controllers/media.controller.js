// src/controllers/media.controller.js
import { mediaService } from '../services/media.service.js';
import { AppError } from '../utils/errorHandler.js';

export const mediaController = {

  /**
   * Sube uno o más archivos a la biblioteca de medios.
   * (Esta función no cambia)
   */
  upload: async (req, res) => {
    const files = req.files;
    const customNames = req.body.fileNames ? JSON.parse(req.body.fileNames) : [];

    if (!files || files.length === 0) {
      throw new AppError('No se proporcionó ningún archivo.', 400);
    }

    const uploadPromises = files.map((file, index) => 
      mediaService.upload(file, customNames[index])
    );
    
    const newMediaFiles = await Promise.all(uploadPromises);

    res.status(201).json(newMediaFiles);
  },

  /**
   * Obtiene todos los archivos de la biblioteca de medios.
   * (Esta función no cambia)
   */
  getAll: async (req, res) => {
    // 1. Leemos los parámetros de la query URL
    const { 
      page = 1, 
      limit = 50, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      filterType = null,
      search = null 
    } = req.query;

    // 2. Añadimos 'search' a las opciones
    const options = { page, limit, sortBy, sortOrder, filterType, search }; 

    // 3. Ejecutamos ambas consultas (obtener datos y contar total) en paralelo.
    const [files, totalFiles] = await Promise.all([
      mediaService.findPaginated(options), 
      mediaService.countAll(options)      
    ]);
    
    const totalPages = Math.ceil(totalFiles / limit);

    // 4. Devolvemos una respuesta estructurada para el frontend.
    res.status(200).json({
      data: files,
      pagination: {
        totalItems: totalFiles,
        totalPages: totalPages,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit),
      }
    });
  },

  /*
   * Elimina un archivo de la biblioteca (y de Cloudinary).
   */
  remove: async (req, res) => {
    const { id } = req.params; 
    
    await mediaService.delete(id);
    
    res.status(204).send(); // 204 No Content
  },

  /**
   * Obtiene estadísticas sobre los archivos de medios para el Dashboard.
   * Ruta: GET /api/media/stats
   * Acceso: Private (Admin, Seller)
   */
  getStats: async (req, res) => {
    try {
      const stats = await mediaService.getStats();
      res.status(200).json(stats);
    } catch (error) {
      console.error("Error en mediaController.getStats:", error);
      res.status(500).json({ message: 'Error al obtener estadísticas de medios', error: error.message });
    }
  },
  
};
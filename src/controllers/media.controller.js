// src/controllers/media.controller.js
import { mediaService } from '../services/media.service.js';
import { AppError } from '../utils/errorHandler.js';

export const mediaController = {

  /**
   * Sube uno o más archivos a la biblioteca de medios.
   * @route   POST /api/media/upload
   * @access  Private (Admin, Seller)
   */
  upload: async (req, res) => {
    // 1. 'req.files' es un array añadido por 'upload.array()' en las rutas.
    const files = req.files;
    
    // 2. 'req.body.fileNames' es un string JSON que contiene los nombres editados.
    const customNames = req.body.fileNames ? JSON.parse(req.body.fileNames) : [];

    if (!files || files.length === 0) {
      throw new AppError('No se proporcionó ningún archivo.', 400);
    }

    // 3. Usamos Promise.all para subir todos los archivos en paralelo.
    const uploadPromises = files.map((file, index) => 
      mediaService.upload(file, customNames[index]) // Pasamos el archivo y su nombre personalizado
    );
    
    const newMediaFiles = await Promise.all(uploadPromises);

    // 4. Devolvemos el array con los nuevos registros de la BD.
    res.status(201).json(newMediaFiles);
  },

  /**
   * Obtiene todos los archivos de la biblioteca de medios.
   * @route   GET /api/media
   * @access  Private (Admin, Seller)
   */
  getAll: async (req, res) => {
    // 1. Leemos los parámetros de la query URL, con valores por defecto.
    const { 
      page = 1, 
      limit = 50, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      filterType = null
    } = req.query;

    const options = { page, limit, sortBy, sortOrder, filterType };

    // 2. Ejecutamos ambas consultas (obtener datos y contar total) en paralelo.
    const [files, totalFiles] = await Promise.all([
      mediaService.findPaginated(options),
      mediaService.countAll(options)
    ]);
    
    // 3. Calculamos el total de páginas.
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

  /**
   * Elimina un archivo de la biblioteca (y de Cloudinary).
   * @route   DELETE /api/media/:id
   * @access  Private (Admin, Seller)
   */
  remove: async (req, res) => {
    const { id } = req.params; // ID del archivo en *nuestra* BD (UUID)
    
    await mediaService.delete(id);
    
    res.status(204).send(); // 204 No Content
  },
  
};
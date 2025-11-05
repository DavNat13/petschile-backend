// src/services/media.service.js
import { prisma } from '../config/prisma.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier'; // Ayuda a convertir el buffer en un stream

/**
 * Función auxiliar para subir un 'buffer' (archivo en memoria) a Cloudinary.
 * @param {Buffer} fileBuffer El buffer del archivo desde multer
 * @param {string} folder La carpeta en Cloudinary donde se guardará
 * @returns {Promise<object>} Promesa que resuelve con el resultado de Cloudinary
 */
const uploadStream = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder, 
        resource_type: 'auto', // Detecta si es imagen, video, etc.
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};


export const mediaService = {

  /**
   * --- ¡MODIFICADO! ---
   * Sube un archivo a Cloudinary y guarda su referencia en la BD.
   * @param {object} file - El objeto 'file' de multer
   * @param {string} customFileName - El nombre de archivo (editado) enviado desde el frontend
   */
  upload: async (file, customFileName) => {
    if (!file) {
      throw new Error('No se proporcionó ningún archivo para subir.');
    }

    // 1. Determinar el tipo y la carpeta
    let fileType = 'file';
    if (file.mimetype.startsWith('image/')) {
      fileType = 'image';
    } else if (file.mimetype.startsWith('video/')) {
      fileType = 'video';
    }
    
    const folder = `petschile/${fileType}s`; // Ej: petschile/images

    try {
      // 2. Subir el archivo a Cloudinary
      const uploadResult = await uploadStream(file.buffer, folder);

      // 3. Guardar la referencia en nuestra base de datos PostgreSQL
      const newMediaFile = await prisma.mediaFile.create({
        data: {
          // --- ¡LÓGICA ACTUALIZADA! ---
          // Usa el nombre personalizado si existe, si no, usa el original
          fileName: customFileName || file.originalname,
          // --- FIN ---
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          fileType: fileType,
        },
      });

      return newMediaFile; // Devolvemos el registro de nuestra BD

    } catch (error) {
      console.error('Error al subir el archivo a Cloudinary o guardar en BD:', error);
      throw new Error('Error al procesar la subida del archivo.');
    }
  },

  /**
   * --- ¡MODIFICADO Y RENOMBRADO! ---
   * Obtiene todos los archivos de forma paginada, filtrada y ordenada.
   */
  findPaginated: async (options = {}) => {
    // 1. Definimos los valores por defecto
    const {
      page = 1,
      limit = 50, // Límite por defecto de 50
      sortBy = 'createdAt', // Ordenar por fecha de creación por defecto
      sortOrder = 'desc', // Más nuevos primero
      filterType = null // "image", "video", "file", o null (todos)
    } = options;

    // 2. Calculamos las opciones de Prisma
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const orderBy = { [sortBy]: sortOrder };

    // 3. Construimos el 'where' dinámico para el filtro
    const where = {};
    if (filterType && ['image', 'video', 'file'].includes(filterType)) {
      where.fileType = filterType;
    }

    // 4. Ejecutamos la consulta paginada
    return await prisma.mediaFile.findMany({
      where,
      skip,
      take,
      orderBy,
    });
  },

  /**
   * --- ¡NUEVO! ---
   * Cuenta el total de archivos para la paginación (respetando filtros).
   */
  countAll: async (options = {}) => {
    const { filterType = null } = options;
    
    // Construimos el 'where' dinámico
    const where = {};
    if (filterType && ['image', 'video', 'file'].includes(filterType)) {
      where.fileType = filterType;
    }

    // Ejecutamos la consulta de conteo
    return await prisma.mediaFile.count({ where });
  },

  /**
   * --- ¡MODIFICADO! ---
   * Elimina un archivo de Cloudinary y de la base de datos.
   * (Maneja diferentes resource_type)
   */
  delete: async (id) => {
    try {
      // 1. Encontrar el registro en nuestra BD
      const file = await prisma.mediaFile.findUnique({
        where: { id },
      });

      if (!file) {
        throw new Error('Archivo no encontrado en la base de datos.');
      }

      // 2. Determinar el resource_type para Cloudinary
      let resourceType = 'raw'; // 'raw' es para archivos genéricos (pdf, zip, etc.)
      if (file.fileType === 'image') {
        resourceType = 'image';
      } else if (file.fileType === 'video') {
        resourceType = 'video';
      }

      // 3. Pedir a Cloudinary que borre el archivo
      await cloudinary.uploader.destroy(file.publicId, {
        resource_type: resourceType
      });

      // 4. Borrar el registro de nuestra BD
      await prisma.mediaFile.delete({
        where: { id },
      });

      return { message: 'Archivo eliminado correctamente.' };

    } catch (error) {
      console.error('Error al eliminar el archivo:', error);
      throw new Error('Error al eliminar el archivo.');
    }
  },
};
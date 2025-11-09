// src/services/media.service.js
import { prisma } from '../config/prisma.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier'; 

/**
 * Función auxiliar para subir un 'buffer' (archivo en memoria) a Cloudinary.
 */
const uploadStream = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder, 
        resource_type: 'auto', 
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
   * Sube un archivo a Cloudinary y guarda su referencia en la BD.
   */
  upload: async (file, customFileName) => {
    if (!file) {
      throw new Error('No se proporcionó ningún archivo para subir.');
    }

    let fileType = 'file';
    if (file.mimetype.startsWith('image/')) {
      fileType = 'image';
    } else if (file.mimetype.startsWith('video/')) {
      fileType = 'video';
    }
    
    const folder = `petschile/${fileType}s`; 

    try {
      const uploadResult = await uploadStream(file.buffer, folder);

      const newMediaFile = await prisma.mediaFile.create({
        data: {
          fileName: customFileName || file.originalname,
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          fileType: fileType,
        },
      });

      return newMediaFile; 

    } catch (error) {
      console.error('Error al subir el archivo a Cloudinary o guardar en BD:', error);
      throw new Error('Error al procesar la subida del archivo.');
    }
  },

  /**
   * Obtiene todos los archivos de forma paginada, filtrada, ordenada y buscada.
   */
  findPaginated: async (options = {}) => {
    const {
      page = 1,
      limit = 50, 
      sortBy = 'createdAt', 
      sortOrder = 'desc', 
      filterType = null,
      search = null 
    } = options;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const orderBy = { [sortBy]: sortOrder };

    const where = {};
    if (filterType && ['image', 'video', 'file'].includes(filterType)) {
      where.fileType = filterType;
    }
    
    if (search) {
      where.fileName = {
        contains: search,
        mode: 'insensitive', 
      };
    }

    return await prisma.mediaFile.findMany({
      where,
      skip,
      take,
      orderBy,
    });
  },

  /**
   * Cuenta el total de archivos (respetando filtros y búsqueda).
   */
  countAll: async (options = {}) => {
    const { 
      filterType = null,
      search = null 
    } = options;
    
    const where = {};
    if (filterType && ['image', 'video', 'file'].includes(filterType)) {
      where.fileType = filterType;
    }

    if (search) {
      where.fileName = {
        contains: search,
        mode: 'insensitive',
      };
    }

    return await prisma.mediaFile.count({ where });
  },

  /**
   * Elimina un archivo de Cloudinary y de la base de datos.
   */
  delete: async (id) => {
    try {
      const file = await prisma.mediaFile.findUnique({
        where: { id },
      });

      if (!file) {
        throw new Error('Archivo no encontrado en la base de datos.');
      }

      let resourceType = 'raw'; 
      if (file.fileType === 'image') {
        resourceType = 'image';
      } else if (file.fileType === 'video') {
        resourceType = 'video';
      }

      await cloudinary.uploader.destroy(file.publicId, {
        resource_type: resourceType
      });

      await prisma.mediaFile.delete({
        where: { id },
      });

      return { message: 'Archivo eliminado correctamente.' };

    } catch (error) {
      console.error('Error al eliminar el archivo:', error);
      throw new Error('Error al eliminar el archivo.');
    }
  },

  /**
   * Calcula estadísticas agregadas sobre los archivos de medios.
   */
  getStats: async () => {
    try {
      // Ejecutamos el conteo total y el conteo por grupos en paralelo
      const [totalFiles, typeGroups] = await Promise.all([
        // 1. Total de archivos
        prisma.mediaFile.count(),
        
        // 2. Conteo agrupado por 'fileType'
        prisma.mediaFile.groupBy({
          by: ['fileType'],
          _count: {
            _all: true, // Contará todos los registros en cada grupo
          },
        })
      ]);
      const countsByType = typeGroups.reduce((acc, group) => {
        acc[group.fileType] = group._count._all;
        return acc;
      }, {});

      return {
        totalFiles,
        ...countsByType // Desplegamos las claves (image, video, file)
      };

    } catch (error) {
      console.error('Error al calcular estadísticas de medios:', error);
      throw new Error('Error al calcular estadísticas de medios.');
    }
  }

};
// src/api/media.routes.js
import { Router } from 'express';
import multer from 'multer';
import { mediaController } from '../controllers/media.controller.js';
import { checkJwt, checkRole } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/errorHandler.js';

// 1. Configuración de Multer para almacenamiento en memoria (sin cambios)
const storage = multer.memoryStorage(); // Almacena el archivo en req.file.buffer
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Límite de 10MB por archivo
  }
});

const router = Router();

// 2. Protección Global (sin cambios)
router.use(checkJwt);
router.use(checkRole(['ADMIN', 'SELLER']));

/**
 * @route   GET /api/media
 * @desc    Obtiene todos los archivos (paginados, filtrados, ordenados)
 * @access  Private (Admin, Seller)
 */
router.get(
  '/', 
  asyncHandler(mediaController.getAll)
);

/**
 * --- ¡MODIFICADO! ---
 * @route   POST /api/media/upload
 * @desc    Sube uno o MÚLTIPLES archivos nuevos
 * @access  Private (Admin, Seller)
 */
router.post(
  '/upload',
  // 3. Cambiamos de .single('file') a .array('files', 10)
  upload.array('files', 10), 
  asyncHandler(mediaController.upload)
);
// --- FIN DE MODIFICACIÓN ---

/**
 * @route   DELETE /api/media/:id
 * @desc    Elimina un archivo de la biblioteca (y de Cloudinary)
 * @access  Private (Admin, Seller)
 */
router.delete(
  '/:id',
  asyncHandler(mediaController.remove)
);

export default router;
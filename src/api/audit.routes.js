// src/api/audit.routes.js
import { Router } from 'express';
import { auditController } from '../controllers/audit.controller.js';
import { checkJwt, checkRole } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/errorHandler.js'; // Importamos asyncHandler

const router = Router();

// --- Protección Global ---
// Aplicamos 'checkJwt' y 'checkRole' a TODAS las rutas de este archivo.
// Solo los ADMINS pueden ver el log de auditoría.
router.use(checkJwt);
router.use(checkRole(['ADMIN']));

/**
 * @route   GET /api/audit
 * @desc    Obtiene todos los registros de auditoría
 * @access  Private (Admin)
 */
router.get('/', asyncHandler(auditController.getAll));

export default router;
// src/api/brand.routes.js
import { Router } from 'express';
import { brandController } from '../controllers/brand.controller.js';

const router = Router();

// Ruta pública para que el formulario de admin pueda obtenerlas
// GET /api/brands
router.get('/', brandController.getAll);

export default router;
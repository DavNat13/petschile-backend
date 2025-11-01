// src/api/category.routes.js
import { Router } from 'express';
import { categoryController } from '../controllers/category.controller.js';

const router = Router();

// Ruta pública para que el formulario de admin pueda obtenerlas
// GET /api/categories
router.get('/', categoryController.getAll);

export default router;
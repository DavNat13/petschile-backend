// src/api/blog.routes.js
import { Router } from 'express';
import { blogController } from '../controllers/blog.controller.js';
import { checkJwt, checkRole } from '../middlewares/auth.middleware.js';
// (Aquí crearías 'validateBlogPost')

const router = Router();

// Rutas públicas
router.get('/', blogController.getAll);
router.get('/:id', blogController.getOne);

// Rutas de Admin
router.post('/', [checkJwt, checkRole(['ADMIN'])], blogController.create);
router.patch('/:id', [checkJwt, checkRole(['ADMIN'])], blogController.update);
router.delete('/:id', [checkJwt, checkRole(['ADMIN'])], blogController.remove);

export default router;
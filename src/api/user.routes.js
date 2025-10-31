// src/api/user.routes.js
import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { checkJwt, checkRole } from '../middlewares/auth.middleware.js';
// (Aquí crearías middlewares 'validateUser' si es necesario)

const router = Router();

// Protegemos TODAS las rutas de este archivo con 'checkJwt' y 'checkRole'
router.use(checkJwt);
router.use(checkRole(['ADMIN'])); // Solo ADMINS pueden gestionar usuarios

// GET /api/users
router.get('/', userController.getAll);

// GET /api/users/:id
router.get('/:id', userController.getOne);

// POST /api/users (Admin crea usuario, distinto de 'register' público)
router.post('/', userController.create);

// PATCH /api/users/:id
router.patch('/:id', userController.update);

// DELETE /api/users/:id
router.delete('/:id', userController.remove);

export default router;
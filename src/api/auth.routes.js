// src/api/auth.routes.js
import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validateLogin, validateRegister } from '../middlewares/validation.middleware.js';
import { checkJwt } from '../middlewares/auth.middleware.js';

const router = Router();

// POST /api/auth/register
// Usamos el middleware de validación antes de llamar al controlador
router.post('/register', validateRegister, authController.register);

// POST /api/auth/login
// Usamos el middleware de validación antes de llamar al controlador
router.post('/login', validateLogin, authController.login);

// GET /api/auth/profile
// Una ruta protegida de ejemplo para que el frontend verifique si un token es válido
router.get('/profile', checkJwt, authController.getProfile);

export default router;
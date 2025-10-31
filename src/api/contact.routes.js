// src/api/contact.routes.js
import { Router } from 'express';
import { contactController } from '../controllers/contact.controller.js';
import { checkJwt, checkRole } from '../middlewares/auth.middleware.js';
// (Aquí crearías 'validateContactRequest')

const router = Router();

// Ruta pública para crear una solicitud
router.post('/', contactController.create);

// Rutas de Admin/Vendedor para gestionar solicitudes
router.get('/', [checkJwt, checkRole(['ADMIN', 'SELLER'])], contactController.getAll);
router.patch('/:id', [checkJwt, checkRole(['ADMIN', 'SELLER'])], contactController.updateStatus);
router.delete('/:id', [checkJwt, checkRole(['ADMIN', 'SELLER'])], contactController.remove);

export default router;
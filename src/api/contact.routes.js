// src/api/contact.routes.js
import { Router } from 'express';
import { contactController } from '../controllers/contact.controller.js';
import { checkJwt, checkRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Ruta pública para crear una solicitud
router.post('/', contactController.create);

// --- Rutas de Admin/Vendedor ---
router.use(checkJwt);
router.use(checkRole(['ADMIN', 'SELLER']));

router.get('/', contactController.getAll);
router.patch('/:id', contactController.updateStatus);
router.post('/:id/reply', contactController.reply);

// Solo los 'ADMIN' pueden eliminar permanentemente.
router.delete('/:id', checkRole(['ADMIN']), contactController.remove);

export default router;
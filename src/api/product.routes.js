// src/api/product.routes.js
import { Router } from 'express';
import { productController } from '../controllers/product.controller.js';
import { checkJwt, checkRole } from '../middlewares/auth.middleware.js';
import { validateProduct } from '../middlewares/validation.middleware.js';

const router = Router();

// --- Rutas Públicas (Cualquiera puede ver) ---
router.get('/', productController.getAll);
router.get('/:id', productController.getOne);

// --- Rutas Protegidas (Solo Admin/Vendedor) ---
router.post(
  '/',
  [checkJwt, checkRole(['ADMIN', 'SELLER']), validateProduct], // Array de middlewares
  productController.create
);

router.patch(
  '/:id',
  [checkJwt, checkRole(['ADMIN', 'SELLER']), validateProduct], // 'validateProduct' puede reusarse (con ajustes)
  productController.update
);

// --- Ruta Súper Protegida (Solo Admin) ---
router.delete(
  '/:id',
  [checkJwt, checkRole(['ADMIN'])],
  productController.remove
);

export default router;
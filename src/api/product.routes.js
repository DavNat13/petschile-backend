// src/api/product.routes.js
import { Router } from 'express';
import { productController } from '../controllers/product.controller.js';
import { checkJwt, checkRole } from '../middlewares/auth.middleware.js';
import { validateProduct } from '../middlewares/validation.middleware.js';

const router = Router();

// --- Rutas Públicas (Cualquiera puede ver, solo ven 'ACTIVE') ---
// (Busca por 'codigo')
router.get('/:id', productController.getOne);
// (Obtiene solo 'ACTIVE')
router.get('/', productController.getAll);


// --- ¡NUEVA RUTA DE ADMIN! ---
/**
 * @route   GET /api/products/admin/list
 * @desc    (Admin) Obtiene TODOS los productos (activos y archivados)
 * @access  Private (Admin, Seller)
 */
router.get(
  '/admin/list', // Usamos un prefijo para diferenciarla
  [checkJwt, checkRole(['ADMIN', 'SELLER'])],
  productController.getAllForAdmin
);

// --- Rutas Protegidas (Solo Admin/Vendedor) ---

/**
 * @route   POST /api/products
 * @desc    (Admin/Seller) Crea un nuevo producto
 * @access  Private (Admin, Seller)
 */
router.post(
  '/',
  [checkJwt, checkRole(['ADMIN', 'SELLER']), validateProduct], // Array de middlewares
  productController.create
);

/**
 * @route   PATCH /api/products/:id
 * @desc    (Admin/Seller) Actualiza un producto por su UUID
 * @access  Private (Admin, Seller)
 */
router.patch(
  '/:id',
  [checkJwt, checkRole(['ADMIN', 'SELLER']), validateProduct], 
  productController.update
);

// --- ¡NUEVA RUTA DE ADMIN! ---
/**
 * @route   PATCH /api/products/:id/restore
 * @desc    (Admin/Seller) Restaura un producto archivado
 * @access  Private (Admin, Seller)
 */
router.patch(
  '/:id/restore',
  [checkJwt, checkRole(['ADMIN', 'SELLER'])],
  productController.restore
);

// --- Ruta Súper Protegida (Solo Admin) ---
/**
 * @route   DELETE /api/products/:id
 * @desc    (Admin) Archiva un producto (Soft Delete)
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  [checkJwt, checkRole(['ADMIN'])],
  productController.remove
);

export default router;
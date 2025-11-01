// src/api/order.routes.js
import { Router } from 'express';
import { orderController } from '../controllers/order.controller.js';
import { checkJwt, checkRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Protegemos TODAS las rutas de pedidos (nadie sin loguear puede ver/crear)
router.use(checkJwt);

// --- Rutas de Cliente ---

// POST /api/orders (Un cliente o admin crea un pedido)
router.post('/', checkRole(['CLIENT', 'ADMIN','SELLER']), orderController.create);

// GET /api/orders/my-orders (Un cliente O ADMIN ve SUS propios pedidos)
router.get('/my-orders', checkRole(['CLIENT', 'ADMIN','SELLER']), orderController.getMyOrders);

// --- Rutas de Admin/Vendedor ---

// GET /api/orders (Admin/Vendedor ven TODOS los pedidos)
router.get('/', checkRole(['ADMIN', 'SELLER']), orderController.getAll);

// GET /api/orders/:id (Cualquier rol logueado puede ver UN pedido específico por ID)
// (Esto lo corregimos para PurchaseDetailPage)
router.get('/:id', checkRole(['ADMIN', 'SELLER', 'CLIENT']), orderController.getOne);

// PATCH /api/orders/:id (Admin/Vendedor actualizan estado del pedido)
router.patch('/:id', checkRole(['ADMIN', 'SELLER']), orderController.updateStatus);

export default router;
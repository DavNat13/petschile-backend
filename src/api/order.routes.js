// src/api/order.routes.js
import { Router } from 'express';
import { orderController } from '../controllers/order.controller.js';
import { checkJwt, checkRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Protegemos TODAS las rutas de pedidos (nadie sin loguear puede ver/crear)
router.use(checkJwt);

// --- Rutas de Cliente ---

// POST /api/orders (Un cliente crea su propio pedido)
router.post('/', checkRole(['CLIENT']), orderController.create);

// GET /api/orders/my-orders (Un cliente ve SUS propios pedidos)
router.get('/my-orders', checkRole(['CLIENT']), orderController.getMyOrders);

// --- Rutas de Admin/Vendedor ---

// GET /api/orders (Admin/Vendedor ven TODOS los pedidos)
router.get('/', checkRole(['ADMIN', 'SELLER']), orderController.getAll);

// GET /api/orders/:id (Admin/Vendedor ven UN pedido específico)
router.get('/:id', checkRole(['ADMIN', 'SELLER']), orderController.getOne);

// PATCH /api/orders/:id (Admin/Vendedor actualizan estado del pedido)
router.patch('/:id', checkRole(['ADMIN', 'SELLER']), orderController.updateStatus);

export default router;
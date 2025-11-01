// src/api/cart.routes.js
import { Router } from 'express';
import { cartController } from '../controllers/cart.controller.js';
import { checkJwt, checkRole } from '../middlewares/auth.middleware.js';

const router = Router();

// --- Protección Global ---
// Aplicamos 'checkJwt' a TODAS las rutas de este archivo.
// Nadie que no esté logueado puede acceder a la API del carrito.
router.use(checkJwt);

// --- Rutas del Carrito ---

// GET /api/cart
// Obtiene el carrito completo del usuario
router.get(
    '/', 
    cartController.getCart
);

// POST /api/cart
// Añade un nuevo producto al carrito (o incrementa la cantidad)
router.post(
    '/', 
    cartController.addToCart
);

// PATCH /api/cart/:productId
// Actualiza la cantidad de un producto específico
router.patch(
    '/:productId', 
    cartController.updateCartItem
);

// DELETE /api/cart/:productId
// Elimina un producto específico del carrito
router.delete(
    '/:productId', 
    cartController.removeFromCart
);

// DELETE /api/cart
// Vacía todos los items del carrito del usuario
router.delete(
    '/', 
    cartController.clearCart
);

export default router;
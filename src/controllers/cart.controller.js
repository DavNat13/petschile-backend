// src/controllers/cart.controller.js
import { cartService } from '../services/cart.service.js';
import { asyncHandler } from '../utils/errorHandler.js'; // Usamos nuestro wrapper

export const cartController = {
  
  /**
   * Obtiene el carrito completo del usuario logueado
   * Ruta: GET /api/cart
   */
  getCart: asyncHandler(async (req, res) => {
    // El 'userId' viene del token JWT (añadido por 'checkJwt' middleware)
    const userId = req.user.id;
    const cart = await cartService.getCart(userId);
    res.status(200).json(cart);
  }),

  /**
   * Añade un producto al carrito
   * Ruta: POST /api/cart
   */
  addToCart: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    // El frontend enviará el ID del producto y la cantidad
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: 'productId y quantity son requeridos' });
    }

    const item = await cartService.addToCart(userId, productId, parseInt(quantity));
    res.status(201).json(item);
  }),

  /**
   * Actualiza la cantidad de un producto en el carrito
   * Ruta: PATCH /api/cart/:productId
   */
  updateCartItem: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    // El ID del producto viene de la URL (parámetros)
    const { productId } = req.params;
    // La nueva cantidad viene del body
    const { quantity } = req.body;

    if (!quantity) {
      return res.status(400).json({ message: 'quantity es requerida' });
    }

    const item = await cartService.updateCartItem(userId, productId, parseInt(quantity));
    res.status(200).json(item);
  }),

  /**
   * Elimina un producto del carrito
   * Ruta: DELETE /api/cart/:productId
   */
  removeFromCart: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;

    await cartService.removeFromCart(userId, productId);
    res.status(204).send(); // 204 No Content (éxito, sin respuesta)
  }),

  /**
   * Vacía el carrito del usuario
   * Ruta: DELETE /api/cart
   */
  clearCart: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    await cartService.clearCart(userId);
    res.status(204).send();
  }),
};
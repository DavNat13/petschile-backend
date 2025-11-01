// src/services/cart.service.js
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/errorHandler.js'; // Usaremos nuestro error personalizado

/**
 * Función auxiliar para obtener el carrito de un usuario.
 * Si el usuario no tiene carrito, se le crea uno automáticamente.
 */
const getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
    });
  }
  return cart;
};

export const cartService = {
  
  /**
   * Obtiene el contenido completo del carrito de un usuario.
   */
  getCart: async (userId) => {
    const cart = await getOrCreateCart(userId);

    return await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        // Incluimos los 'items' y, dentro de ellos,
        // la información completa del 'product'
        items: {
          include: {
            product: {
              include: {
                category: true, // Incluimos la categoría para aplanar en el frontend
                alimento: { include: { brand: true } } // Y la marca
              }
            }
          },
          orderBy: {
            // Opcional: ordenar items, ej. por ID
            id: 'asc'
          }
        },
      },
    });
  },

  /**
   * Añade un producto (o incrementa su cantidad) al carrito.
   */
  addToCart: async (userId, productId, quantity) => {
    const cart = await getOrCreateCart(userId);

    // 1. Verificar stock del producto
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true, nombre: true },
    });

    if (!product) {
      throw new AppError('Producto no encontrado', 404);
    }
    
    // 2. Buscar si el item ya existe en el carrito
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: { // Esta es la clave @@unique que definimos
          cartId: cart.id,
          productId: productId,
        },
      },
    });

    let totalQuantity;
    if (existingItem) {
      totalQuantity = existingItem.quantity + quantity;
    } else {
      totalQuantity = quantity;
    }

    // 3. Validar contra el stock
    if (product.stock < totalQuantity) {
      throw new AppError(`Stock insuficiente para ${product.nombre}. Solo quedan ${product.stock} unidades.`, 400);
    }

    // 4. Usar 'upsert' para crear o actualizar el item
    // 'upsert' = "update or insert" (actualiza si existe, inserta si no)
    const cartItem = await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId,
        },
      },
      // Qué hacer si NO existe (crear)
      create: {
        cartId: cart.id,
        productId: productId,
        quantity: quantity,
      },
      // Qué hacer si SÍ existe (actualizar)
      update: {
        quantity: {
          increment: quantity, // Incrementa la cantidad existente
        },
      },
    });

    return cartItem;
  },

  /**
   * Actualiza la cantidad específica de un item en el carrito.
   */
  updateCartItem: async (userId, productId, newQuantity) => {
    const cart = await getOrCreateCart(userId);

    // Si la nueva cantidad es 0 o menos, lo tratamos como un 'remove'
    if (newQuantity <= 0) {
      return await cartService.removeFromCart(userId, productId);
    }

    // 1. Verificar stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true, nombre: true },
    });

    if (!product) {
      throw new AppError('Producto no encontrado', 404);
    }
    
    if (product.stock < newQuantity) {
      throw new AppError(`Stock insuficiente para ${product.nombre}. Solo quedan ${product.stock} unidades.`, 400);
    }

    // 2. Actualizar la cantidad
    return await prisma.cartItem.update({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId,
        },
      },
      data: {
        quantity: newQuantity,
      },
    });
  },

  /**
   * Elimina un producto del carrito.
   */
  removeFromCart: async (userId, productId) => {
    const cart = await getOrCreateCart(userId);

    return await prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId,
        },
      },
    });
  },
  
  /**
   * Vacía todos los items del carrito de un usuario.
   */
  clearCart: async (userId) => {
    const cart = await getOrCreateCart(userId);
    
    return await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });
  }
};
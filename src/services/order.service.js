// src/services/order.service.js
import { prisma } from '../config/prisma.js';

export const orderService = {
  /**
   * Crea un nuevo pedido.
   * (Esta función no cambia)
   */
  create: async (userId, items, shippingInfo, shippingCost, total, orderId) => {
    
    return await prisma.$transaction(async (tx) => {
      // 1. Verificar stock y preparar datos de items
      const itemData = [];
      const userCart = await tx.cart.findUnique({
        where: { userId },
        select: { id: true }
      });
      
      if (!userCart) {
        throw new Error('No se encontró el carrito del usuario.');
      }

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${product?.nombre || item.productId}`);
        }
        
        const priceToUse = (product.precioOferta > 0 && product.precioOferta < product.precio) 
            ? product.precioOferta 
            : product.precio;

        itemData.push({
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: priceToUse, 
        });
      }

      // 2. Crear el Pedido y los OrderItems anidados
      const order = await tx.order.create({
        data: {
          orderId: orderId, 
          userId,
          total,
          shippingCost,
          shippingInfo, 
          status: 'Procesando',
          items: {
            create: itemData, 
          },
        },
        include: {
          items: true, 
        }
      });

      // 3. Actualizar el stock de cada producto (descontar)
      const stockUpdates = items.map(item =>
        tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      );
      await Promise.all(stockUpdates);

      // 4. Vaciar los items comprados del carrito
      await tx.cartItem.deleteMany({
        where: {
          cartId: userCart.id,
          productId: {
            in: items.map(item => item.productId) 
          }
        }
      });
      
      return order; // Devuelve el pedido completo
    });
  },

  /**
   * Encuentra todos los pedidos de un usuario específico.
   */
  findByUser: async (userId) => {
    return await prisma.order.findMany({
      where: { userId },
      orderBy: { orderDate: 'desc' },
      include: {
        items: {
          include: {
            product: true 
          }
        }
      }
    });
  },

  /**
   * Encuentra todos los pedidos (para Admin/Vendedor).
   */
  findAll: async () => {
    return await prisma.order.findMany({
      orderBy: { orderDate: 'desc' },
      include: { 
        user: { 
          select: { 
            nombre: true, 
            apellidos: true,
            email: true 
          } 
        } 
      }
    });
  },

  /**
   * Encuentra un pedido único por ID (para Admin/Vendedor).
   */
  findOne: async (id) => {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { nombre: true, apellidos: true, email: true, run: true } }, // (Este ya estaba bien)
        items: {
          include: {
            product: true
          }
        }
      }
    });
  },

  /**
   * Actualiza el estado de un pedido (ej. "Procesando" -> "Completado").
   */
  updateStatus: async (id, status) => {
    return await prisma.order.update({
      where: { id },
      data: { status },
    });
  },
};
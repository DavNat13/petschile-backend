// src/services/order.service.js
import { prisma } from '../config/prisma.js';

export const orderService = {
  /**
   * Crea un nuevo pedido. Esta es una transacción atómica:
   * 1. Crea el Pedido (Order)
   * 2. Crea los Items del Pedido (OrderItems)
   * 3. Verifica y descuenta el stock de los Productos
   * Si algo falla (ej. no hay stock), TODA la operación se revierte.
   */
  create: async (userId, items, shippingInfo, shippingCost, total) => {
    
    return await prisma.$transaction(async (tx) => {
      // 1. Verificar stock y preparar datos de items
      const itemData = [];
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${product?.nombre || item.productId}`);
        }
        
        // Usamos el precio de oferta si existe y es válido
        const priceToUse = (product.precioOferta > 0 && product.precioOferta < product.precio) 
            ? product.precioOferta 
            : product.precio;

        itemData.push({
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: priceToUse, // Guarda el precio exacto de la compra
        });
      }

      // 2. Crear el Pedido y los OrderItems anidados
      const order = await tx.order.create({
        data: {
          userId,
          total,
          shippingCost,
          shippingInfo, // Esto es el objeto JSON con los datos de envío
          status: 'Procesando',
          items: {
            create: itemData, // Crea los OrderItem anidados
          },
        },
        include: {
          items: true, // Devuelve el pedido con sus items
        }
      });

      // 3. Actualizar el stock de cada producto (descontar)
      const stockUpdates = items.map(item =>
        tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      );
      
      // Ejecutamos todas las actualizaciones de stock
      await Promise.all(stockUpdates);
      
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
            product: true // Incluye la info del producto en cada item
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
      include: { user: { select: { nombre: true, email: true } } } // Incluye info básica del usuario
    });
  },

  /**
   * Encuentra un pedido único por ID (para Admin/Vendedor).
   */
  findOne: async (id) => {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { nombre: true, email: true, run: true } },
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
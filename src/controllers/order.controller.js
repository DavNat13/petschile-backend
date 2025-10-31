// src/controllers/order.controller.js
import { orderService } from '../services/order.service.js';

export const orderController = {

  /**
   * Un cliente crea un nuevo pedido.
   */
  create: async (req, res) => {
    try {
      const userId = req.user.id; // Obtenido del token JWT
      const { items, shippingInfo, shippingCost, total } = req.body; // Obtenido del frontend

      if (!items || items.length === 0) {
        return res.status(400).json({ message: 'El pedido debe tener al menos un item' });
      }

      const newOrder = await orderService.create(userId, items, shippingInfo, shippingCost, total);
      res.status(201).json(newOrder);
    } catch (error) {
      console.error(error); // Loguea el error completo
      res.status(500).json({ message: 'Error al crear el pedido', error: error.message });
    }
  },

  /**
   * Un cliente obtiene SU historial de pedidos.
   */
  getMyOrders: async (req, res) => {
    try {
      const userId = req.user.id; // Obtenido del token JWT
      const orders = await orderService.findByUser(userId);
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener mis pedidos', error: error.message });
    }
  },

  /**
   * Un Admin/Vendedor obtiene TODOS los pedidos.
   */
  getAll: async (req, res) => {
    try {
      const orders = await orderService.findAll();
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener todos los pedidos', error: error.message });
    }
  },

  /**
   * Un Admin/Vendedor obtiene UN pedido por ID.
   */
  getOne: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await orderService.findOne(id);
      if (!order) {
        return res.status(404).json({ message: 'Pedido no encontrado' });
      }
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el pedido', error: error.message });
    }
  },

  /**
   * Un Admin/Vendedor actualiza el ESTADO de un pedido.
   */
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body; // Ej: "Completado", "Cancelado"

      if (!status) {
        return res.status(400).json({ message: 'Se requiere un estado' });
      }

      const updatedOrder = await orderService.updateStatus(id, status);
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Pedido no encontrado' });
      }
      res.status(200).json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el estado', error: error.message });
    }
  },
};
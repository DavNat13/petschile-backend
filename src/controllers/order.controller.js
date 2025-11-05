// src/controllers/order.controller.js
import { orderService } from '../services/order.service.js';
import { auditService } from '../services/audit.service.js';

export const orderController = {

  /**
   * Un cliente crea un nuevo pedido.
   */
  create: async (req, res) => {
    try {
      const userId = req.user.id; // Obtenido del token JWT
      
      const { items, shippingInfo, shippingCost, total, orderId } = req.body; 

      if (!items || items.length === 0) {
        return res.status(400).json({ message: 'El pedido debe tener al menos un item' });
      }

      const newOrder = await orderService.create(userId, items, shippingInfo, shippingCost, total, orderId);
      res.status(201).json(newOrder);
      
    } catch (error) {
      console.error(error); 
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
   * Un Admin/Vendedor/Cliente obtiene UN pedido por ID.
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
      const { status } = req.body; 

      if (!status) {
        return res.status(400).json({ message: 'Se requiere un estado' });
      }

      // 1. Obtenemos el estado "antiguo" para el log
      const oldOrder = await orderService.findOne(id);
      if (!oldOrder) {
        return res.status(404).json({ message: 'Pedido no encontrado' });
      }

      // 2. Actualizamos el estado
      const updatedOrder = await orderService.updateStatus(id, status);

      // Registramos solo el cambio de estado
      await auditService.createLog(
        req.user.id,
        'ORDER_STATUS_UPDATE',
        'Order',
        updatedOrder.id,
        { old: { status: oldOrder.status }, new: { status: updatedOrder.status } }
      );

      res.status(200).json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el estado', error: error.message });
    }
  },
};
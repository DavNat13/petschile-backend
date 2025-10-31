// src/controllers/user.controller.js
import { userService } from '../services/user.service.js';

export const userController = {
  
  /**
   * Obtiene todos los usuarios (solo Admin)
   */
  getAll: async (req, res) => {
    try {
      const users = await userService.findAll();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
    }
  },

  /**
   * Obtiene un usuario por su ID (solo Admin)
   */
  getOne: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await userService.findOne(id);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el usuario', error: error.message });
    }
  },

  /**
   * Crea un nuevo usuario (solo Admin)
   */
  create: async (req, res) => {
    try {
      // (Aquí deberías usar un 'validateUser' middleware)
      const newUser = await userService.create(req.body);
      res.status(201).json(newUser);
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(409).json({ message: 'Error: El email o RUN ya están registrados.' });
      }
      res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
    }
  },

  /**
   * Actualiza un usuario (solo Admin)
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedUser = await userService.update(id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
    }
  },

  /**
   * Elimina un usuario (solo Admin)
   */
  remove: async (req, res) => {
    try {
      const { id } = req.params;
      await userService.remove(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el usuario', error: error.message });
    }
  },
};
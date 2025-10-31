// src/controllers/auth.controller.js
import { authService } from '../services/auth.service.js';

export const authController = {
  
  //Maneja el registro de un nuevo usuario.

  register: async (req, res) => {
    try {
      // El body ya fue validado por 'validateRegister' middleware
      const newUser = await authService.register(req.body);
      res.status(201).json({ message: 'Usuario registrado exitosamente', user: newUser });
    } catch (error) {
      // Error P2002 es el código de Prisma para "violación de restricción única"
      if (error.code === 'P2002') {
        return res.status(409).json({ message: 'Error: El email o RUN ya están registrados.' });
      }
      res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
  },

  /**
   * Maneja el inicio de sesión (login) de un usuario.
   */
  login: async (req, res) => {
    try {
      // El body ya fue validado por 'validateLogin' middleware
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      if (!result) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }
      
      // Enviamos el token y los datos del usuario (sin password)
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
  },

  /**
   * Devuelve el perfil del usuario actualmente autenticado (basado en el token JWT).
   */
  getProfile: async (req, res) => {
    // 'req.user' es adjuntado por el middleware 'checkJwt' (Passport)
    // Este endpoint es útil para que el frontend verifique si un token es válido
    // y obtenga los datos del usuario al cargar la app.
    res.status(200).json(req.user);
  },
};
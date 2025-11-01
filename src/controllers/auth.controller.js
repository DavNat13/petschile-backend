// src/controllers/auth.controller.js
import { authService } from '../services/auth.service.js';
import { asyncHandler } from '../utils/errorHandler.js'; // Asegúrate de importar tu asyncHandler

export const authController = {
  
  /**
   * Maneja el registro de un nuevo usuario.
   */
  register: asyncHandler(async (req, res) => {
    // El body ya fue validado por 'validateRegister' middleware
    const newUser = await authService.register(req.body);
    res.status(201).json({ message: 'Usuario registrado exitosamente', user: newUser });
  }),

  /**
   * Maneja el inicio de sesión (login) de un usuario.
   */
  login: asyncHandler(async (req, res) => {
    // El body ya fue validado por 'validateLogin' middleware
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    if (!result) {
      // Usamos un error estandarizado
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Enviamos el token y los datos del usuario (ya aplanados por el servicio)
    res.status(200).json(result);
  }),

  /**
   * Devuelve el perfil del usuario actualmente autenticado (basado en el token JWT).
   */
  getProfile: asyncHandler(async (req, res) => {

    // "Aplanamos" el objeto 'req.user' para que el frontend lo reciba
    // de forma consistente y fácil de usar.
    const userToReturn = {
      id: req.user.id,
      email: req.user.email,
      run: req.user.run,
      nombre: req.user.nombre,
      apellidos: req.user.apellidos,
      role: req.user.role.nombre, // Aplanamos el rol
      
      // Añadimos los campos que faltaban para "Mi Perfil"
      fechaNacimiento: req.user.fechaNacimiento,
      direccion: req.user.direccion,
      region: req.user.region, // Pasamos el objeto { nombre: '...' }
      comuna: req.user.comuna, // Pasamos el objeto { nombre: '...' }
    };
    
    // Enviamos el objeto APLANADO y COMPLETO al frontend.
    res.status(200).json(userToReturn);
  }),
};
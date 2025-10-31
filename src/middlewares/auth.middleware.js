// src/middlewares/auth.middleware.js
import passport from 'passport';

/**
 * 1. Middleware de Autenticación (AuthN)
 * Verifica si el token JWT enviado en el header 'Authorization' es válido.
 * Si es válido, adjunta los datos del usuario (del payload del token) a `req.user`.
 * Si no es válido o no existe, devuelve un error 401 Unauthorized.
 */
export const checkJwt = passport.authenticate('jwt', { session: false });

/**
 * 2. Middleware de Autorización (AuthZ)
 * Verifica si el usuario (ya validado por 'checkJwt') tiene el rol necesario.
 * ESTE MIDDLEWARE DEBE USARSE *DESPUÉS* DE 'checkJwt'.
 * * @param {string[]} roles - Un array de roles permitidos (ej. ['ADMIN', 'SELLER'])
 */
export const checkRole = (roles) => {
  return (req, res, next) => {
    // 'req.user' fue adjuntado por el middleware 'checkJwt'
    if (!req.user || !roles.includes(req.user.role.nombre)) {// El usuario está logueado, pero no tiene el rol correcto
      return res.status(403).json({ message: 'Acceso Prohibido: Rol insuficiente' });
    }
    // El usuario tiene el rol requerido, puede continuar
    next();
  }
};
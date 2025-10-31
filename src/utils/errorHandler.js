// src/utils/errorHandler.js

/**
 * Middleware de manejo de errores global.
 * Atrapa los errores y envía una respuesta JSON estandarizada.
 */
export const errorHandler = (err, req, res, next) => {
  console.error('--- ERROR NO MANEJADO ---');
  console.error('Ruta:', req.path);
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  console.error('--------------------------');
  
  // Si el error tiene un código de estado (ej. un error de validación), úsalo.
  // Si no, es un error inesperado del servidor (Error 500).
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    status: 'error',
    statusCode: statusCode,
    message: err.message || 'Error interno del servidor',
    // (Opcional: en desarrollo, puedes enviar el stack del error)
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};


/**
 * Un "wrapper" para controladores asíncronos.
 * Elimina la necesidad de escribir try...catch en cada controlador.
 * Simplemente envuelve la función de tu controlador con esto.
 *
 * Ejemplo de uso en product.routes.js:
 * router.get('/', asyncHandler(productController.getAll));
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    // Asegura que cualquier error en la función asíncrona
    // sea capturado y pasado al middleware 'errorHandler'.
    fn(req, res, next).catch(next);
  };
};

/**
 * Clase de Error Personalizada
 * Útil para crear errores con códigos de estado específicos
 * Ejemplo: throw new AppError('Producto no encontrado', 404);
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    // Captura el stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}
// src/middlewares/validation.middleware.js
import { body, validationResult } from 'express-validator';

/**
 * Middleware genérico que revisa los resultados de las validaciones.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// --- Cadenas de Validación para cada Ruta ---

/**
 * Valida los campos para el registro de un nuevo usuario.
 */
export const validateRegister = [
  body('email')
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Debe ser un formato de email válido'),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('run')
    .notEmpty().withMessage('El RUN es requerido'),
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido'),
  body('apellidos')
    .notEmpty().withMessage('Los apellidos son requeridos'),
  
  handleValidationErrors,
];

/**
 * Valida los campos para el inicio de sesión.
 */
export const validateLogin = [
  body('email')
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Debe ser un email válido'),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida'),
  
  handleValidationErrors,
];

/**
 * Valida los campos para crear/actualizar un producto.
 * (Usado en product.routes.js)
 */
export const validateProduct = [
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isString(),
  body('codigo')
    .notEmpty().withMessage('El código (SKU) es requerido'),
  body('precio')
    .isInt({ gt: 0 }).withMessage('El precio debe ser un número entero positivo'),
  body('stock')
    .isInt({ min: 0 }).withMessage('El stock debe ser 0 o un número positivo'),
  
  // --- ⭐️ AQUÍ ESTÁ LA CORRECCIÓN ⭐️ ---
  body('categoryId')
    .notEmpty().withMessage('El categoryId es requerido')
    .isInt({ gt: 0 }).withMessage('El categoryId debe ser un número entero positivo'),
  // ------------------------------------

  body('precioOferta')
    .optional() // Es opcional
    .isInt({ gt: 0 }).withMessage('El precio de oferta debe ser positivo'),
  body('stock_critico')
    .optional()
    .isInt({ min: 0 }).withMessage('El stock crítico debe ser 0 o más'),

  // --- Validación Opcional pero Recomendada para 3NF ---
  // Valida los campos *dentro* del objeto 'alimento.create' si este existe
  body('alimento.create.medidaKg')
    .optional() // Solo si 'alimento.create' existe
    .isInt({ gt: 0 }).withMessage('La medida (Kg) debe ser un número positivo'),
  
  body('alimento.create.brandId')
    .optional()
    .isInt({ gt: 0 }).withMessage('El brandId debe ser un número positivo'),
  
  // (Aquí añadirías .optional() para 'juguete.create', 'accesorio.create', etc.)
  
  handleValidationErrors,
];

/**
 * Valida los campos para crear/actualizar un usuario (por un Admin).
 */
export const validateUser = [
  body('email')
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Debe ser un formato de email válido'),
  body('run')
    .notEmpty().withMessage('El RUN es requerido'),
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido'),
  body('roleId') // Validamos el ID del rol, no el nombre
    .notEmpty().withMessage('El roleId es requerido')
    .isInt({ gt: 0 }).withMessage('El roleId debe ser un número'),
  
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),

  handleValidationErrors,
];

/**
 * Valida los campos para crear un pedido.
 */
export const validateOrder = [
  body('items')
    .isArray({ min: 1 }).withMessage('El pedido debe tener al menos un item'),
  body('total')
    .isInt({ gt: 0 }).withMessage('El total debe ser un número positivo'),
  body('shippingCost')
    .isInt({ min: 0 }).withMessage('El costo de envío debe ser 0 o más'),
  body('shippingInfo')
    .isObject().withMessage('La información de envío es requerida'),

  handleValidationErrors,
];

/**
 * Valida los campos para un post del blog.
 */
export const validateBlogPost = [
  body('title').notEmpty().withMessage('El título es requerido'),
  body('shortDescription').notEmpty().withMessage('La descripción corta es requerida'),
  body('longDescription').notEmpty().withMessage('El contenido es requerido'),
  
  handleValidationErrors,
];

/**
 * Valida el formulario de contacto.
 */
export const validateContactRequest = [
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('asunto').notEmpty().withMessage('El asunto es requerido'),
  body('mensaje').notEmpty().withMessage('El mensaje es requerido'),
  
  handleValidationErrors,
];

/**
 * Valida la actualización de estado de un pedido o solicitud.
 */
export const validateStatusUpdate = [
  body('status').notEmpty().withMessage('El estado es requerido').isString(),
  handleValidationErrors,
];
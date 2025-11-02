// src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import 'dotenv/config'; // Asegura que las variables de entorno se carguen

// Importaciones de tu proyecto
import mainRouter from './api/index.js';
import { jwtStrategy } from './config/passport.js';
import { errorHandler } from './utils/errorHandler.js';

// 1. CREAR LA APLICACIÓN EXPRESS
const app = express();

// --- 2. MIDDLEWARES GLOBALES ---

// Seguridad: Añade varias cabeceras HTTP de seguridad (XSS, etc.)
app.use(helmet());

// CORS: Permite peticiones SÓLO desde tu frontend de React
// (Asegúrate de cambiar esto a la URL de tu sitio desplegado en producción)
app.use(cors({ 
  origin: 'https://petschile.netlify.app'
}));

// Parsea el body de las peticiones JSON
app.use(express.json());

// Parsea el body de peticiones URL-encoded (formularios tradicionales)
app.use(express.urlencoded({ extended: true }));

// --- 3. CONFIGURACIÓN DE AUTENTICACIÓN (PASSPORT) ---
app.use(passport.initialize());
passport.use('jwt', jwtStrategy); // Le dice a Passport que use la estrategia JWT que creamos

// --- 4. RUTAS DE LA API ---
// Conecta tu router principal. Todas las rutas definidas en /api/index.js
// ahora estarán disponibles bajo el prefijo /api
// Ej: /api/products, /api/auth/login
app.use('/api', mainRouter);

// --- 5. MANEJADOR DE ERRORES GLOBAL ---
// Este DEBE ser el ÚLTIMO 'app.use()'
// Atrapa cualquier error pasado por next() en los 'asyncHandler'
app.use(errorHandler);

export default app;
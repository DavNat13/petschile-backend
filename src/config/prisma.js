// src/config/prisma.js
import { PrismaClient } from '@prisma/client';

// Creamos una única instancia global para usarla en toda la app
// Esto es una buena práctica para el rendimiento.
export const prisma = new PrismaClient();
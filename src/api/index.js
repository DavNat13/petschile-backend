// src/api/index.js
import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import userRoutes from './user.routes.js';
import orderRoutes from './order.routes.js';
import blogRoutes from './blog.routes.js';
import contactRoutes from './contact.routes.js';

const router = Router();

// Asigna un prefijo a cada grupo de rutas
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/users', userRoutes);
router.use('/orders', orderRoutes);
router.use('/blog', blogRoutes);
router.use('/contact', contactRoutes);

export default router;
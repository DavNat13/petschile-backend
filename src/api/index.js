// src/api/index.js
import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import userRoutes from './user.routes.js';
import orderRoutes from './order.routes.js';
import blogRoutes from './blog.routes.js';
import contactRoutes from './contact.routes.js';
import categoryRoutes from './category.routes.js';
import brandRoutes from './brand.routes.js';
import cartRoutes from './cart.routes.js';
import auditRoutes from './audit.routes.js';
import mediaRoutes from './media.routes.js';

const router = Router();

// Asigna un prefijo a cada grupo de rutas
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/users', userRoutes);
router.use('/orders', orderRoutes);
router.use('/blog', blogRoutes);
router.use('/contact', contactRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/cart', cartRoutes);
router.use('/audit', auditRoutes);
router.use('/media', mediaRoutes);

export default router;
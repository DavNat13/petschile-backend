// src/controllers/product.controller.js
import { productService } from '../services/product.service.js';
import { auditService } from '../services/audit.service.js';

export const productController = {
  
  /**
   * (PÚBLICO) Obtiene todos los productos (SOLO ACTIVOS)
   */
  getAll: async (req, res) => {
    try {
      const products = await productService.findAll();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener productos', error: error.message });
    }
  },

  /**
   * (PÚBLICO) Obtiene un producto por su 'codigo' (SKU) (SOLO ACTIVO)
   */
  getOne: async (req, res) => {
    try {
      const { id: codigo } = req.params; 
      const product = await productService.findOneByCodigo(codigo); 

      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
    }
  },

  // --- ¡AÑADIDO! ---
  /**
   * (ADMIN) Obtiene TODOS los productos (activos y archivados).
   */
  getAllForAdmin: async (req, res) => {
    try {
      const products = await productService.findAllForAdmin();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener productos de admin', error: error.message });
    }
  },
  // --- FIN DE ADICIÓN ---

  /**
   * Crea un nuevo producto.
   */
  create: async (req, res) => {
    try {
      const newProduct = await productService.create(req.body);

      await auditService.createLog(
        req.user.id,
        'PRODUCT_CREATE',
        'Product',
        newProduct.id,
        { new: newProduct }
      );

      res.status(201).json(newProduct);
    } catch (error) {
       if (error.code === 'P2002' && error.meta?.target?.includes('codigo')) {
        return res.status(409).json({ message: 'Error: El código (SKU) del producto ya existe.' });
      }
      res.status(500).json({ message: 'Error al crear el producto', error: error.message });
    }
  },

  /**
   * Actualiza un producto existente.
   */
  update: async (req, res) => {
    try {
      const { id } = req.params; // Este 'id' es el UUID
      
      const oldProduct = await productService.findOneById(id); 

      if (!oldProduct) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      const updatedProduct = await productService.update(id, req.body);

      await auditService.createLog(
        req.user.id,
        'PRODUCT_UPDATE',
        'Product',
        updatedProduct.id,
        { old: oldProduct, new: updatedProduct }
      );
      
      res.status(200).json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
    }
  },

  /**
   * Elimina (Archiva) un producto.
   */
  remove: async (req, res) => {
    try {
      const { id } = req.params; // Este 'id' es el UUID
      
      const productToArchive = await productService.findOneById(id); 

      if (!productToArchive) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      await productService.remove(id); // Llama al servicio de "archivar"

      await auditService.createLog(
        req.user.id,
        'PRODUCT_ARCHIVE', // <-- Log de "Archivar"
        'Product',
        id,
        { old: productToArchive } 
      );

      res.status(204).send();
    } catch (error) {
      // (El servicio ya nos da el error amigable si está en un pedido)
      res.status(500).json({ message: 'Error al archivar el producto', error: error.message });
    }
  },

  // --- ¡AÑADIDO! ---
  /**
   * Restaura un producto (cambia status a 'ACTIVE').
   */
  restore: async (req, res) => {
    try {
      const { id } = req.params; // Este 'id' es el UUID
      
      const productToRestore = await productService.findOneById(id); 
      if (!productToRestore) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      // 1. Llamamos al servicio de restauración
      const restoredProduct = await productService.restore(id);

      // 2. Creamos el log de auditoría
      await auditService.createLog(
        req.user.id,
        'PRODUCT_RESTORE', // <-- Nueva acción
        'Product',
        id,
        { old: productToRestore, new: restoredProduct }
      );

      res.status(200).json(restoredProduct);
    } catch (error) {
      res.status(500).json({ message: 'Error al restaurar el producto', error: error.message });
    }
  },
};
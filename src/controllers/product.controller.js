// src/controllers/product.controller.js
import { productService } from '../services/product.service.js';

export const productController = {
  
  /**
   * Obtiene todos los productos (con filtros opcionales de query)
   */
  getAll: async (req, res) => {
    try {
      // (Avanzado: Aquí podrías pasar req.query al service para filtrar/paginar)
      const products = await productService.findAll();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener productos', error: error.message });
    }
  },

  /**
   * Obtiene un producto por su ID.
   */
  getOne: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await productService.findOne(id);
      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
    }
  },

  /**
   * Crea un nuevo producto.
   */
  create: async (req, res) => {
    try {
      // El body fue validado por 'validateProduct'
      const newProduct = await productService.create(req.body);
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
      const { id } = req.params;
      const updatedProduct = await productService.update(id, req.body);
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      res.status(200).json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
    }
  },

  /**
   * Elimina un producto.
   */
  remove: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedProduct = await productService.remove(id);
      if (!deletedProduct) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      // 204 No Content es una respuesta estándar para DELETE exitoso
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
    }
  },
};
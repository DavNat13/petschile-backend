// src/controllers/blog.controller.js
import { blogService } from '../services/blog.service.js';
import { auditService } from '../services/audit.service.js';

export const blogController = {
  getAll: async (req, res) => {
    try {
      const posts = await blogService.findAll();
      res.status(200).json(posts);
    } catch (e) { res.status(500).json({ message: e.message }); }
  },
  
  getOne: async (req, res) => {
    try {
      const post = await blogService.findOne(req.params.id);
      res.status(200).json(post);
    } catch (e) { res.status(500).json({ message: e.message }); }
  },
  
  create: async (req, res) => {
    try {
      const newPost = await blogService.create(req.body);

      await auditService.createLog(
        req.user.id,
        'BLOG_CREATE',
        'BlogPost',
        newPost.id,
        { new: newPost }
      );

      res.status(201).json(newPost);
    } catch (e) { res.status(500).json({ message: e.message }); }
  },
  
  update: async (req, res) => {
    try {
      const { id } = req.params;

      // 1. Obtenemos el estado "antiguo"
      const oldPost = await blogService.findOne(id);

      // 2. Actualizamos
      const updatedPost = await blogService.update(id, req.body);

      await auditService.createLog(
        req.user.id,
        'BLOG_UPDATE',
        'BlogPost',
        updatedPost.id,
        { old: oldPost, new: updatedPost }
      );

      res.status(200).json(updatedPost);
    } catch (e) { res.status(500).json({ message: e.message }); }
  },
  
  remove: async (req, res) => {
    try {
      const { id } = req.params;

      // 1. Obtenemos el post que se va a eliminar
      const postToDelete = await blogService.findOne(id);

      // 2. Eliminamos
      await blogService.remove(id);

      await auditService.createLog(
        req.user.id,
        'BLOG_DELETE',
        'BlogPost',
        id,
        { old: postToDelete }
      );

      res.status(204).send();
    } catch (e) { res.status(500).json({ message: e.message }); }
  },
};
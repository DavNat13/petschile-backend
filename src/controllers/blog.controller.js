// src/controllers/blog.controller.js
import { blogService } from '../services/blog.service.js';

// Este CRUD es muy similar al de Productos
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
      res.status(201).json(newPost);
    } catch (e) { res.status(500).json({ message: e.message }); }
  },
  update: async (req, res) => {
    try {
      const updatedPost = await blogService.update(req.params.id, req.body);
      res.status(200).json(updatedPost);
    } catch (e) { res.status(500).json({ message: e.message }); }
  },
  remove: async (req, res) => {
    try {
      await blogService.remove(req.params.id);
      res.status(204).send();
    } catch (e) { res.status(500).json({ message: e.message }); }
  },
};
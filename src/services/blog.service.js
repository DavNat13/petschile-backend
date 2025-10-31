// src/services/blog.service.js
import { prisma } from '../config/prisma.js';

export const blogService = {
  findAll: async () => await prisma.blogPost.findMany({ orderBy: { date: 'desc' } }),
  findOne: async (id) => await prisma.blogPost.findUnique({ where: { id } }),
  create: async (data) => await prisma.blogPost.create({ data }),
  update: async (id, data) => await prisma.blogPost.update({ where: { id }, data }),
  remove: async (id) => await prisma.blogPost.delete({ where: { id } }),
};
// src/services/contact.service.js
import { prisma } from '../config/prisma.js';

export const contactService = {
  findAll: async () => await prisma.contactRequest.findMany({ orderBy: { fecha: 'desc' } }),
  create: async (data) => await prisma.contactRequest.create({ data }),
  updateStatus: async (id, status) => {
    return await prisma.contactRequest.update({
      where: { id },
      data: { estado: status },
    });
  },
  remove: async (id) => await prisma.contactRequest.delete({ where: { id } }),
};
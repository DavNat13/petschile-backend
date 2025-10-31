// src/services/user.service.js
import { prisma } from '../config/prisma.js';
import bcrypt from 'bcryptjs';

// Objeto de selección reutilizable para no exponer la contraseña
const userSelect = {
  id: true,
  email: true,
  run: true,
  nombre: true,
  apellidos: true,
  role: true,
  region: true,
  comuna: true,
  direccion: true,
  fechaNacimiento: true,
};

export const userService = {
  findAll: async () => {
    return await prisma.user.findMany({
      select: userSelect,
    });
  },

  findOne: async (id) => {
    return await prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
  },

  // (Este 'create' es para el Admin, 'authService.register' es para el público)
  create: async (data) => {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Asumimos que 'data.roleId' viene del formulario del admin
    return await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        run: data.run.replace(/\./g, '').replace(/-/g, ''),
      },
      select: userSelect,
    });
  },

  update: async (id, data) => {
    // Si se envía una nueva contraseña, hashearla.
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    
    return await prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });
  },

  remove: async (id) => {
    // Manejar eliminación en cascada (ej. Pedidos)
    // Prisma (con el schema 3NF) debería manejar esto si las relaciones están bien
    // pero para seguridad, borramos pedidos primero.
    await prisma.order.deleteMany({ where: { userId: id } });
    return await prisma.user.delete({ where: { id } });
  },
};
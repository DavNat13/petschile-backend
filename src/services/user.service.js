// src/services/user.service.js
import { prisma } from '../config/prisma.js';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/errorHandler.js'; 

// Hacemos 'export' para que auth.service.js pueda usarlo
export const userSelect = {
  id: true,
  email: true,
  run: true,
  nombre: true,
  apellidos: true,
  role: { select: { nombre: true } },
  region: { select: { nombre: true } },
  comuna: { select: { nombre: true } },
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

  create: async (data) => {
    const { role: roleName, region: regionName, comuna: comunaName, ...userData } = data;

    const role = await prisma.role.findUnique({
      where: { nombre: roleName || 'CLIENT' },
    });
    if (!role) {
      throw new AppError(`El rol "${roleName}" no existe.`, 400);
    }
    
    let regionId = null;
    let comunaId = null;

    if (regionName) {
      const region = await prisma.region.findUnique({ where: { nombre: regionName } });
      if (region) {
        regionId = region.id;
        if (comunaName) {
          const comuna = await prisma.comuna.findFirst({ where: { nombre: comunaName, regionId: region.id } });
          if (comuna) {
            comunaId = comuna.id;
          }
        }
      }
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    return await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        run: userData.run.replace(/\./g, '').replace(/-/g, ''),
        roleId: role.id,
        regionId: regionId, 
        comunaId: comunaId, 
      },
      select: userSelect,
    });
  },

  /**
   * ACTUALIZAR (Refactorizado para Perfil de Usuario)
   * (Esta función no cambia)
   */
  update: async (id, data) => {
    // 1. Separamos los campos
    const { 
      role: roleName, 
      region: regionName, 
      comuna: comunaName, 
      newPassword,
      run, 
      ...userData 
    } = data;
    
    const dataForUpdate = { ...userData };

    // 2. Lógica de Contraseña (simplificada)
    if (newPassword) {
      dataForUpdate.password = await bcrypt.hash(newPassword, 10);
    }

    // 3. Lógica de Rol (para el Admin)
    if (roleName) {
        const role = await prisma.role.findUnique({ where: { nombre: roleName } });
        if (!role) {
            throw new AppError(`El rol "${roleName}" no existe.`, 400);
        }
        dataForUpdate.roleId = role.id;
    }

    // 4. Lógica de Localización (Región/Comuna)
    if (regionName) {
      const region = await prisma.region.findUnique({ where: { nombre: regionName } });
      if (region) {
        dataForUpdate.regionId = region.id;
        if (comunaName) {
          const comuna = await prisma.comuna.findFirst({ where: { nombre: comunaName, regionId: region.id } });
          if (comuna) {
            dataForUpdate.comunaId = comuna.id;
          } else {
             dataForUpdate.comunaId = null; 
          }
        } else {
            dataForUpdate.comunaId = null; 
        }
      }
    } else {
      dataForUpdate.regionId = null;
      dataForUpdate.comunaId = null;
    }
    
    // 5. Actualizamos el usuario
    return await prisma.user.update({
      where: { id },
      data: dataForUpdate,
      select: userSelect, 
    });
  },

  remove: async (id) => {
    await prisma.cart.deleteMany({ where: { userId: id } });
    await prisma.order.deleteMany({ where: { userId: id } });
    return await prisma.user.delete({ where: { id } });
  },
};
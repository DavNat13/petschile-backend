// src/services/user.service.js
import { prisma } from '../config/prisma.js';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/errorHandler.js'; // Importamos nuestro error personalizado

// Objeto de selección reutilizable para no exponer la contraseña
const userSelect = {
  id: true,
  email: true,
  run: true,
  nombre: true,
  apellidos: true,
  // Incluimos los objetos relacionados completos
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

  // (El 'create' es para el Admin, 'authService.register' es para el público)
  create: async (data) => {
    const { role: roleName, region: regionName, comuna: comunaName, ...userData } = data;

    // --- Lógica de Rol ---
    const role = await prisma.role.findUnique({
      where: { nombre: roleName || 'CLIENT' },
    });
    if (!role) {
      throw new AppError(`El rol "${roleName}" no existe.`, 400);
    }
    
    // --- Lógica de Localización (Igual a la de 'update') ---
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
        regionId: regionId, // Guardamos el ID
        comunaId: comunaId, // Guardamos el ID
      },
      select: userSelect,
    });
  },

  /**
   * ACTUALIZAR (Refactorizado para Perfil de Usuario)
   */
  update: async (id, data) => {
    // 1. Separamos los campos que requieren lógica especial
    const { 
      role: roleName, 
      region: regionName, 
      comuna: comunaName, 
      currentPassword, 
      newPassword,
      run, // Descartamos 'run' (no se puede cambiar)
      ...userData // El resto (nombre, apellidos, email, direccion, etc.)
    } = data;
    
    const dataForUpdate = { ...userData };

    // 2. Lógica de Contraseña
    if (newPassword) {
      if (!currentPassword) {
        throw new AppError('Debes proporcionar tu contraseña actual para cambiarla.', 400);
      }
      // Buscamos al usuario (solo necesitamos la contraseña)
      const user = await prisma.user.findUnique({ where: { id }, select: { password: true } });
      if (!user) {
        throw new AppError('Usuario no encontrado', 404);
      }
      // Comparamos la contraseña actual
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new AppError('La contraseña actual es incorrecta.', 401); // 401 Unauthorized
      }
      // Si coinciden, hasheamos la nueva contraseña
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
        // Solo buscamos comuna si la región es válida
        if (comunaName) {
          const comuna = await prisma.comuna.findFirst({ where: { nombre: comunaName, regionId: region.id } });
          if (comuna) {
            dataForUpdate.comunaId = comuna.id;
          } else {
             dataForUpdate.comunaId = null; // Resetea la comuna si no se encuentra
          }
        } else {
            dataForUpdate.comunaId = null; // Resetea la comuna si se borró
        }
      }
    } else {
      // Si la región se envía vacía, reseteamos ambas
      dataForUpdate.regionId = null;
      dataForUpdate.comunaId = null;
    }
    
    // 5. Actualizamos el usuario
    return await prisma.user.update({
      where: { id },
      data: dataForUpdate,
      select: userSelect, // Devolvemos el usuario actualizado y formateado
    });
  },

  remove: async (id) => {
    // (Borrado en cascada para Pedidos y Carrito)
    await prisma.cart.deleteMany({ where: { userId: id } });
    await prisma.order.deleteMany({ where: { userId: id } });
    return await prisma.user.delete({ where: { id } });
  },
};
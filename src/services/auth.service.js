// src/services/auth.service.js
import { prisma } from '../config/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { userSelect } from './user.service.js'; 


export const authService = {
  /**
   * Registra un nuevo usuario en la base de datos.
   * (Esta función no cambia)
   */
  register: async (data) => {
    // 1. Hashear la contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 2. Limpiar el RUN (quitar puntos y guion)
    const cleanRun = data.run.replace(/\./g, '').replace(/-/g, '');

    // 3. Obtener el ID del rol "CLIENT"
    const clientRole = await prisma.role.findUnique({
      where: { nombre: 'CLIENT' },
    });
    
    if (!clientRole) {
      throw new Error('Rol "CLIENT" no encontrado. Debes poblar la base de datos.');
    }

    // 4. Crear el usuario
    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        run: cleanRun,
        nombre: data.nombre,
        apellidos: data.apellidos,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
        direccion: data.direccion,
        roleId: clientRole.id, 
        regionId: data.regionId ? parseInt(data.regionId) : null,
        comunaId: data.comunaId ? parseInt(data.comunaId) : null,
      },
      select: userSelect, // Devuelve solo los campos seguros
    });
    
    return newUser;
  },

  /**
   * Valida las credenciales del usuario y devuelve un token JWT si son correctas.
   */
  login: async (email, password) => {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        ...userSelect,   
        password: true,  
      },
    });

    if (!user) {
      return null; // Usuario no encontrado
    }

    //  Comparar la contraseña enviada con la hasheada en la BD
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return null; // Contraseña incorrecta
    }

    // Si todo es correcto, crear el payload para el token (ligero)
    // (El payload del token sigue siendo ligero, solo lo esencial)
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role.nombre, 
    };

    //   Firmar el token JWT
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '8h' } 
    );
    // Devolvemos el token y el objeto de usuario COMPLETO
    // Eliminamos la contraseña hasheada antes de devolverla
    delete user.password; 
    
    // Devolvemos el objeto 'user' completo que obtuvimos de 'userSelect'
    return { token, user };
  },
};
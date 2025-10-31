// src/services/auth.service.js
import { prisma } from '../config/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

// Objeto de selección para no devolver NUNCA la contraseña
// y seleccionar los campos relacionados que queremos
const userSelect = {
  id: true,
  email: true,
  run: true,
  nombre: true,
  apellidos: true,
  fechaNacimiento: true,
  direccion: true,
  // Incluimos los objetos relacionados por su ID
  region: {
    select: {
      id: true,
      nombre: true,
    },
  },
  comuna: {
    select: {
      id: true,
      nombre: true,
    },
  },
  role: {
    select: {
      id: true,
      nombre: true,
    },
  },
};

export const authService = {
  /**
   * Registra un nuevo usuario en la base de datos.
   * Hashea la contraseña antes de guardarla.
   */
  register: async (data) => {
    // 1. Hashear la contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 2. Limpiar el RUN (quitar puntos y guion)
    const cleanRun = data.run.replace(/\./g, '').replace(/-/g, '');

    // 3. Obtener el ID del rol "CLIENT"
    // (En una app real, esto podría estar en caché)
    const clientRole = await prisma.role.findUnique({
      where: { nombre: 'CLIENT' },
    });
    
    if (!clientRole) {
      // Esto solo debería pasar si el seeding falló
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
        // Conectar con las tablas relacionadas usando sus IDs
        roleId: clientRole.id, // Asigna el ID del rol
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
    // 1. Encontrar al usuario por email e incluir su rol
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }, // Incluye la info del rol
    });

    if (!user) {
      return null; // Usuario no encontrado
    }

    // 2. Comparar la contraseña enviada con la hasheada en la BD
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return null; // Contraseña incorrecta
    }

    // 3. Si todo es correcto, crear el payload para el token
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role.nombre, // Usamos el nombre del rol (ej. "ADMIN")
    };

    // 4. Firmar el token JWT
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '8h' } // El token expira en 8 horas
    );

    // 5. Devolver el token y los datos del usuario (sin contraseña)
    // Seleccionamos los campos seguros para devolver
    const userToReturn = {
      id: user.id,
      email: user.email,
      run: user.run,
      nombre: user.nombre,
      apellidos: user.apellidos,
      role: user.role.nombre,
    };
    
    return { token, user: userToReturn };
  },
};
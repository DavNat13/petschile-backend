// src/config/passport.js
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { prisma } from './prisma.js';
import 'dotenv/config'; // Carga el .env para acceder a JWT_SECRET

// Opciones para la estrategia JWT
const options = {
  // Extrae el token del header 'Authorization' como 'Bearer <token>'
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  
  // Clave secreta para verificar la firma del token (debe ser la misma que usaste para firmarlo)
  secretOrKey: process.env.JWT_SECRET,
};

// Esta estrategia se usará en el middleware 'checkJwt'
export const jwtStrategy = new JwtStrategy(options, async (payload, done) => {
  try {
    // 'payload' es el JWT decodificado (contiene id, email, role)
    // Buscamos al usuario en la BD usando el ID del payload
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      // Solo seleccionamos los datos seguros para adjuntar a la petición
      select: { id: true, email: true, role: true, run: true, nombre: true } 
    });

    if (user) {
      // Usuario encontrado y válido. Se adjunta a 'req.user'
      return done(null, user);
    } else {
      // Usuario no encontrado (ej. fue eliminado después de emitir el token)
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
});
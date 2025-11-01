// src/config/passport.js
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { prisma } from './prisma.js';
import 'dotenv/config'; 

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

export const jwtStrategy = new JwtStrategy(options, async (payload, done) => {
  try {
    // 'payload' es el JWT decodificado (id, email, role)
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      
      // --- ¡ESTA ES LA CORRECCIÓN! ---
      // Ahora pedimos todos los campos que el UserProfilePage necesita
      select: { 
        id: true, 
        email: true, 
        run: true, 
        nombre: true, 
        apellidos: true,
        fechaNacimiento: true,
        direccion: true,
        // Incluimos los objetos de relación completos
        role: { select: { nombre: true } },
        region: { select: { nombre: true } },
        comuna: { select: { nombre: true } }
      } 
    });

    if (user) {
      // 'user' ahora es un objeto anidado completo
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
});
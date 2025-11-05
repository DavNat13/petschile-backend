// src/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config'; // Asegura que las variables de entorno se carguen

// Configura Cloudinary con las credenciales de tu archivo .env
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Nos aseguramos de que todas las URLs generadas sean https
});

// Exportamos la instancia configurada para usarla en nuestros servicios
export default cloudinary;
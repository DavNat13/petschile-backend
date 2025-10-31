// src/server.js
import app from './app.js';

// process.env.PORT viene del archivo .env que creaste
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo exitosamente en http://localhost:${PORT}`);
});
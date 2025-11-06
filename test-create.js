// Importamos tu instancia de prisma
import { prisma } from './src/config/prisma.js';

// Copiamos el payload EXACTO de tu log, pero con un SKU aleatorio
const testPayload = {
  codigo: `TEST-${Math.floor(Math.random() * 10000)}`, // SKU único para la prueba
  nombre: 'Producto de Prueba (test-create.js)',
  descripcion: 'Prueba de aislamiento de Prisma',
  precio: 9990,
  precioOferta: null,
  stock: 100,
  stock_critico: 10,
  imagenes: [],
  categoryId: 4, // Usando la misma categoría 'Higiene'
  brand: {
    connectOrCreate: {
      where: { nombre: 'Marca De Prueba' },
      create: { nombre: 'Marca De Prueba' },
    },
  },
  higiene: { 
    create: { contenidoNeto: '500ml', tipoMascota: 'Perro/Gato' } 
  }
};

async function main() {
  console.log('--- 🚀 INICIANDO PRUEBA DE AISLAMIENTO ---');
  console.log('Intentando crear producto con este payload:');
  console.dir(testPayload, { depth: null });

  try {
    const newProduct = await prisma.product.create({
      data: testPayload,
    });
    
    console.log('\n--- ✅ ÉXITO ---');
    console.log('Producto creado exitosamente:');
    console.dir(newProduct, { depth: null });

  } catch (error) {
    console.log('\n--- ❌ FALLO ---');
    console.log('La creación de Prisma falló:');
    console.error(error); // Imprime el error completo
  } finally {
    await prisma.$disconnect();
  }
}

main();
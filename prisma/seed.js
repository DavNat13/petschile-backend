// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Datos de locaciones extraídos de tu archivo 'locations.js'
const regionesYComunas = {
    "Región de Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
    "Región de Tarapacá": ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"],
    "Región de Antofagasta": ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama", "Tocopilla", "María Elena"],
    "Región de Atacama": ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"],
    "Región de Coquimbo": ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paiguano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"],
    "Región de Valparaíso": ["Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero", "Viña del Mar", "Isla de Pascua", "Los Andes", "Calle Larga", "Rinconada", "San Esteban", "La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar", "Quillota", "Calera", "Hijuelas", "La Cruz", "Nogales", "San Antonio", "Algarrobo", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo", "San Felipe", "Catemu", "Llaillay", "Panquehue", "Putaendo", "Santa María", "Limache", "Olmué", "Quilpué", "Villa Alemana"],
    "Región Metropolitana de Santiago": ["Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "Santiago", "San Joaquín", "San Miguel", "San Ramón", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "Colina", "Lampa", "Tiltil", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"],
    "Región del Libertador Gral. Bernardo O’Higgins": ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente", "Pichilemu", "La Estrella", "Litueche", "Marchihue", "Navidad", "Paredones", "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"],
    "Región del Maule": ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Cauquenes", "Chanco", "Pelluhue", "Retiro", "Parral", "Colbún", "Linares", "Longaví", "San Javier", "Villa Alegre", "Yerbas Buenas", "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén"],
    "Región de Ñuble": ["Cobquecura", "Coelemu", "Ninhue", "Portezuelo", "Quirihue", "Ránquil", "Treguaco", "Bulnes", "Chillán Viejo", "Chillán", "El Carmen", "Pemuco", "Pinto", "Quillón", "San Ignacio", "Yungay", "Coihueco", "Ñiquén", "San Carlos", "San Fabián", "San Nicolás"],
    "Región del Biobío": ["Concepción", "Coronel", "Chiguayante", "Florida", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Hualpén", "Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa", "Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel", "Alto Biobío"],
    "Región de La Araucanía": ["Temuco", "Carahue", "Cholchol", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"],
    "Región de Los Ríos": ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"],
    "Región de Los Lagos": ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Llanquihue", "Maullín", "Puerto Varas", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao"],
    "Región de Aysén del Gral. Carlos Ibáñez del Campo": ["Coihaique", "Lago Verde", "Aisén", "Cisnes", "Guaitecas", "Cochrane", "O’Higgins", "Tortel", "Chile Chico", "Río Ibáñez"],
    "Región de Magallanes y la Antártica Chilena": ["Punta Arenas", "Laguna Blanca", "San Gregorio", "Río Verde", "Cabo de Hornos (Ex-Navarino)", "Antártica", "Porvenir", "Primavera", "Timaukel", "Natales", "Torres del Paine"]
};

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando el seeding...');

  // --- 1. Crear Roles ---
  console.log('Creando roles...');
  await prisma.role.createMany({
    data: [
      { nombre: 'CLIENT' },
      { nombre: 'SELLER' },
      { nombre: 'ADMIN' },
    ],
    skipDuplicates: true, // No falla si ya existen
  });
  
  // Obtener el ID del rol de ADMIN
  const adminRole = await prisma.role.findUnique({
    where: { nombre: 'ADMIN' },
  });

  if (!adminRole) {
    console.error('Error: No se pudo encontrar el rol "ADMIN". Abortando seeding de admin.');
    return;
  }

  // --- 2. Crear Usuario Administrador ---
  console.log('Creando usuario admin...');
  const adminEmail = 'admin.petschile@duoc.cl';
  const adminRun = '74137034-4';

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {}, // No hacer nada si ya existe
    create: {
      email: adminEmail,
      run: adminRun,
      nombre: 'Admin',
      apellidos: 'PetsChile',
      password: await bcrypt.hash('admin123', 10), // Hashear contraseña
      roleId: adminRole.id, // Asignar el ID del rol ADMIN
    },
  });

  // --- 3. Crear Categorías ---
  console.log('Creando categorías...');
  await prisma.category.createMany({
    data: [
      { nombre: 'Alimentos' },
      { nombre: 'Juguetes' },
      { nombre: 'Accesorios' },
      { nombre: 'Higiene' },
    ],
    skipDuplicates: true,
  });

  // --- 4. Crear Marcas (Ejemplo) ---
  console.log('Creando marcas...');
  await prisma.brand.createMany({
    data: [
      { nombre: 'Master Dog' },
      { nombre: 'Pro Plan' },
      { nombre: 'Royal Canin' },
      { nombre: 'Kong' },
    ],
    skipDuplicates: true,
  });

  // --- 5. Crear TODAS las Regiones y Comunas ---
  console.log('Creando todas las regiones y comunas de Chile...');
  
  // Usamos un bucle for...of para poder usar 'await' dentro
  for (const [regionNombre, comunasArray] of Object.entries(regionesYComunas)) {
    
    // Crea o actualiza la región y obtiene su ID
    const region = await prisma.region.upsert({
      where: { nombre: regionNombre },
      update: {},
      create: { nombre: regionNombre },
    });
    
    // Prepara el array de datos de comunas para esta región
    const comunasData = comunasArray.map(comunaNombre => ({
      nombre: comunaNombre,
      regionId: region.id, // Asigna el ID de la región recién creada/obtenida
    }));
    
    // Inserta todas las comunas de esta región
    await prisma.comuna.createMany({
      data: comunasData,
      skipDuplicates: true, // Evita errores si la comuna ya existe
    });
  }
  console.log('Regiones y comunas creadas.');


  console.log('Seeding completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Cierra la conexión de Prisma
    await prisma.$disconnect();
  });
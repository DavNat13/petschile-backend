# PetsChile v3 - API Backend
<p align="left">
  <img src="https://img.shields.io/badge/estado-en_desarrollo-blue.svg" alt="Estado del proyecto">
  <img src="https://img.shields.io/badge/language-JavaScript-F7DF1E?style=flat&logo=javascript" alt="Lenguaje principal JavaScript">  
  <img src="https://img.shields.io/badge/framework-Node.js-green?logo=nodedotjs" alt="Framework Node.js">
  <img src="https://img.shields.io/badge/framework-Express-lightgrey?logo=express" alt="Framework Express">
</p>
Este repositorio contiene la API RESTful de backend para el proyecto "Pets Chile v3". API reemplaza la lógica de `localStorage` del frontend (v2) por un servidor Node.js robusto, una base de datos PostgreSQL y un sistema de autenticación JWT.

Este backend está diseñado para ser consumido por el proyecto `PetsChile-Frontend`.

## ✨ Características Principales

- **Arquitectura Desacoplada:** Backend 100% independiente del frontend.
- **API RESTful:** Endpoints claros para todas las operaciones CRUD.
- **Base de Datos Relacional:** Esquema 3NF (Tercera Forma Normal) implementado con **Prisma** y **PostgreSQL**.
- **Autenticación y Autorización:**
  - Registro de usuarios con hasheo de contraseñas (`bcrypt.js`).
  - Login con generación de **JSON Web Tokens (JWT)**.
  - Rutas protegidas y guardias de roles (`CLIENT`, `SELLER`, `ADMIN`) usando `passport.js`.
- **Validación de Datos:** Validación de `req.body` en todos los endpoints de creación/actualización usando `express-validator`.
- **Estructura Profesional:** Código organizado por capas (Rutas, Controladores, Servicios, Middlewares).

## 🚀 Stack Tecnológico

<p align="left">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=nodejs,express,js,prisma,postgresql,docker,postman" />
  </a>
</p>

- **Framework:** [Node.js](https://nodejs.org/) con [Express](https://expressjs.com/)
- **Lenguaje:** JavaScript (ES Modules)
- **Base de Datos:** [PostgreSQL](https://www.postgresql.org/) (gestionada con [Docker](https://www.docker.com/))
- **ORM:** [Prisma](https://www.prisma.io/) (Para consultas seguras y migraciones)
- **Autenticación:** [Passport.js](http://www.passportjs.org/) (estrategias `passport-jwt` y `passport-local`), [JWT](https://jwt.io/), [Bcrypt.js](https://www.npmjs.com/package/bcryptjs)
- **Validación:** [express-validator](https://express-validator.github.io/)
- **Seguridad:** [Helmet](https://helmetjs.github.io/), [CORS](https://www.npmjs.com/package/cors)
- **Herramientas de Desarrollo:** [Nodemon](https://nodemon.io/)

## 📂 Estructura del Proyecto

<details>
<summary>Haz clic para expandir la estructura de archivos</summary>

La arquitectura sigue una estricta separación de responsabilidades:

```yaml
/PetsChile-Backend
├── 📂 prisma/
│   ├── 📄 schema.prisma     # Define TODOS los modelos de la BD (3NF)
│   ├── 📄 seed.js           # Script para poblar la BD con datos iniciales
│   └── 📂 migrations/
├── 📂 src/
│   ├── 📂 api/              # (ROUTERS) Define los endpoints
│   │   ├── 📄 auth.routes.js
│   │   ├── 📄 product.routes.js
│   │   ├── 📄 user.routes.js
│   │   ├── 📄 order.routes.js
│   │   └── 📄 index.js         # Router principal
│   │
│   ├── 📂 config/           # (CONFIG) Configuración central
│   │   ├── 📄 passport.js    # Configura la estrategia JWT
│   │   └── 📄 prisma.js      # Instancia única del cliente Prisma
│   │
│   ├── 📂 controllers/      # (CONTROLLERS) Maneja (req, res)
│   │   ├── 📄 auth.controller.js
│   │   ├── 📄 product.controller.js
│   │   └── 📄 ...
│   │
│   ├── 📂 middlewares/      # (MIDDLEWARES) Seguridad y Validación
│   │   ├── 📄 auth.middleware.js # checkJwt, checkRole
│   │   └── 📄 validation.middleware.js # validateProduct, etc.
│   │
│   ├── 📂 services/         # (SERVICES) Lógica de negocio, habla con la BD
│   │   ├── 📄 auth.service.js    # Lógica de login/registro
│   │   ├── 📄 product.service.js # Lógica de productos
│   │   └── 📄 ...
│   │
│   ├── 📂 utils/            # (UTILS) Utilidades
│   │   └── 📄 errorHandler.js  # Manejador de errores global
│   │
│   ├── 📄 app.js             # Carga de Express y middlewares
│   └── 📄 server.js          # Inicia el servidor
│
├── ⚙️ .env                   # (IGNORADO POR GIT) Guarda secretos
├── ⚙️ .gitignore             # Ignora node_modules, .env, etc.
├── 📄 LICENSE.md            # Tu licencia CC BY-NC-SA 4.0
├── 📄 package-lock.json
├── 📄 package.json
└── ⚙️ README.md              # Este archivo
```
</details>

## ⚙️ Cómo Ejecutar el Backend Localmente

Para clonar y correr esta API, necesitarás [Node.js](https://nodejs.org/en/download/) (v18+), [Docker Desktop](https://www.docker.com/products/docker-desktop/) y [Git](https://git-scm.com/downloads) instalados.

1.  **Clona el repositorio:**

    ```bash
    git clone [https://github.com/TuUsuario/petschile-backend.git](https://github.com/TuUsuario/petschile-backend.git)
    ```

2.  **Navega a la carpeta del proyecto:**

    ```bash
    cd petschile-backend
    ```

3.  **Instala las dependencias:**

    ```bash
    npm install
    ```

4.  **Inicia Docker Desktop:**
    * Asegúrate de que Docker Desktop esté abierto y corriendo.

5.  **Crea la Base de Datos PostgreSQL:**
    * Este comando creará y correrá un contenedor Docker con tu base de datos:

    ```bash
    docker run --name pets-db -e POSTGRES_PASSWORD=mysecretpassword -e POSTGRES_USER=petsuser -e POSTGRES_DB=petsdb -p 5432:5432 -d postgres
    ```
    *(Nota: Si ya lo creaste, puedes iniciarlo con `docker start pets-db`)*

6.  **Crea el archivo `.env`:**
    * Crea un archivo `.env` en la raíz (`petschile-backend/.env`) y pega el siguiente contenido:

    ```env
    DATABASE_URL="postgresql://petsuser:mysecretpassword@localhost:5432/petsdb?schema=public"
    JWT_SECRET="CAMBIA-ESTO-POR-UNA-FRASE-SECRETA-MUY-LARGA-Y-ALEATORIA"
    PORT=3000
    ```

7.  **Ejecuta la Migración y el Seeding:**
    * Este comando aplica el `schema.prisma` a tu base de datos (crea las tablas) y luego ejecuta el `seed.js` (puebla los roles, admin, regiones, etc.).

    ```bash
    npx prisma migrate dev --name init
    npx prisma db seed
    ```

8.  **Inicia el servidor de desarrollo:**

    ```bash
    npm run dev
    ```

9.  Tu API ahora está corriendo en `http://localhost:3000`.

## 🧪 Pruebas con Postman

Puedes usar [Postman](https://www.postman.com/) para probar todos los endpoints:

* **`POST /api/auth/login`**: Para obtener un token JWT (usa `admin.petschile@duoc.cl` y `admin123` para probar el rol de Admin).
* **`GET /api/products`**: Obtiene todos los productos (ruta pública).
* **`POST /api/products`**: Crea un nuevo producto (ruta protegida por Admin/Seller).
    * Recuerda añadir el token JWT en la pestaña **Authorization** > **Bearer Token**.

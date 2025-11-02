# PetsChile - API Backend (Full-Stack)
<p align="left">
  <img src="https://img.shields.io/badge/estado-completado_y_desplegado-brightgreen.svg" alt="Estado del proyecto">
  <img src="https://img.shields.io/badge/language-JavaScript-F7DF1E?style=flat&logo=javascript" alt="Lenguaje principal JavaScript">  
  <img src="https://img.shields.io/badge/framework-Node.js-green?logo=nodedotjs" alt="Framework Node.js">
  <img src="https://img.shields.io/badge/ORM-Prisma-blueviolet?logo=prisma" alt="ORM Prisma">
  <img src="https://img.shields.io/badge/Database-PostgreSQL-blue?logo=postgresql" alt="Base de Datos PostgreSQL">
</p>

Este repositorio contiene la API RESTful de backend para el proyecto "Pets Chile". Esta API reemplaza la lógica de `localStorage` por un servidor Node.js robusto, una base de datos PostgreSQL y un sistema de autenticación JWT.

Este backend está desplegado y actualmente da servicio al frontend en **[petschile.netlify.app](https://petschile.netlify.app)**.

## 🌐 URLs de Producción

* **Frontend (Netlify):** `https://petschile.netlify.app`
* **Backend (Render):** `https://petschile-backend.onrender.com/api`

---

## ✨ Características Principales

- **Arquitectura Desacoplada:** Backend 100% independiente del frontend.
- **API RESTful:** Endpoints claros para todas las operaciones CRUD.
- **Base de Datos Relacional:** Esquema 3NF implementado con **Prisma** y **PostgreSQL** (desplegado en **Neon**).
- **Autenticación y Autorización:**
  - Registro de usuarios con hasheo de contraseñas (`bcrypt.js`).
  - Login con generación de **JSON Web Tokens (JWT)**.
  - Rutas protegidas (`checkJwt`) y guardias de roles (`CLIENT`, `SELLER`, `ADMIN`) usando `passport-jwt`.
- **Gestión de Carrito de Compras:** Lógica de carrito 100% en el backend (`/api/cart`), vinculada al usuario autenticado.
- **Transacciones Atómicas:** La creación de pedidos (`/api/orders`) descuenta el stock de productos usando una transacción de Prisma (`$transaction`) para garantizar la integridad de los datos.
- **Validación de Datos:** Middlewares de validación para `req.body` en los endpoints principales (`validation.middleware.js`).
- **Estructura Profesional:** Código organizado por capas (Rutas, Controladores, Servicios, Middlewares).

---

## 🚀 Stack Tecnológico

### Stack Principal
<p align="left">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=nodejs,express,js,prisma,postgresql,postman" />
  </a>
</p>

- **Framework:** [Node.js](https://nodejs.org/) con [Express](https://expressjs.com/)
- **Lenguaje:** JavaScript (ES Modules)
- **Base de Datos:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Prisma](https://www.prisma.io/) (Para consultas seguras, migraciones y seeding)
- **Autenticación:** [Passport.js](http://www.passportjs.org/) (estrategia `passport-jwt`), [JWT](https://jwt.io/), [Bcrypt.js](https://www.npmjs.com/package/bcryptjs)
- **Seguridad:** [Helmet](https://helmetjs.github.io/), [CORS](https://www.npmjs.com/package/cors)

### Stack de Despliegue (Producción)
- **Servidor (Web Service):** [Render](https://render.com/)
- **Base de Datos (PostgreSQL):** [Neon](https://neon.tech/)

---

## 📂 Estructura del Proyecto

<details>
<summary>Haz clic para expandir la estructura de archivos</summary>

La arquitectura sigue una estricta separación de responsabilidades:
```yaml
/petschile-backend
├── 📂 prisma/
│   ├── 📄 schema.prisma     # Modelo de datos (la "verdad absoluta")
│   └── 📄 seed.js           # Script para poblar la BD (roles, admin, comunas)
│
├── 📂 src/
│   ├── 📂 api/              # (ROUTERS) Define los endpoints de la API
│   │   ├── 📄 auth.routes.js     # /api/auth (Login, Register, Profile)
│   │   ├── 📄 blog.routes.js     # /api/blog (CRUD Blog)
│   │   ├── 📄 brand.routes.js    # /api/brands (GET Marcas)
│   │   ├── 📄 cart.routes.js     # /api/cart (CRUD Carrito)
│   │   ├── 📄 category.routes.js # /api/categories (GET Categorías)
│   │   ├── 📄 contact.routes.js  # /api/contact (CRUD Solicitudes)
│   │   ├── 📄 order.routes.js    # /api/orders (CRUD Pedidos)
│   │   ├── 📄 product.routes.js  # /api/products (CRUD Productos)
│   │   ├── 📄 user.routes.js     # /api/users (CRUD Usuarios - Admin)
│   │   └── 📄 index.js         # Router principal (une todas las rutas)
│   │
│   ├── 📂 config/           # (CONFIG) Configuración central
│   │   ├── 📄 passport.js    # Configura la estrategia JWT
│   │   └── 📄 prisma.js      # Instancia única del cliente Prisma
│   │
│   ├── 📂 controllers/      # (CONTROLLERS) Maneja (req, res) y llama a los servicios
│   │   ├── 📄 auth.controller.js
│   │   ├── 📄 blog.controller.js
│   │   ├── 📄 brand.controller.js
│   │   ├── 📄 cart.controller.js
│   │   ├── 📄 category.controller.js
│   │   ├── 📄 contact.controller.js
│   │   ├── 📄 order.controller.js
│   │   ├── 📄 product.controller.js
│   │   └── 📄 user.controller.js
│   │
│   ├── 📂 middlewares/      # (MIDDLEWARES) Se ejecutan antes de los controladores
│   │   ├── 📄 auth.middleware.js # checkJwt (autenticación), checkRole (autorización)
│   │   └── 📄 validation.middleware.js # validateLogin, validateProduct, etc.
│   │
│   ├── 📂 services/         # (SERVICES) Lógica de negocio pura (habla con la BD)
│   │   ├── 📄 auth.service.js
│   │   ├── 📄 blog.service.js
│   │   ├── 📄 cart.service.js
│   │   ├── 📄 categoryBrand.service.js
│   │   ├── 📄 contact.service.js
│   │   ├── 📄 order.service.js
│   │   ├── 📄 product.service.js
│   │   └── 📄 user.service.js
│   │
│   ├── 📂 utils/            # (UTILS) Funciones de ayuda
│   │   └── 📄 errorHandler.js  # Manejador de errores global y asyncHandler
│   │
│   ├── 📄 app.js             # Carga de Express, middlewares globales (CORS, Helmet) y rutas
│   └── 📄 server.js          # Inicia el servidor (app.listen)
│
├── ⚙️ .env                   # (IGNORADO POR GIT) Guarda secretos (DATABASE_URL, JWT_SECRET)
├── ⚙️ .gitignore
├── 📄 package.json
└── 📄 README.md
```
</details>

---

## ⚙️ Variables de Entorno

Para ejecutar este proyecto, necesitas crear un archivo `.env` en la raíz del backend (`petschile-backend/.env`).

```env
# URL de conexión a tu base de datos PostgreSQL
# 1. Ejemplo Local (Docker):
DATABASE_URL="postgresql://petsuser:mysecretpassword@localhost:5432/petsdb?schema=public"
# 2. Ejemplo Producción (Neon):
# DATABASE_URL="postgresql://USER:PASSWORD@HOST.aws.neon.tech/DBNAME?sslmode=require"

# Secreto para firmar los JSON Web Tokens
JWT_SECRET="CAMBIA-ESTO-POR-UNA-FRASE-SECRETA-MUY-LARGA-Y-ALEATORIA"

# Puerto (Opcional, por defecto 3000)
PORT=3000
```

**Importante para Producción (Neon):** La URL de la base de datos de Neon **debe** incluir `?sslmode=require` al final para que Prisma pueda conectarse de forma segura.

## 💻 Cómo Ejecutar Localmente (con Docker)
Para clonar y correr esta API, necesitarás [Node.js](https://nodejs.org/en/download/) (v18+), [Docker Desktop](https://www.docker.com/products/docker-desktop/) y [Git](https://git-scm.com/downloads) instalados.

1.  **Clona el repositorio:**
    ```bash
    git clone [https://github.com/TuUsuario/petschile-backend.git](https://github.com/TuUsuario/petschile-backend.git)
    cd petschile-backend
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Inicia Docker Desktop:**
    * Asegúrate de que Docker Desktop esté abierto y corriendo.

4.  **Crea la Base de Datos PostgreSQL:**
    * Este comando creará y correrá un contenedor Docker con tu base de datos:
    ```bash
    docker run --name pets-db -e POSTGRES_PASSWORD=mysecretpassword -e POSTGRES_USER=petsuser -e POSTGRES_DB=petsdb -p 5432:5432 -d postgres
    ```
    *(Nota: Si ya lo creaste, puedes iniciarlo con `docker start pets-db`)*

5.  **Crea el archivo `.env`:**
    * Crea el archivo `.env` y añade las variables como se describe en la sección "Variables de Entorno", usando la `DATABASE_URL` del Ejemplo Local (Docker).

6.  **Aplica el Schema y el Seeding:**
    * Estos comandos generarán el cliente de Prisma, crearán las tablas en tu base de datos Docker y poblarán los datos iniciales (roles, comunas, admin).
    ```bash
    npx prisma generate
    npx prisma db push
    npx prisma db seed
    ```

7.  **Inicia el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

8.  Tu API ahora está corriendo en `http://localhost:3000/api`.

---

## 📡 Instrucciones de Despliegue (Render + Neon)

Este proyecto está desplegado usando el plan gratuito de Render y Neon.

### Paso 1: Base de Datos (Neon)
1.  Crea una cuenta en [Neon](https://neon.tech/).
2.  Crea un nuevo proyecto y una nueva base de datos (ej. `petsdb`).
3.  Ve a la sección "Connection Details" y copia la URL de conexión (la que empieza con `postgresql://...`).
4.  **Crucial:** Pega esta URL en tu variable `DATABASE_URL` (en Render) y añádele `?sslmode=require` al final.

### Paso 2: Backend (Render)
1.  Crea una cuenta en [Render](https://render.com/).
2.  Crea un nuevo "Web Service" y conéctalo a tu repositorio de GitHub.
3.  En la configuración, establece las siguientes variables de entorno:
    * `DATABASE_URL`: La URL de Neon (con `?sslmode=require`).
    * `JWT_SECRET`: Una nueva clave secreta segura para producción.
4.  Establece el **Comando de Build**:
    ```bash
    npm install && npx prisma generate && npx prisma db push
    ```
    * *Nota: `npx prisma db push` es fundamental, ya que lee tu `schema.prisma` y crea toda la estructura de tablas en la base de datos de Neon.*
5.  Establece el **Comando de Inicio**:
    ```bash
    node src/server.js
    ```
6.  Despliega el servicio.

### Paso 3: Seeding en Producción (El "Truco" de Render)
El plan gratuito de Render no incluye "Jobs" o una "Shell" para ejecutar el seeding.

1.  En el Dashboard de tu servicio en Render, ve a **Settings**.
2.  Cambia temporalmente el **Comando de Inicio** de `node src/server.js` a:
    ```bash
    node prisma/seed.js
    ```
3.  Guarda los cambios y ve a la pestaña "Manual Deploy".
4.  Haz clic en "Deploy latest commit".
5.  Ve a la pestaña "Logs" y monitorea el despliegue. Verás tus `console.log` del `seed.js`. Espera a que aparezca el mensaje `Seeding completado exitosamente.`.
6.  El deploy fallará (dirá `Failed (Application exited early)`). **Esto es normal**, ya que un script de seed no es un servidor.
7.  Vuelve a **Settings** y restaura el **Comando de Inicio** a:
    ```bash
    node src/server.js
    ```
8.  Guarda y haz "Deploy latest commit" una última vez. Tu base de datos de producción ya está poblada y tu servidor iniciará correctamente.

---

## 🧪 Endpoints Principales (API)

Puedes probar la API (local o en producción) usando [Postman](https://www.postman.com/).

### Autenticación (`/api/auth`)
* `POST /register`: Crea un nuevo usuario (rol `CLIENT`).
* `POST /login`: Autentica un usuario y devuelve un token JWT.
* `GET /profile`: (Protegida) Devuelve el perfil del usuario autenticado.

### Productos (`/api/products`)
* `GET /`: (Pública) Obtiene todos los productos.
* `GET /:id`: (Pública) Obtiene un producto por su `id` (UUID).
* `POST /`: (Protegida - Admin/Seller) Crea un nuevo producto.
* `PATCH /:id`: (Protegida - Admin/Seller) Actualiza un producto.
* `DELETE /:id`: (Protegida - Admin) Elimina un producto.

### Carrito (`/api/cart`) - (Rutas protegidas para Clientes)
* `GET /`: Obtiene el carrito del usuario (o lo crea si no existe).
* `POST /`: Añade un item al carrito (o incrementa su cantidad).
* `PATCH /:productId`: Actualiza la cantidad de un item.
* `DELETE /:productId`: Elimina un item del carrito.
* `DELETE /`: Vacía el carrito.

### Pedidos (`/api/orders`) - (Rutas protegidas)
* `POST /`: (Cliente) Crea un nuevo pedido (transacción atómica).
* `GET /my-orders`: (Cliente) Devuelve el historial de pedidos del usuario.
* `GET /`: (Admin/Seller) Devuelve TODOS los pedidos.

### Usuarios (`/api/users`) - (Rutas protegidas para Admin)
* `GET /`: Obtiene todos los usuarios.
* `POST /`: Crea un nuevo usuario (con rol específico).
* `PATCH /:id`: Actualiza un usuario.
* `DELETE /:id`: Elimina un usuario.


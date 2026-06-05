# 📽️ Iubizon - Monorepo Marketplace Perú

Iubizon es una plataforma de comercio electrónico multi-vendedor (Marketplace) especializada en la compra y venta de proyectores, laptops y tecnología en el mercado peruano. Este repositorio está estructurado como un monorepo modular que contiene la aplicación cliente principal y un panel de administración.

---

## 📂 Estructura General del Monorepo

El proyecto organiza sus aplicaciones y configuraciones en los siguientes directorios clave:

*   **`apps/web-client`**: Aplicación de cara al cliente construida con **Next.js (App Router)**.
*   **`apps/web-panel`**: Panel de administración y gestión del marketplace construido con **Vite + React**.
*   **`apps/api`**: Espacio modular reservado para servicios backend independientes.
*   **`supabase/`**: Directorio con scripts SQL de estructura de base de datos, políticas de seguridad RLS y carga de datos iniciales.

---

## 📱 1. Aplicación Cliente (`apps/web-client`)

La aplicación cliente de Iubizon está construida bajo un esquema moderno de Next.js enfocado en rendimiento SEO, interfaces visuales atractivas con HSL dinámico y robustez en la persistencia de datos.

### 🔑 Autenticación y Seguridad
*   **Sign-In y Sign-Up (`/auth/login`, `/auth/register`)**: Inicio de sesión mediante credenciales tradicionales (Email/Password) e integración de terceros con **Google OAuth**.
*   **Recuperación de Contraseña (`/auth/forgot-password`, `/auth/reset-password`)**: Flujo completo de recuperación de acceso a cuentas.
*   **Triggers automáticos en DB**: Al registrar un usuario en `auth.users`, un trigger en base de datos (`on_auth_user_created`) crea automáticamente un registro correspondiente en la tabla `profiles` para el marketplace.
*   **Persistencia de Sesión y Server-Side Proxy (`src/proxy.ts`)**: Middleware especial adaptado para Next.js 16 que intercepta cada navegación y llamada de red, refrescando de manera transparente el token JWT de Supabase en el servidor (`getUser()`) y propagando cookies seguras.
*   **Protección de Rutas**: Control total desde el proxy para redirigir a `/auth/login` cuando se intenta ingresar a vistas protegidas sin una sesión activa.

### 🛍️ Módulo de Productos y Catálogo
*   **Página Principal (`/`)**: Banner Hero, listado navegable de categorías, y sección con productos destacados o de publicación reciente.
*   **Catálogo y Filtros (`/products` o `/productos`)**: Búsqueda avanzada y filtrado dinámico en tiempo real (por rango de precios, estado del producto: *nuevo*, *como nuevo*, *buen estado*, *aceptable*, ordenamiento y búsqueda de palabras clave).
*   **Páginas de Detalle (`/products/[id]`)**:
    *   Galería interactiva de imágenes.
    *   Ficha técnica detallada del producto.
    *   Valoración e información del vendedor.
    *   Integración de geolocalización de entrega si aplica.
    *   Botón para añadir a favoritos de forma persistente.
*   **Publicación y Edición (`/products/new`, `/products/edit/[id]`)**: Formulario para vendedores con campos detallados, carga de múltiples imágenes a Supabase Storage y configuración de precios y lotes.

### 💬 Módulo de Mensajería en Tiempo Real (`/user/dashboard/messages`)
*   **Acción de Chat Directa**: Al hacer clic en *"Chatear con vendedor"* en cualquier producto, el sistema valida la sesión, comprueba si ya existe una conversación abierta para ese producto entre ambos usuarios, la crea defensivamente en caso contrario, inserta un mensaje inicial automatizado y redirecciona al chat de manera instantánea.
*   **Bandeja de Entrada Resiliente**:
    *   Listado dinámico de chats activos clasificados por fecha de última interacción.
    *   Canal en tiempo real para envío y recepción de mensajes.
    *   **Mapeo Defensivo**: La carga del listado está protegida individualmente con bloques `try-catch`, asegurando que datos huérfanos o consultas corruptas (por RLS o fallos de red) en una sola conversación no bloqueen ni rompan la vista general del usuario.
    *   Marcado de lectura e historial persistente.

### ⚙️ Dashboard del Usuario (`/user/dashboard`)
*   **Estadísticas del Vendedor**: Resumen analítico que muestra el número de productos publicados (activos e inactivos), total de pedidos, vistas totales recibidas y cantidad de veces que sus artículos han sido marcados como favoritos.
*   **Mis Productos**: Vista de administración de inventario del usuario para dar de baja, editar o marcar como vendidos sus artículos.
*   **Mis Pedidos**: Seguimiento de ventas e historial de compras.
*   **Configuración y Perfil (`/user/profile/edit`, `/user/dashboard/settings`)**: Actualización de información pública, teléfono, ubicación y carga de fotos de avatar en el bucket privado de Supabase.

### 📄 Páginas de Soporte y Regulatorias
*   **Libro de Reclamaciones (`/reclamos`)**: Formulario digital de reclamaciones completamente adaptado a la legislación del consumidor peruana (INDECOPI), permitiendo registrar quejas o reclamos de manera formal.
*   **Contacto y Ayuda (`/contacto`, `/help`)**: Formulario con validación integrada y simulación de envío de correos corporativos en segundo plano.
*   **Garantía y Políticas (`/garantia`, `/politica-de-devoluciones-y-cambios`, `/privacy`, `/terms`)**: Documentación legal del marketplace para brindar transparencia en las compras.

---

## 🛠️ 2. Panel de Administración (`apps/web-panel`)

El panel administrativo es una Single Page Application (SPA) optimizada para la gestión interna del catálogo, usuarios y contenidos estáticos del marketplace.

### 📈 Características del Dashboard Administrativo
*   **Gestión de Productos (`/productos`)**: Herramientas de moderación para aprobar, rechazar, suspender o marcar productos denunciados por la comunidad.
*   **Gestión de Categorías (`/categorias`)**: Interfaz para definir la jerarquía de categorías, asociar iconos ilustrativos (emojis o Lucide icons) y ajustar el orden visual de presentación en la app cliente.
*   **Configuración de Banners (`/banners`)**: Control de las promociones y anuncios que aparecen en el carrusel de la página de inicio del cliente.
*   **Metas y Cronograma (`/goals-cronograma`)**: Módulo interno para el seguimiento del roadmap del equipo de desarrollo del marketplace.

---

## 🗄️ 3. Base de Datos y Políticas RLS (`supabase/`)

El backend de datos de Iubizon aprovecha al máximo las capacidades de Supabase a través de esquemas relacionales robustos y seguridad a nivel de filas (RLS - Row Level Security).

### 👥 Tablas del Sistema
1.  **`profiles`**: Almacena los perfiles públicos de los usuarios (nombre, teléfono, bio, geolocalización, si posee suscripción PRO, reputación de ventas).
2.  **`categories`**: Categorías del marketplace estructuradas en árbol (relación jerárquica con `parent_id`).
3.  **`products`** & **`product_images`**: Datos técnicos y URLs de archivos multimedia de los artículos en venta.
4.  **`conversations`** & **`messages`**: Modelado para el canal de mensajería (conversación única por producto y comprador).
5.  **`orders`**: Transacciones financieras e historial de compras.
6.  **`favorites`**: Lista de deseos vinculando usuarios y productos de forma única.
7.  **`shippings`**: Estado logístico de entrega (envío a domicilio o retiro coordinado).
8.  **`reviews`**: Calificaciones e impresiones de compradores sobre vendedores después de culminar una orden.

### 🔒 Políticas de Seguridad RLS Implementadas
Para garantizar la integridad y privacidad de la información, cada tabla posee políticas restrictivas:
*   *Profiles*: Lectura pública para cualquier usuario; actualizaciones permitidas exclusivamente al propietario (`auth.uid() = id`).
*   *Products*: Solo los productos con estado `'active'` son visibles públicamente. Solo el dueño de la publicación puede insertar, modificar o eliminar sus registros.
*   *Conversations*: Los registros de chat solo pueden ser leídos y creados por los participantes de la conversación (`buyer_id = auth.uid() OR seller_id = auth.uid()`).
*   *Messages*: Lectura y envío limitados estrictamente a los participantes del chat asociado.
*   *Favorites*: Operaciones CRUD restringidas únicamente al dueño de la cuenta.

---

## ⚙️ Requisitos y Configuración de Desarrollo

### Requisitos Previos
*   **Node.js** (v18 o superior)
*   **Yarn** o **npm**

### Configuración del Entorno local
1.  Duplicar el archivo `.env.local.example` y renombrarlo a `.env.local` dentro de `apps/web-client/`:
    ```bash
    cp apps/web-client/.env.local.example apps/web-client/.env.local
    ```
2.  Configurar las credenciales de Supabase del proyecto:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
    ```
3.  Instalar las dependencias de todo el monorepo desde el directorio raíz:
    ```bash
    npm install
    ```
4.  Iniciar el servidor de desarrollo de la aplicación cliente:
    ```bash
    cd apps/web-client
    yarn dev
    ```
    *(La aplicación estará disponible en `http://localhost:3000`)*

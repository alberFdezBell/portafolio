# 🚀 Portafolio Profesional de Desarrollador - Alberto Fernández Bellido

Web de portafolio técnico personal, moderna, rápida y con estética oscura de programación. Desarrollada en **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, y preparada para desplegarse de forma 100% autónoma en **Portainer** sobre el **puerto 1886** con persistencia en **SQLite** y seguridad **2FA (Authenticator)**.

Repositorio oficial: [https://github.com/alberFdezBell/portafolio](https://github.com/alberFdezBell/portafolio)

---

## ⚡ Características Principales

- **Diseño & Rendimiento:** Dark mode de programación (`#090d16`), tipografía monospace selectiva, microinteracciones y animaciones fluidas respetando `prefers-reduced-motion`.
- **Narrativa e Historia:** Sección *"Mi Historia"* diseñada para explicar tu trayectoria y filosofía técnica con claridad.
- **Panel de Administración Completo (`/admin`):**
  - Gestión de Perfil, Biografía e Historia.
  - Gestión de Experiencia Laboral cronológica.
  - Catálogo de Proyectos con capturas, enlaces a GitHub y demos.
  - Educación, Formación y Certificaciones.
  - Enlaces Sociales y de Redes con **buscador CDN integrado** (SimpleIcons y Lucide).
  - Subida de fotos e imágenes directa a disco persistente.
- **Seguridad Robusta:**
  - Control de acceso por variables de entorno de Portainer (`ADMIN_USER`, `ADMIN_PASSWORD`).
  - **Doble Factor de Autenticación (2FA / TOTP)** compatible con Google Authenticator, Microsoft Authenticator y Authy con asistente y código QR interactivo.
  - Rate limiting contra ataques de fuerza bruta.
  - Cookies de sesión firmadas con HMAC-SHA256 y atributos `HttpOnly` y `SameSite`.
  - Protección CSRF y validación de tipos MIME en subida de archivos.
- **SEO Avanzado:**
  - Metaetiquetas OpenGraph y Twitter Cards dinámicas.
  - Datos estructurados Schema.org (**Person** y **WebSite** JSON-LD).
  - Generación automática de `sitemap.xml` y `robots.txt`.
- **Despliegue Autónomo y Ultra-Rápido:** Compilación automática en GitHub Actions y publicación en GitHub Container Registry (`ghcr.io`). Tu Portainer ya no compila: descarga la imagen lista en **~10 segundos** sobre el puerto 1886.

---

## ⚡ Automatización CI/CD con GitHub Actions

Cada vez que haces `git push` a la rama `main`:
1. Una GitHub Action ultrarrápida compila la imagen Docker en la infraestructura de GitHub usando caché BuildKit.
2. Sube la imagen a GitHub Container Registry: `ghcr.io/alberfdezbell/portafolio:latest`.
3. Tu Portainer solo necesita descargar la imagen precompilada (`docker pull`), tardando apenas unos segundos en reiniciar el stack.

> [!TIP]
> **Visibilidad del Paquete en GitHub:**
> La primera vez que la Action se ejecute, se creará el paquete en tu perfil de GitHub:
> 1. Ve a [github.com/alberFdezBell?tab=packages](https://github.com/alberFdezBell?tab=packages) o a la derecha de tu repositorio en **Packages**.
> 2. Entra en `portafolio` ➔ **Package settings**.
> 3. Al final, en **Danger Zone**, puedes cambiar la visibilidad a **Public** para que Portainer descargue la imagen sin necesidad de configurar credenciales de registro, o añadir un registro en Portainer con tu PAT.

---

## 🚢 Guía de Primer Despliegue en Portainer

Puedes desplegar tu portafolio en Portainer en menos de 2 minutos utilizando el repositorio de GitHub:

### Opción A: Despliegue mediante Stacks desde Repositorio (Recomendado)

1. Abre tu panel de **Portainer**.
2. Ve a **Stacks** en el menú lateral y haz clic en **+ Add stack**.
3. Asigna un nombre al stack (ejemplo: `portafolio`).
4. En **Build method**, selecciona **Repository**.
5. Configura los parámetros del repositorio:
   - **Repository URL:** `https://github.com/alberFdezBell/portafolio.git`
   - **Repository reference:** `refs/heads/main`
   - **Compose path:** `docker-compose.yml`
   - *(Opcional)* Activa **Automatic updates** (o copia la **Webhook URL** para despliegues automáticos al hacer `git push`).
6. En la sección **Environment variables**, añade las siguientes variables:
   ```env
   PORT=1886
   ADMIN_USER=admin
   ADMIN_PASSWORD=tu_password_seguro_aqui
   AUTH_SECRET=genera_una_clave_aleatoria_larga_de_32_caracteres
   NEXT_PUBLIC_SITE_URL=http://tu-ip-o-dominio:1886
   ```
   *(La variable `TOTP_SECRET` es opcional; si la dejas vacía, la app generará una clave única al iniciar y podrás escanear el QR desde el panel).*
7. Haz clic en **Deploy the stack**.

### Opción B: Despliegue mediante Web Editor

Si prefieres pegar el contenido directamente, copia el archivo `docker-compose.yml` de este repositorio en el **Web Editor** de Portainer, define las variables de entorno mencionadas arriba y pulsa **Deploy the stack**.

### Acceso Inicial y Activación del 2FA:
1. Una vez desplegado, entra en: `http://<IP-DE-TU-SERVIDOR>:1886/login` (o haz clic en el botón de candado **Admin** en la web).
2. Introduce tu `ADMIN_USER` y `ADMIN_PASSWORD`.
3. Ve a la pestaña **Seguridad & 2FA** dentro del panel:
   - Escanea el código QR mostrado con tu app de **Google Authenticator** o **Authy**.
   - A partir de este momento, cada login requerirá tu contraseña y el código numérico de 6 dígitos.

---

## 💻 Flujo de Trabajo para Realizar Cambios (Local a Producción)

Sigue este ciclo ordenado para realizar cambios, verificar la calidad y desplegar:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ 1. Clonar /     │ ──> │ 2. Desarrollo   │ ──> │ 3. Ejecutar     │ ──> │ 4. Push &       │
│    Pull Código  │     │    Local :1886  │     │    Tests        │     │    Portainer    │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 1. Clonar el repositorio y descargar el código
Si estás en una nueva máquina o entorno:
```bash
git clone https://github.com/alberFdezBell/portafolio.git
cd portafolio
```
Si ya tienes la carpeta local, actualiza los últimos cambios:
```bash
git pull origin main
```

### 2. Instalar dependencias
Asegúrate de tener Node.js 20+ o 24 instalado:
```bash
npm install --legacy-peer-deps
```

### 3. Iniciar el servidor local de desarrollo
Para trabajar en tiempo real en el puerto 1886:
```bash
npm run dev
```
Abre tu navegador en: [http://localhost:1886](http://localhost:1886)

### 4. Realizar cambios
- Modifica componentes en `src/components/`.
- Ajusta rutas o estilos en `src/app/`.
- Edita esquemas o lógica en `src/lib/`.

### 5. Pasar los Tests Automatizados
Antes de subir cualquier cambio, ejecuta la suite de pruebas automatizadas con Vitest:
```bash
npm test
```
Para ejecutar los tests en modo observador mientras desarrollas:
```bash
npm run test:watch
```

### 6. Verificar la compilación de producción
Asegúrate de que la compilación de Next.js pasa sin errores de TypeScript ni de empaquetado:
```bash
npm run build
```

### 7. Subir el código a GitHub
```bash
git add .
git commit -m "feat: descripción de tus cambios"
git push origin main
```

### 8. Desplegar los cambios en Portainer
- **Si activaste el Webhook de Portainer:** El despliegue se iniciará automáticamente.
- **Manualmente en Portainer:** Entra en tu stack `portafolio`, ve a la pestaña **Editor** y haz clic en **Update the stack** marcando la opción *"Re-pull image and redeploy"*.

---

## 🛡️ Estructura del Proyecto

```
portafolio/
├── data/                      # Base de datos persistente SQLite (portfolio.db)
├── public/
│   ├── uploads/               # Fotos y capturas subidas desde el panel admin
│   └── ...
├── src/
│   ├── app/
│   │   ├── admin/             # Panel de administración interactivo
│   │   ├── login/             # Pantalla de login segura con verificación 2FA
│   │   ├── api/admin/         # Endpoints REST (auth, profile, experience, projects, social, upload)
│   │   ├── layout.tsx         # Layout raíz con configuración SEO y accesibilidad
│   │   ├── page.tsx           # Portafolio público renderizado en servidor
│   │   ├── robots.ts          # Directivas de rastreo de motores de búsqueda
│   │   └── sitemap.ts         # Mapa del sitio canónico
│   ├── components/
│   │   ├── Navbar.tsx         # Cabecera con selector terminal y badge de estado
│   │   ├── Hero.tsx           # Introducción con terminal en vivo y métricas
│   │   ├── StorySection.tsx   # Sección narrativa sobre la historia y principios
│   │   ├── ExperienceSection.tsx # Línea de tiempo de experiencia laboral
│   │   ├── ProjectsSection.tsx# Grid de proyectos destacados con repositorios
│   │   ├── EducationSection.tsx # Formación y certificaciones
│   │   ├── ContactSection.tsx # Canales de contacto con botón copiar email y redes
│   │   ├── IconPickerModal.tsx# Buscador integrado de iconos CDN oficiales
│   │   └── DynamicIcon.tsx    # Renderizador dinámico de iconos SimpleIcons/Lucide
│   └── lib/
│       ├── auth.ts            # Lógica 2FA TOTP, sesiones HMAC y rate limiting
│       ├── db.ts              # Conexión SQLite singleton y migraciones automáticas
│       ├── icons-catalog.ts   # Catálogo CDN de iconos populares (SimpleIcons & Lucide)
│       └── seo.ts             # Generador de esquemas Schema.org JSON-LD
├── tests/                     # Suite de tests unitarios (auth, seo, icons)
├── docker-compose.yml         # Configuración del servicio para Portainer
├── Dockerfile                 # Imagen multi-stage optimizada en Node 24 Alpine
├── .env.example               # Plantilla documentada de variables de entorno
└── package.json
```

---

## 💾 Respaldo y Copias de Seguridad (Portainer Volumes)

Toda la información del portafolio (textos, proyectos, credenciales 2FA) y los archivos multimedia subidos se almacenan en los volúmenes de Docker:
- `portfolio_db_data`: Contiene el archivo SQLite `/app/data/portfolio.db`.
- `portfolio_public_uploads`: Contiene las fotos en `/app/public/uploads/`.

Para respaldar tu base de datos, simplemente copia el archivo `portfolio.db` o utiliza las herramientas de backup de volúmenes de Portainer.

---

## 📜 Licencia

MIT © [Alberto Fernández Bellido](https://github.com/alberFdezBell)

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dataDir, "portfolio.db");

// Singleton SQLite instance stored on globalThis to survive Next.js HMR in development
declare global {
  // eslint-disable-next-line no-var
  var __portfolio_db: Database.Database | undefined;
}

export function getDb(): Database.Database {
  if (!globalThis.__portfolio_db) {
    const instance = new Database(dbPath);
    instance.pragma("journal_mode = WAL");
    instance.pragma("foreign_keys = ON");
    instance.pragma("busy_timeout = 5000"); // Wait up to 5s instead of throwing locked errors
    initSchema(instance);
    globalThis.__portfolio_db = instance;
  }
  return globalThis.__portfolio_db;
}

function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      short_bio TEXT,
      about_story TEXT,
      avatar_url TEXT,
      location TEXT,
      email TEXT,
      status_badge TEXT,
      github_url TEXT,
      linkedin_url TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS experiences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      location TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT,
      is_current INTEGER DEFAULT 0,
      description TEXT,
      skills TEXT,
      order_num INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS education (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      institution TEXT NOT NULL,
      degree TEXT NOT NULL,
      field_of_study TEXT,
      start_year TEXT,
      end_year TEXT,
      description TEXT,
      order_num INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      long_description TEXT,
      tech_stack TEXT,
      image_url TEXT,
      demo_url TEXT,
      repo_url TEXT,
      status TEXT DEFAULT 'Producción',
      media TEXT DEFAULT '[]',
      links TEXT DEFAULT '[]',
      featured INTEGER DEFAULT 0,
      order_num INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS social_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL,
      url TEXT NOT NULL,
      icon_name TEXT,
      order_num INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS custom_icons (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      category TEXT DEFAULT 'custom',
      type TEXT DEFAULT 'custom',
      cdn_url TEXT,
      color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrate projects table if new columns are missing
  try {
    const projectCols = database.prepare("PRAGMA table_info(projects)").all() as Array<{ name: string }>;
    const colNames = projectCols.map((c) => c.name);
    if (!colNames.includes("long_description")) {
      database.prepare("ALTER TABLE projects ADD COLUMN long_description TEXT").run();
    }
    if (!colNames.includes("status")) {
      database.prepare("ALTER TABLE projects ADD COLUMN status TEXT DEFAULT 'Producción'").run();
    }
    if (!colNames.includes("media")) {
      database.prepare("ALTER TABLE projects ADD COLUMN media TEXT DEFAULT '[]'").run();
    }
    if (!colNames.includes("links")) {
      database.prepare("ALTER TABLE projects ADD COLUMN links TEXT DEFAULT '[]'").run();
    }
  } catch (e) {
    console.error("Error migrating projects table:", e);
  }

  // Seed default initial profile if none exists
  const profileCount = database.prepare("SELECT COUNT(*) as count FROM profile").get() as { count: number };
  if (profileCount.count === 0) {
    database.prepare(`
      INSERT INTO profile (id, name, title, short_bio, about_story, avatar_url, location, email, status_badge, github_url, linkedin_url)
      VALUES (
        1,
        'Alberto Fernández Bellido',
        'Senior Full-Stack Developer & Cloud Architect',
        'Construyendo software resiliente, escalable y con foco en rendimiento. Especializado en arquitectura cloud, Docker y desarrollo web moderno.',
        'Desde muy pequeño, con apenas 5 o 6 años, la tecnología ya formaba parte de mi día a día. Todo empezó frente a un ordenador de sobremesa con Windows XP: entre partidas a Minecraft, la curiosidad me llevó a trastear con el sistema y a familiarizarme de forma natural con el entorno digital y herramientas cotidianas como Word, Excel o PowerPoint.\n\nEl verdadero punto de inflexión ocurrió en 2º de la ESO, durante la clase de tecnología. Allí nos enseñaron a crear pequeños juegos con Scratch. Aunque no era programación tradicional, fue la primera vez que experimenté la satisfacción de darle órdenes a un ordenador y ver cómo ejecutaba exactamente lo que yo imaginaba. Esa sensación despertó una chispa que ya nunca se apagó.\n\nAños después di el paso al Grado Medio de Sistemas Microinformáticos y Redes (SMR). Fue durante esa etapa cuando, investigando y aprendiendo por mi cuenta, descubrí con total claridad que mi camino era el desarrollo de software. Sin embargo, haber comenzado por los sistemas me dio una base técnica diferencial: la soltura para moverme con naturalidad tanto en el código como en la infraestructura, los servidores y el despliegue.\n\nActualmente continúo ampliando mi formación cursando el Grado Superior de Desarrollo de Aplicaciones Web (DAW) en modalidad online, combinando los estudios con el desarrollo constante de proyectos personales donde aplico y pongo a prueba nuevas arquitecturas, contenedores y buenas prácticas.',
        '/alberto01.webp',
        'España (Remoto)',
        'alberto.fernandez.bellido.8@gmail.com',
        '🟢 Disponible para nuevos proyectos',
        'https://github.com/alberFdezBell',
        'https://linkedin.com/in/alberto-fernandez-bellido'
      )
    `).run();

    // Default experiences
    database.prepare(`
      INSERT INTO experiences (company, role, location, start_date, end_date, is_current, description, skills, order_num)
      VALUES 
      (
        'Tech Solutions Ltd',
        'Senior Software Engineer & DevOps',
        'Remoto',
        '2022',
        'Presente',
        1,
        'Diseño y mantenimiento de microservicios con Node.js y Next.js. Implementación de pipelines de despliegue automatizado con Docker y orquestación con Portainer.',
        '["TypeScript", "React", "Next.js", "Docker", "Portainer", "CI/CD", "PostgreSQL"]',
        1
      ),
      (
        'Innovate Web Studio',
        'Full-Stack Developer',
        'Híbrido',
        '2020',
        '2022',
        0,
        'Desarrollo de aplicaciones web de alto rendimiento, optimización de Core Web Vitals y diseño de APIs REST seguras con autenticación JWT y 2FA.',
        '["JavaScript", "Node.js", "Tailwind CSS", "REST APIs", "Redis", "Jest"]',
        2
      )
    `).run();

    // Default education
    database.prepare(`
      INSERT INTO education (institution, degree, field_of_study, start_year, end_year, description, order_num)
      VALUES 
      (
        'Universidad Politécnica',
        'Grado en Ingeniería del Software',
        'Ingeniería Informática',
        '2016',
        '2020',
        'Especialización en arquitectura de software, bases de datos relacionales y computación distribuida.',
        1
      ),
      (
        'Certificación Oficial Cloud',
        'Docker & Kubernetes Certified Administrator',
        'Cloud Computing & DevOps',
        '2021',
        '2022',
        'Dominio en despliegues contenerizados, redes de contenedores y orquestación.',
        2
      )
    `).run();

    // Default projects
    database.prepare(`
      INSERT INTO projects (title, description, tech_stack, image_url, demo_url, repo_url, featured, order_num)
      VALUES 
      (
        'Portafolio Autónomo con Portainer & 2FA',
        'Plataforma web personal ultra-rápida, con panel de administración protegido mediante autenticación de doble factor (TOTP) y persistencia SQLite.',
        '["Next.js", "TypeScript", "Tailwind CSS", "Docker", "SQLite", "2FA"]',
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80',
        '#',
        'https://github.com/alberFdezBell/portafolio',
        1,
        1
      ),
      (
        'Cloud Monitor Dashboard',
        'Panel de monitorización en tiempo real para contenedores Docker con métricas de CPU, RAM y alertas instantáneas.',
        '["React", "Node.js", "Docker API", "WebSockets", "Tailwind CSS"]',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
        '#',
        'https://github.com/alberFdezBell',
        1,
        2
      )
    `).run();

    // Default social links
    database.prepare(`
      INSERT INTO social_links (platform, url, icon_name, order_num)
      VALUES 
      ('GitHub', 'https://github.com/alberFdezBell', 'github', 1),
      ('LinkedIn', 'https://linkedin.com/in/alberto-fernandez-bellido', 'linkedin', 2),
      ('Email', 'mailto:alberto.fernandez.bellido.8@gmail.com', 'mail', 3)
    `).run();
  }
}

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

// Singleton SQLite instance
let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema(db);
  }
  return db;
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
      tech_stack TEXT,
      image_url TEXT,
      demo_url TEXT,
      repo_url TEXT,
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
  `);

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
        'Mi trayectoria en el desarrollo de software comenzó impulsada por la curiosidad de entender cómo funcionan los sistemas distribuidos bajo el capó. A lo largo de los años he liderado el diseño y despliegue de arquitecturas web completas, combinando frontends modernos con infraestructuras contenerizadas.\n\nCreo firmemente en la simplicidad arquitectónica, la automatización continua y el código limpio. Cuando no estoy programando, me apasiona explorar la computación en la nube, optimizar flujos CI/CD y contribuir a la comunidad open-source.',
        'https://images.unsplash.com/photo-1534972195531-a756b1129f63?auto=format&fit=crop&w=800&q=80',
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

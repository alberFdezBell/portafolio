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

    CREATE TABLE IF NOT EXISTS knowledge_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT,
      content TEXT DEFAULT '',
      order_num INTEGER DEFAULT 0,
      featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

  // Migrate knowledge_categories table if featured column is missing
  try {
    const knowCols = database.prepare("PRAGMA table_info(knowledge_categories)").all() as Array<{ name: string }>;
    const knowNames = knowCols.map((c) => c.name);
    if (!knowNames.includes("featured")) {
      database.prepare("ALTER TABLE knowledge_categories ADD COLUMN featured INTEGER DEFAULT 0").run();
      database.prepare("UPDATE knowledge_categories SET featured = 1 WHERE id IN (SELECT id FROM knowledge_categories ORDER BY order_num ASC, id ASC LIMIT 3)").run();
    }
  } catch (e) {
    console.error("Error migrating knowledge_categories table:", e);
  }
}

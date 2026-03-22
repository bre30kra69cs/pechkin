import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync, existsSync, readFileSync, unlinkSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '../../data/pechkin.db');

let db: Database.Database;

export function initDatabase(): Database.Database {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS schemas (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      base_url TEXT NOT NULL,
      items TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      schema_name TEXT NOT NULL,
      url TEXT NOT NULL,
      status TEXT NOT NULL,
      data TEXT,
      stats TEXT,
      created_at TEXT NOT NULL,
      completed_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_schemas_name ON schemas(name);
    CREATE INDEX IF NOT EXISTS idx_jobs_id ON jobs(id);
    CREATE INDEX IF NOT EXISTS idx_jobs_schema_name ON jobs(schema_name);
  `);

  return db;
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export function migrateFromJson(): number {
  const schemasDir = join(__dirname, '../schemas');
  
  if (!existsSync(schemasDir)) {
    return 0;
  }

  const files = readdirSync(schemasDir).filter(
    (f) => f.endsWith('.json') && f !== 'index.json'
  );

  if (files.length === 0) {
    return 0;
  }

  const dbInstance = getDatabase();
  const existingCount = dbInstance.prepare('SELECT COUNT(*) as count FROM schemas').get() as { count: number };
  
  if (existingCount.count > 0) {
    return 0;
  }

  const insertStmt = dbInstance.prepare(`
    INSERT INTO schemas (id, name, base_url, items, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const transaction = dbInstance.transaction(() => {
    for (const file of files) {
      const filePath = join(schemasDir, file);
      const content = readFileSync(filePath, 'utf-8');
      const schema = JSON.parse(content);
      
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      
      insertStmt.run(
        id,
        schema.name,
        schema.baseUrl,
        JSON.stringify(schema.items),
        now,
        now
      );

      unlinkSync(filePath);
    }
  });

  transaction();
  return files.length;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
  }
}

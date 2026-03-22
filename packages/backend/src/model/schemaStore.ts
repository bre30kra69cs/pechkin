import { getDatabase } from '../db/database.js';
import type { ScraperSchema } from '../types/ScraperSchema.js';
import type { SchemaListItem } from '../types/SchemaListItem.js';

interface SchemaRow {
  id: string;
  name: string;
  base_url: string;
  items: string;
  created_at: string;
  updated_at: string;
}

function rowToSchema(row: SchemaRow): ScraperSchema {
  return {
    name: row.name,
    baseUrl: row.base_url,
    items: JSON.parse(row.items),
  };
}

export function getSchema(name: string): ScraperSchema | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM schemas WHERE name = ?').get(name) as SchemaRow | undefined;
  
  if (!row) {
    return null;
  }

  return rowToSchema(row);
}

export function getAllSchemas(): SchemaListItem[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT name, base_url FROM schemas').all() as { name: string; base_url: string }[];
  
  return rows.map((row) => ({
    name: row.name,
    baseUrl: row.base_url,
  }));
}

export function schemaExists(name: string): boolean {
  const db = getDatabase();
  const row = db.prepare('SELECT 1 FROM schemas WHERE name = ?').get(name);
  return !!row;
}

export function createSchema(schema: ScraperSchema): { success: true } | { success: false; error: string } {
  if (schemaExists(schema.name)) {
    return { success: false, error: `Schema '${schema.name}' already exists` };
  }

  const db = getDatabase();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    db.prepare(`
      INSERT INTO schemas (id, name, base_url, items, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, schema.name, schema.baseUrl, JSON.stringify(schema.items), now, now);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: `Failed to create schema: ${error}` };
  }
}

export function updateSchema(
  name: string,
  schema: ScraperSchema
): { success: true } | { success: false; error: string } {
  if (!schemaExists(name)) {
    return { success: false, error: `Schema '${name}' not found` };
  }

  if (name !== schema.name && schemaExists(schema.name)) {
    return { success: false, error: `Schema '${schema.name}' already exists` };
  }

  const db = getDatabase();
  const now = new Date().toISOString();

  try {
    if (name !== schema.name) {
      db.prepare('DELETE FROM schemas WHERE name = ?').run(name);
    }

    db.prepare(`
      INSERT INTO schemas (id, name, base_url, items, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(crypto.randomUUID(), schema.name, schema.baseUrl, JSON.stringify(schema.items), now, now);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: `Failed to update schema: ${error}` };
  }
}

export function deleteSchema(
  name: string
): { success: true } | { success: false; error: string } {
  if (!schemaExists(name)) {
    return { success: false, error: `Schema '${name}' not found` };
  }

  const db = getDatabase();

  try {
    db.prepare('DELETE FROM schemas WHERE name = ?').run(name);
    return { success: true };
  } catch (error) {
    return { success: false, error: `Failed to delete schema: ${error}` };
  }
}

import { readFileSync, writeFileSync, unlinkSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { ScraperSchema } from '../types/ScraperSchema.js';
import type { SchemaListItem } from '../types/SchemaListItem.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemasDir = join(__dirname, '../schemas');

const schemaCache = new Map<string, ScraperSchema>();

function getFilePath(name: string): string {
  return join(schemasDir, `${name}.json`);
}

export function getSchema(name: string): ScraperSchema | null {
  if (schemaCache.has(name)) {
    return schemaCache.get(name)!;
  }

  const filePath = getFilePath(name);

  if (!existsSync(filePath)) {
    return null;
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const schema = JSON.parse(content) as ScraperSchema;
    schemaCache.set(name, schema);
    return schema;
  } catch {
    return null;
  }
}

export function getAllSchemas(): SchemaListItem[] {
  const files = readdirSync(schemasDir).filter(
    (f) => f.endsWith('.json') && f !== 'index.json'
  );

  return files.map((file) => {
    const name = file.replace('.json', '');
    const schema = getSchema(name);
    return {
      name: schema?.name || name,
      baseUrl: schema?.baseUrl || '',
    };
  });
}

export function schemaExists(name: string): boolean {
  return existsSync(getFilePath(name));
}

export function createSchema(schema: ScraperSchema): { success: true } | { success: false; error: string } {
  if (schemaExists(schema.name)) {
    return { success: false, error: `Schema '${schema.name}' already exists` };
  }

  const filePath = getFilePath(schema.name);
  writeFileSync(filePath, JSON.stringify(schema, null, 2), 'utf-8');
  schemaCache.set(schema.name, schema);

  return { success: true };
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

  const oldFilePath = getFilePath(name);
  const newFilePath = getFilePath(schema.name);

  if (oldFilePath !== newFilePath) {
    unlinkSync(oldFilePath);
  }

  writeFileSync(newFilePath, JSON.stringify(schema, null, 2), 'utf-8');
  schemaCache.set(schema.name, schema);

  return { success: true };
}

export function deleteSchema(
  name: string
): { success: true } | { success: false; error: string } {
  if (!schemaExists(name)) {
    return { success: false, error: `Schema '${name}' not found` };
  }

  const filePath = getFilePath(name);
  unlinkSync(filePath);
  schemaCache.delete(name);

  return { success: true };
}

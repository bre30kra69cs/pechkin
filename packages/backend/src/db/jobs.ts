import { nanoid } from 'nanoid';
import { getDatabase } from './database';
import type { ScrapeJob, ScrapeStats, JobStatus } from '../types/job';

interface JobRow {
  id: string;
  schema_name: string;
  url: string;
  status: string;
  data: string | null;
  stats: string | null;
  created_at: string;
  completed_at: string | null;
}

function rowToJob(row: JobRow): ScrapeJob {
  return {
    id: row.id,
    schemaName: row.schema_name,
    url: row.url,
    status: row.status as JobStatus,
    data: row.data ? JSON.parse(row.data) : [],
    stats: row.stats ? JSON.parse(row.stats) : {
      pagesScraped: 0,
      itemsExtracted: 0,
      duration: '0s',
      errors: [],
    },
    createdAt: new Date(row.created_at),
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
  };
}

export function createJob(schemaName: string, url: string): ScrapeJob {
  const db = getDatabase();
  const id = nanoid();
  const now = new Date().toISOString();

  const initialStats: ScrapeStats = {
    pagesScraped: 0,
    itemsExtracted: 0,
    duration: '0s',
    errors: [],
  };

  db.prepare(`
    INSERT INTO jobs (id, schema_name, url, status, data, stats, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, schemaName, url, 'pending', '[]', JSON.stringify(initialStats), now);

  return {
    id,
    schemaName,
    url,
    status: 'pending',
    data: [],
    stats: initialStats,
    createdAt: new Date(now),
  };
}

export function getJob(id: string): ScrapeJob | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id) as JobRow | undefined;

  if (!row) {
    return null;
  }

  return rowToJob(row);
}

export function updateJobStatus(id: string, status: JobStatus): void {
  const db = getDatabase();
  db.prepare('UPDATE jobs SET status = ? WHERE id = ?').run(status, id);
}

export function updateJobData(
  id: string,
  data: Record<string, unknown>[],
  stats: Partial<ScrapeStats>
): void {
  const db = getDatabase();
  const row = db.prepare('SELECT stats FROM jobs WHERE id = ?').get(id) as { stats: string } | undefined;

  if (row) {
    const currentStats = JSON.parse(row.stats);
    const newStats = { ...currentStats, ...stats };
    db.prepare('UPDATE jobs SET data = ?, stats = ? WHERE id = ?')
      .run(JSON.stringify(data), JSON.stringify(newStats), id);
  }
}

export function completeJob(id: string, duration: string): void {
  const db = getDatabase();
  const now = new Date().toISOString();

  const row = db.prepare('SELECT stats FROM jobs WHERE id = ?').get(id) as { stats: string } | undefined;

  if (row) {
    const stats = JSON.parse(row.stats);
    stats.duration = duration;
    db.prepare('UPDATE jobs SET status = ?, stats = ?, completed_at = ? WHERE id = ?')
      .run('completed', JSON.stringify(stats), now, id);
  }
}

export function failJob(id: string, error: string): void {
  const db = getDatabase();
  const now = new Date().toISOString();

  const row = db.prepare('SELECT stats FROM jobs WHERE id = ?').get(id) as { stats: string } | undefined;

  if (row) {
    const stats = JSON.parse(row.stats);
    stats.errors.push(error);
    db.prepare('UPDATE jobs SET status = ?, stats = ?, completed_at = ? WHERE id = ?')
      .run('failed', JSON.stringify(stats), now, id);
  }
}

export function getAllJobs(): ScrapeJob[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM jobs ORDER BY created_at DESC').all() as JobRow[];
  return rows.map(rowToJob);
}

import type { JobStatus } from './JobStatus.js';
import type { ScrapeStats } from './ScrapeStats.js';

export interface ScrapeJob {
  id: string;
  status: JobStatus;
  schemaName: string;
  url: string;
  data: Record<string, unknown>[];
  stats: ScrapeStats;
  createdAt: Date;
  completedAt?: Date;
}

import type { JobStatus } from './JobStatus.js';
import type { ScrapeStats } from './ScrapeStats.js';

export interface ScrapeResponse {
  jobId: string;
  status: JobStatus;
  data: Record<string, unknown>[];
  stats: ScrapeStats;
}

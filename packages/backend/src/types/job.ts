export type JobStatus = 'pending' | 'queued' | 'running' | 'completed' | 'failed';

export interface ScrapeStats {
  pagesScraped: number;
  itemsExtracted: number;
  duration: string;
  errors: string[];
}

export interface ScrapeRequest {
  schemaName: string;
  url: string;
}

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

export interface ScrapeResponse {
  jobId: string;
  status: JobStatus;
  data: Record<string, unknown>[];
  stats: ScrapeStats;
}

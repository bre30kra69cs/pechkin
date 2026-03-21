import { nanoid } from 'nanoid';
import type { ScrapeJob } from '../types/ScrapeJob.js';
import type { ScrapeStats } from '../types/ScrapeStats.js';
import type { JobStatus } from '../types/JobStatus.js';

const jobs = new Map<string, ScrapeJob>();

export function createJob(schemaName: string, url: string): ScrapeJob {
  const job: ScrapeJob = {
    id: nanoid(),
    status: 'pending',
    schemaName,
    url,
    data: [],
    stats: {
      pagesScraped: 0,
      itemsExtracted: 0,
      duration: '0s',
      errors: [],
    },
    createdAt: new Date(),
  };

  jobs.set(job.id, job);
  return job;
}

export function getJob(id: string): ScrapeJob | undefined {
  return jobs.get(id);
}

export function updateJobStatus(id: string, status: JobStatus): void {
  const job = jobs.get(id);
  if (job) {
    job.status = status;
  }
}

export function updateJobData(
  id: string,
  data: Record<string, unknown>[],
  stats: Partial<ScrapeStats>
): void {
  const job = jobs.get(id);
  if (job) {
    job.data = data;
    job.stats = { ...job.stats, ...stats };
  }
}

export function completeJob(id: string, duration: string): void {
  const job = jobs.get(id);
  if (job) {
    job.status = 'completed';
    job.completedAt = new Date();
    job.stats.duration = duration;
  }
}

export function failJob(id: string, error: string): void {
  const job = jobs.get(id);
  if (job) {
    job.status = 'failed';
    job.completedAt = new Date();
    job.stats.errors.push(error);
  }
}

export function getAllJobs(): ScrapeJob[] {
  return Array.from(jobs.values());
}

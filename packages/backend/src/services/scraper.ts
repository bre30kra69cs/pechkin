import { fetchHtml } from '../scraper/fetcher';
import { extractItems } from '../scraper/extractor';
import { getSchema, schemaExists } from '../db/schemas';
import {
  createJob,
  getJob,
  updateJobStatus,
  updateJobData,
  completeJob,
  failJob,
  getAllJobs,
} from '../db/jobs';
import type { ScrapeJob, ScrapeRequest, ScrapeResponse } from '../types/job';

interface QueuedJob {
  request: ScrapeRequest;
  jobId: string;
}

const jobQueue: QueuedJob[] = [];
let isProcessing = false;

async function processQueue(): Promise<void> {
  if (isProcessing || jobQueue.length === 0) {
    return;
  }

  isProcessing = true;

  while (jobQueue.length > 0) {
    const queuedJob = jobQueue.shift()!;
    const { request, jobId } = queuedJob;

    try {
      await executeScrape(jobId, request);
    } catch (error) {
      console.error(`Job ${jobId} failed:`, error);
    }
  }

  isProcessing = false;
}

async function executeScrape(jobId: string, request: ScrapeRequest): Promise<void> {
  const { schemaName, url } = request;

  const schema = getSchema(schemaName);
  if (!schema) {
    failJob(jobId, `Schema '${schemaName}' not found`);
    return;
  }

  updateJobStatus(jobId, 'running');

  const startTime = Date.now();
  const errors: string[] = [];

  try {
    const html = await fetchHtml(url);
    const { items, errors: extractErrors } = extractItems(html, schema);

    errors.push(...extractErrors);

    updateJobData(jobId, items, {
      pagesScraped: 1,
      itemsExtracted: items.length,
      errors,
    });

    const duration = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
    completeJob(jobId, duration);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    failJob(jobId, errorMessage);
  }
}

export class ScrapeService {
  async scrape(request: ScrapeRequest): Promise<ScrapeResponse> {
    const { schemaName, url } = request;

    if (!schemaExists(schemaName)) {
      throw new Error(`Schema '${schemaName}' not found`);
    }

    const schema = getSchema(schemaName);
    if (!schema) {
      throw new Error(`Failed to load schema '${schemaName}'`);
    }

    const job = createJob(schemaName, url);
    updateJobStatus(job.id, 'queued');

    jobQueue.push({ request, jobId: job.id });
    processQueue();

    const queuedJob = getJob(job.id)!;

    return {
      jobId: queuedJob.id,
      status: queuedJob.status,
      data: [],
      stats: queuedJob.stats,
    };
  }

  getJob(id: string): ScrapeJob | undefined {
    return getJob(id) ?? undefined;
  }

  getAllJobs(): ScrapeJob[] {
    return getAllJobs();
  }
}

export const scrapeService = new ScrapeService();

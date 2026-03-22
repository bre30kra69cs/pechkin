import { fetchHtml } from './fetcher.js';
import { extractItems } from './extractor.js';
import { getSchema, schemaExists } from './schemaStore.js';
import {
  createJob,
  getJob,
  updateJobStatus,
  updateJobData,
  completeJob,
  failJob,
} from './jobs.js';
import type { ScrapeJob } from '../types/ScrapeJob.js';
import type { ScrapeRequest } from '../types/ScrapeRequest.js';
import type { ScrapeResponse } from '../types/ScrapeResponse.js';

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
    updateJobStatus(job.id, 'running');

    const startTime = Date.now();
    const errors: string[] = [];

    try {
      const html = await fetchHtml(url);
      const { items, errors: extractErrors } = extractItems(html, schema);

      errors.push(...extractErrors);

      updateJobData(job.id, items, {
        pagesScraped: 1,
        itemsExtracted: items.length,
        errors,
      });

      const duration = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
      completeJob(job.id, duration);

      const completedJob = getJob(job.id)!;

      return {
        jobId: completedJob.id,
        status: completedJob.status,
        data: completedJob.data,
        stats: completedJob.stats,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      failJob(job.id, errorMessage);

      const completedJob = getJob(job.id)!;

      return {
        jobId: completedJob.id,
        status: completedJob.status,
        data: [],
        stats: completedJob.stats,
      };
    }
  }

  getJob(id: string): ScrapeJob | undefined {
    return getJob(id) ?? undefined;
  }
}

export const scrapeService = new ScrapeService();

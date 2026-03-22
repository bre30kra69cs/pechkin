import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import supertest from 'supertest';
import { scraperRoutes } from '../src/model/routes.js';

vi.mock('../src/db/database.js', () => ({
  initDatabase: vi.fn(),
  getDatabase: vi.fn(() => mockDb),
  migrateFromJson: vi.fn(() => 0),
  closeDatabase: vi.fn(),
}));

const mockDb = {
  prepare: vi.fn(),
  exec: vi.fn(),
  pragma: vi.fn(),
  transaction: vi.fn((fn: () => void) => fn()),
};

vi.mock('../src/model/schemaStore.js', () => ({
  getAllSchemas: vi.fn(),
  getSchema: vi.fn(),
  createSchema: vi.fn(),
  updateSchema: vi.fn(),
  deleteSchema: vi.fn(),
  schemaExists: vi.fn(),
}));

vi.mock('../src/model/service.js', () => ({
  scrapeService: {
    scrape: vi.fn(),
    getJob: vi.fn(),
  },
}));

import { scrapeService } from '../src/model/service.js';

describe('GET /api/scraper/jobs/:id', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify();
    await app.register(scraperRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен возвращать job по id', async () => {
    const mockJob = {
      id: 'job-123',
      schemaName: 'test-schema',
      url: 'https://example.com',
      status: 'completed',
      data: [{ title: 'Item 1' }],
    };
    vi.mocked(scrapeService.getJob).mockReturnValue(mockJob);

    const response = await supertest(app.server)
      .get('/api/scraper/jobs/job-123')
      .expect(200);

    expect(response.body).toEqual(mockJob);
    expect(scrapeService.getJob).toHaveBeenCalledWith('job-123');
  });

  it('должен возвращать 404 когда job не найден', async () => {
    vi.mocked(scrapeService.getJob).mockReturnValue(null);

    const response = await supertest(app.server)
      .get('/api/scraper/jobs/non-existent')
      .expect(404);

    expect(response.body).toEqual({ error: "Job 'non-existent' not found" });
  });
});

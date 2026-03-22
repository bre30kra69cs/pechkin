import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import supertest from 'supertest';
import { scraperRoutes } from '../src/model/routes.js';

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

import { schemaExists } from '../src/model/schemaStore.js';
import { scrapeService } from '../src/model/service.js';

describe('POST /api/scraper/scrape', () => {
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

  it('должен запускать scrape', async () => {
    const mockResult = {
      jobId: 'job-123',
      status: 'pending',
    };
    vi.mocked(schemaExists).mockReturnValue(true);
    vi.mocked(scrapeService.scrape).mockResolvedValue(mockResult);

    const response = await supertest(app.server)
      .post('/api/scraper/scrape')
      .send({ schemaName: 'test-schema', url: 'https://example.com/page' })
      .expect(200);

    expect(response.body).toEqual(mockResult);
  });

  it('должен возвращать 400 когда schemaName отсутствует', async () => {
    const response = await supertest(app.server)
      .post('/api/scraper/scrape')
      .send({ url: 'https://example.com/page' })
      .expect(400);

    expect(response.body).toEqual({ error: 'schemaName and url are required' });
  });

  it('должен возвращать 400 когда url отсутствует', async () => {
    const response = await supertest(app.server)
      .post('/api/scraper/scrape')
      .send({ schemaName: 'test-schema' })
      .expect(400);

    expect(response.body).toEqual({ error: 'schemaName and url are required' });
  });

  it('должен возвращать 400 когда schemaName не строка', async () => {
    const response = await supertest(app.server)
      .post('/api/scraper/scrape')
      .send({ schemaName: 123, url: 'https://example.com' })
      .expect(400);

    expect(response.body).toEqual({ error: 'Invalid request body' });
  });

  it('должен возвращать 400 когда url не строка', async () => {
    const response = await supertest(app.server)
      .post('/api/scraper/scrape')
      .send({ schemaName: 'test-schema', url: 123 })
      .expect(400);

    expect(response.body).toEqual({ error: 'Invalid request body' });
  });

  it('должен возвращать 404 когда схема не найдена', async () => {
    vi.mocked(schemaExists).mockReturnValue(false);

    const response = await supertest(app.server)
      .post('/api/scraper/scrape')
      .send({ schemaName: 'non-existent', url: 'https://example.com' })
      .expect(404);

    expect(response.body).toEqual({ error: "Schema 'non-existent' not found" });
  });

  it('должен возвращать 500 при ошибке scrape', async () => {
    vi.mocked(schemaExists).mockReturnValue(true);
    vi.mocked(scrapeService.scrape).mockRejectedValue(new Error('Network error'));

    const response = await supertest(app.server)
      .post('/api/scraper/scrape')
      .send({ schemaName: 'test-schema', url: 'https://example.com' })
      .expect(500);

    expect(response.body).toEqual({ error: 'Network error' });
  });
});

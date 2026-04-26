import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import supertest from 'supertest';
import { scraperRoutes } from '../src/routes/scraper';

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

vi.mock('../src/db/schemas.js', () => ({
  getAllSchemas: vi.fn(),
  getSchema: vi.fn(),
  createSchema: vi.fn(),
  updateSchema: vi.fn(),
  deleteSchema: vi.fn(),
  schemaExists: vi.fn(),
}));

import { getAllSchemas } from '../src/db/schemas';

describe('GET /api/schemas', () => {
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

  it('должен возвращать пустой массив когда схем нет', async () => {
    vi.mocked(getAllSchemas).mockReturnValue([]);

    const response = await supertest(app.server)
      .get('/api/schemas')
      .expect(200);

    expect(response.body).toEqual([]);
    expect(getAllSchemas).toHaveBeenCalledTimes(1);
  });

  it('должен возвращать список схем', async () => {
    const mockSchemas = [
      { name: 'schema1', baseUrl: 'https://example1.com' },
      { name: 'schema2', baseUrl: 'https://example2.com' },
    ];
    vi.mocked(getAllSchemas).mockReturnValue(mockSchemas);

    const response = await supertest(app.server)
      .get('/api/schemas')
      .expect(200);

    expect(response.body).toEqual(mockSchemas);
    expect(response.body).toHaveLength(2);
    expect(getAllSchemas).toHaveBeenCalledTimes(1);
  });
});

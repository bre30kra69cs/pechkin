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

import { getSchema } from '../src/db/schemas';

describe('GET /api/schemas/:name', () => {
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

  it('должен возвращать схему по имени', async () => {
    const mockSchema = {
      name: 'test-schema',
      baseUrl: 'https://test.com',
      items: [{ name: 'item1', selector: '.item' }],
    };
    vi.mocked(getSchema).mockReturnValue(mockSchema);

    const response = await supertest(app.server)
      .get('/api/schemas/test-schema')
      .expect(200);

    expect(response.body).toEqual(mockSchema);
  });

  it('должен возвращать 404 когда схема не найдена', async () => {
    vi.mocked(getSchema).mockReturnValue(null);

    const response = await supertest(app.server)
      .get('/api/schemas/non-existent')
      .expect(404);

    expect(response.body).toEqual({ error: "Schema 'non-existent' not found" });
  });
});

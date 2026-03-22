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

import { deleteSchema } from '../src/model/schemaStore.js';

describe('DELETE /api/schemas/:name', () => {
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

  it('должен удалять схему', async () => {
    vi.mocked(deleteSchema).mockReturnValue({ success: true });

    await supertest(app.server)
      .delete('/api/schemas/test-schema')
      .expect(204);

    expect(deleteSchema).toHaveBeenCalledWith('test-schema');
  });

  it('должен возвращать 404 когда схема не найдена', async () => {
    vi.mocked(deleteSchema).mockReturnValue({
      success: false,
      error: "Schema 'non-existent' not found",
    });

    const response = await supertest(app.server)
      .delete('/api/schemas/non-existent')
      .expect(404);

    expect(response.body).toEqual({ error: "Schema 'non-existent' not found" });
  });
});

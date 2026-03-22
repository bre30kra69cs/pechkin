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

import { updateSchema } from '../src/model/schemaStore.js';

describe('PUT /api/schemas/:name', () => {
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

  it('должен обновлять схему', async () => {
    const updatedSchema = {
      name: 'test-schema',
      baseUrl: 'https://updated.com',
      items: [{ name: 'new-item', selector: '.new' }],
    };
    vi.mocked(updateSchema).mockReturnValue({ success: true });

    const response = await supertest(app.server)
      .put('/api/schemas/test-schema')
      .send(updatedSchema)
      .expect(200);

    expect(response.body).toEqual(updatedSchema);
    expect(updateSchema).toHaveBeenCalledWith('test-schema', updatedSchema);
  });

  it('должен возвращать 400 при невалидной схеме', async () => {
    const response = await supertest(app.server)
      .put('/api/schemas/test-schema')
      .send({ name: 'incomplete' })
      .expect(400);

    expect(response.body).toEqual({ error: 'Invalid schema structure' });
  });

  it('должен возвращать 404 когда схема не найдена', async () => {
    const updatedSchema = {
      name: 'test-schema',
      baseUrl: 'https://updated.com',
      items: [],
    };
    vi.mocked(updateSchema).mockReturnValue({
      success: false,
      error: "Schema 'test-schema' not found",
    });

    const response = await supertest(app.server)
      .put('/api/schemas/test-schema')
      .send(updatedSchema)
      .expect(404);

    expect(response.body).toEqual({ error: "Schema 'test-schema' not found" });
  });

  it('должен возвращать 409 при конфликте при переименовании', async () => {
    const updatedSchema = {
      name: 'existing-schema',
      baseUrl: 'https://test.com',
      items: [],
    };
    vi.mocked(updateSchema).mockReturnValue({
      success: false,
      error: "Schema 'existing-schema' already exists",
    });

    const response = await supertest(app.server)
      .put('/api/schemas/test-schema')
      .send(updatedSchema)
      .expect(409);

    expect(response.body).toEqual({
      error: "Schema 'existing-schema' already exists",
    });
  });
});

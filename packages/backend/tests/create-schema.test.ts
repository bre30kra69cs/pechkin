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

import { createSchema } from '../src/model/schemaStore.js';

describe('POST /api/schemas', () => {
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

  it('должен создавать схему', async () => {
    const newSchema = {
      name: 'new-schema',
      baseUrl: 'https://new.com',
      items: [],
    };
    vi.mocked(createSchema).mockReturnValue({ success: true });

    const response = await supertest(app.server)
      .post('/api/schemas')
      .send(newSchema)
      .expect(201);

    expect(response.body).toEqual(newSchema);
  });

  it('должен возвращать 400 при невалидной схеме - без name', async () => {
    const response = await supertest(app.server)
      .post('/api/schemas')
      .send({ baseUrl: 'https://test.com', items: [] })
      .expect(400);

    expect(response.body).toEqual({ error: 'Invalid schema structure' });
  });

  it('должен возвращать 400 при невалидной схеме - без baseUrl', async () => {
    const response = await supertest(app.server)
      .post('/api/schemas')
      .send({ name: 'test', items: [] })
      .expect(400);

    expect(response.body).toEqual({ error: 'Invalid schema structure' });
  });

  it('должен возвращать 400 при невалидной схеме - без items', async () => {
    const response = await supertest(app.server)
      .post('/api/schemas')
      .send({ name: 'test', baseUrl: 'https://test.com' })
      .expect(400);

    expect(response.body).toEqual({ error: 'Invalid schema structure' });
  });

  it('должен возвращать 409 при конфликте', async () => {
    const newSchema = {
      name: 'existing-schema',
      baseUrl: 'https://existing.com',
      items: [],
    };
    vi.mocked(createSchema).mockReturnValue({
      success: false,
      error: "Schema 'existing-schema' already exists",
    });

    const response = await supertest(app.server)
      .post('/api/schemas')
      .send(newSchema)
      .expect(409);

    expect(response.body).toEqual({
      error: "Schema 'existing-schema' already exists",
    });
  });
});

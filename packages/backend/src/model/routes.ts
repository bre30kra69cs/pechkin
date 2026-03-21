import type { FastifyInstance } from 'fastify';
import { scrapeService } from './service.js';
import {
  getAllSchemas,
  getSchema,
  createSchema,
  updateSchema,
  deleteSchema,
  schemaExists,
} from './schemaStore.js';
import type { ScraperSchema } from '../types/ScraperSchema.js';

export async function scraperRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/api/schemas', async () => {
    return getAllSchemas();
  });

  fastify.get<{ Params: { name: string } }>(
    '/api/schemas/:name',
    async (request, reply) => {
      const { name } = request.params;
      const schema = getSchema(name);

      if (!schema) {
        return reply.status(404).send({ error: `Schema '${name}' not found` });
      }

      return schema;
    }
  );

  fastify.post<{ Body: ScraperSchema }>(
    '/api/schemas',
    async (request, reply) => {
      const schema = request.body;

      if (!schema || !schema.name || !schema.baseUrl || !schema.items) {
        return reply.status(400).send({ error: 'Invalid schema structure' });
      }

      const result = createSchema(schema);

      if (!result.success) {
        return reply.status(409).send({ error: result.error });
      }

      return reply.status(201).send(schema);
    }
  );

  fastify.put<{ Params: { name: string }; Body: ScraperSchema }>(
    '/api/schemas/:name',
    async (request, reply) => {
      const { name } = request.params;
      const schema = request.body;

      if (!schema || !schema.name || !schema.baseUrl || !schema.items) {
        return reply.status(400).send({ error: 'Invalid schema structure' });
      }

      const result = updateSchema(name, schema);

      if (!result.success) {
        if (result.error.includes('not found')) {
          return reply.status(404).send({ error: result.error });
        }
        return reply.status(409).send({ error: result.error });
      }

      return schema;
    }
  );

  fastify.delete<{ Params: { name: string } }>(
    '/api/schemas/:name',
    async (request, reply) => {
      const { name } = request.params;
      const result = deleteSchema(name);

      if (!result.success) {
        return reply.status(404).send({ error: result.error });
      }

      return reply.status(204).send();
    }
  );

  fastify.post<{ Body: { schemaName: string; url: string } }>(
    '/api/scraper/scrape',
    async (request, reply) => {
      const { schemaName, url } = request.body;

      if (!schemaName || !url) {
        return reply
          .status(400)
          .send({ error: 'schemaName and url are required' });
      }

      if (typeof schemaName !== 'string' || typeof url !== 'string') {
        return reply.status(400).send({ error: 'Invalid request body' });
      }

      if (!schemaExists(schemaName)) {
        return reply.status(404).send({ error: `Schema '${schemaName}' not found` });
      }

      try {
        const result = await scrapeService.scrape({ schemaName, url });
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return reply.status(500).send({ error: message });
      }
    }
  );

  fastify.get<{ Params: { id: string } }>(
    '/api/scraper/jobs/:id',
    async (request, reply) => {
      const { id } = request.params;
      const job = scrapeService.getJob(id);

      if (!job) {
        return reply.status(404).send({ error: `Job '${id}' not found` });
      }

      return job;
    }
  );
}

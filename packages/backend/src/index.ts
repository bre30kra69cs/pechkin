import Fastify from "fastify";
import { scraperRoutes } from "./routes/scraper.js";
import { initDatabase, migrateFromJson, closeDatabase } from "./db/database.js";

const fastify = Fastify({ logger: true });

initDatabase();
const migratedCount = migrateFromJson();
if (migratedCount > 0) {
  fastify.log.info(`Migrated ${migratedCount} schemas from JSON to SQLite`);
}

fastify.get("/api/hello", async () => {
  return { message: "Hello from Fastify!" };
});

fastify.register(scraperRoutes);

const PORT = parseInt(process.env.PORT || '3000', 10);

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

const stop = async () => {
  try {
    await fastify.close();
    closeDatabase();
    process.exit(0);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

process.on("SIGINT", stop);
process.on("SIGTERM", stop);

start();

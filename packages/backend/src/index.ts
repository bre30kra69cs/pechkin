import Fastify from "fastify";
import { scraperRoutes } from "./model/routes.js";

const fastify = Fastify({ logger: true });

fastify.get("/api/hello", async () => {
  return { message: "Hello from Fastify!" };
});

fastify.register(scraperRoutes);

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

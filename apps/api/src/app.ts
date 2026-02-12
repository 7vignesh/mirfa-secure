/**
 * Fastify app setup — shared between local dev and Vercel serverless.
 * Does NOT call app.listen() — that is done separately.
 */

import Fastify from "fastify";
import cors from "@fastify/cors";
import { txRoutes } from "./routes/tx";

export async function buildApp() {
  const app = Fastify({ logger: true });

  // Register CORS so the Next.js frontend can call the API
  await app.register(cors, {
    origin: true,
    methods: ["GET", "POST", "OPTIONS"],
  });

  // Register routes
  await app.register(txRoutes);

  // Health check
  app.get("/health", async () => ({ status: "ok" }));

  return app;
}

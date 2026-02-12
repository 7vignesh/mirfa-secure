/**
 * Fastify server entry point.
 */

import Fastify from "fastify";
import cors from "@fastify/cors";
import { txRoutes } from "./routes/tx.js";

const app = Fastify({ logger: true });

// Register CORS so the Next.js frontend can call the API
await app.register(cors, {
  origin: true, // Allow all origins (simplest for this challenge)
  methods: ["GET", "POST", "OPTIONS"],
});

// Register routes
await app.register(txRoutes);

// Health check
app.get("/health", async () => ({ status: "ok" }));

// Start
const port = Number(process.env.PORT) || 3001;
const host = process.env.HOST || "0.0.0.0";

try {
  await app.listen({ port, host });
  console.log(`🚀 API running at http://localhost:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

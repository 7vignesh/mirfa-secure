/**
 * Local dev server entry point.
 * On Vercel, the api/index.ts handler is used instead.
 */

import { buildApp } from "./app.js";

const app = await buildApp();

const port = Number(process.env.PORT) || 3001;
const host = process.env.HOST || "0.0.0.0";

try {
  await app.listen({ port, host });
  console.log(`🚀 API running at http://localhost:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

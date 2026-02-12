/**
 * Vercel Serverless Function entry point.
 * Vercel routes all requests here via vercel.json rewrites.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import { buildApp } from "../src/app.js";

const app = await buildApp();
await app.ready();

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  app.server.emit("request", req, res);
}

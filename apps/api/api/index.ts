/**
 * Vercel Serverless Function entry point.
 * Vercel routes all requests here via vercel.json rewrites.
 * Uses lazy initialization (no top-level await — CJS compatible).
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app";

let app: FastifyInstance | null = null;

async function getApp(): Promise<FastifyInstance> {
  if (!app) {
    app = await buildApp();
    await app.ready();
  }
  return app;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  try {
    const server = await getApp();
    server.server.emit("request", req, res);
  } catch (err) {
    console.error("Handler error:", err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

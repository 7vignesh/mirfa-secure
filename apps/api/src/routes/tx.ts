/**
 * Transaction routes — encrypt, fetch, decrypt.
 */

import type { FastifyInstance } from "fastify";
import { encrypt, decrypt } from "@repo/crypto";
import { MASTER_KEY } from "../config";
import { save, findById } from "../store";

interface EncryptBody {
  partyId: string;
  payload: unknown;
}

export async function txRoutes(app: FastifyInstance) {
  /**
   * POST /tx/encrypt
   * Encrypt a JSON payload and store the record.
   */
  app.post<{ Body: EncryptBody }>("/tx/encrypt", async (request, reply) => {
    const { partyId, payload } = request.body;

    if (!partyId || typeof partyId !== "string") {
      return reply.status(400).send({ error: "partyId is required" });
    }

    if (payload === undefined || payload === null) {
      return reply.status(400).send({ error: "payload is required" });
    }

    try {
      const record = encrypt(partyId, payload, MASTER_KEY);
      save(record);
      return reply.status(201).send(record);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Encryption failed";
      return reply.status(500).send({ error: message });
    }
  });

  /**
   * GET /tx/:id
   * Return the stored encrypted record (no decryption).
   */
  app.get<{ Params: { id: string } }>("/tx/:id", async (request, reply) => {
    const record = findById(request.params.id);

    if (!record) {
      return reply.status(404).send({ error: "Record not found" });
    }

    return reply.send(record);
  });

  /**
   * POST /tx/:id/decrypt
   * Decrypt a stored record and return the original payload.
   */
  app.post<{ Params: { id: string } }>(
    "/tx/:id/decrypt",
    async (request, reply) => {
      const record = findById(request.params.id);

      if (!record) {
        return reply.status(404).send({ error: "Record not found" });
      }

      try {
        const payload = decrypt(record, MASTER_KEY);
        return reply.send({ payload });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Decryption failed";
        return reply.status(400).send({ error: message });
      }
    }
  );
}

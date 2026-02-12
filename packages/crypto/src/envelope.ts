/**
 * Envelope Encryption using AES-256-GCM.
 *
 * Flow:
 *   1. Generate a random Data Encryption Key (DEK) — 32 bytes
 *   2. Encrypt the plaintext payload with the DEK (AES-256-GCM, 12-byte nonce)
 *   3. Wrap (encrypt) the DEK with a Master Key (AES-256-GCM, 12-byte nonce)
 *   4. Return all components as hex strings in a TxSecureRecord
 *
 * Decryption reverses the process: unwrap DEK → decrypt payload.
 */

import { randomBytes, createCipheriv, createDecipheriv } from "node:crypto";
import { randomUUID } from "node:crypto";
import type { TxSecureRecord } from "./types";
import { validateRecord } from "./validate";

const ALG = "aes-256-gcm" as const;

/**
 * Encrypt a JSON payload using envelope encryption.
 *
 * @param partyId  - Identifier for the party
 * @param payload  - The JSON-serialisable object to encrypt
 * @param masterKey - 32-byte master key (KEK) used to wrap the DEK
 * @returns A fully populated TxSecureRecord with hex-encoded binary fields
 */
export function encrypt(
  partyId: string,
  payload: unknown,
  masterKey: Buffer
): TxSecureRecord {
  if (masterKey.length !== 32) {
    throw new Error("Master key must be 32 bytes");
  }

  const plaintext = JSON.stringify(payload);

  // --- Step 1: Generate DEK ---
  const dek = randomBytes(32);

  // --- Step 2: Encrypt payload with DEK ---
  const payloadNonce = randomBytes(12);
  const payloadCipher = createCipheriv(ALG, dek, payloadNonce);
  const payloadCt = Buffer.concat([
    payloadCipher.update(plaintext, "utf8"),
    payloadCipher.final(),
  ]);
  const payloadTag = payloadCipher.getAuthTag(); // 16 bytes

  // --- Step 3: Wrap DEK with Master Key ---
  const dekWrapNonce = randomBytes(12);
  const wrapCipher = createCipheriv(ALG, masterKey, dekWrapNonce);
  const wrappedDek = Buffer.concat([
    wrapCipher.update(dek),
    wrapCipher.final(),
  ]);
  const dekWrapTag = wrapCipher.getAuthTag(); // 16 bytes

  // --- Step 4: Assemble record ---
  return {
    id: randomUUID(),
    partyId,
    createdAt: new Date().toISOString(),

    payload_nonce: payloadNonce.toString("hex"),
    payload_ct: payloadCt.toString("hex"),
    payload_tag: payloadTag.toString("hex"),

    dek_wrap_nonce: dekWrapNonce.toString("hex"),
    dek_wrapped: wrappedDek.toString("hex"),
    dek_wrap_tag: dekWrapTag.toString("hex"),

    alg: "AES-256-GCM",
    mk_version: 1,
  };
}

/**
 * Decrypt a TxSecureRecord back to the original payload.
 *
 * @param record   - The encrypted record
 * @param masterKey - 32-byte master key used during encryption
 * @returns The original JSON payload
 */
export function decrypt(
  record: TxSecureRecord,
  masterKey: Buffer
): unknown {
  if (masterKey.length !== 32) {
    throw new Error("Master key must be 32 bytes");
  }

  // Validate all hex/length constraints before attempting decryption
  validateRecord(record);

  // --- Step 1: Unwrap DEK ---
  const dekWrapNonce = Buffer.from(record.dek_wrap_nonce, "hex");
  const wrappedDek = Buffer.from(record.dek_wrapped, "hex");
  const dekWrapTag = Buffer.from(record.dek_wrap_tag, "hex");

  const unwrapDecipher = createDecipheriv(ALG, masterKey, dekWrapNonce);
  unwrapDecipher.setAuthTag(dekWrapTag);

  const dek = Buffer.concat([
    unwrapDecipher.update(wrappedDek),
    unwrapDecipher.final(),
  ]);

  // --- Step 2: Decrypt payload ---
  const payloadNonce = Buffer.from(record.payload_nonce, "hex");
  const payloadCt = Buffer.from(record.payload_ct, "hex");
  const payloadTag = Buffer.from(record.payload_tag, "hex");

  const decipher = createDecipheriv(ALG, dek, payloadNonce);
  decipher.setAuthTag(payloadTag);

  const plaintext = Buffer.concat([
    decipher.update(payloadCt),
    decipher.final(),
  ]);

  return JSON.parse(plaintext.toString("utf8"));
}

/**
 * Master key configuration.
 * Loads from MASTER_KEY env var (64-char hex = 32 bytes).
 * Falls back to a static dev-only key for local development.
 */

// ⚠️  DEV-ONLY fallback — NEVER use this in production
const DEV_MASTER_KEY_HEX =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

const hex = process.env.MASTER_KEY ?? DEV_MASTER_KEY_HEX;

if (!/^[0-9a-f]{64}$/i.test(hex)) {
  throw new Error(
    "MASTER_KEY must be a 64-character hex string (32 bytes). " +
      "Set the MASTER_KEY environment variable."
  );
}

export const MASTER_KEY = Buffer.from(hex, "hex");

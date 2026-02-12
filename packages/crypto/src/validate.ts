/**
 * Validation helpers for TxSecureRecord fields.
 * Ensures correctness of hex encoding, nonce length, and tag length.
 */

const HEX_RE = /^[0-9a-f]+$/i;

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/** Assert that a string is valid hex. */
export function assertHex(value: string, fieldName: string): void {
  if (!HEX_RE.test(value)) {
    throw new ValidationError(`${fieldName} is not valid hex`);
  }
}

/** Assert that a hex-encoded value decodes to exactly 12 bytes (96 bits). */
export function assertNonceLength(hex: string, fieldName: string): void {
  assertHex(hex, fieldName);
  const bytes = Buffer.from(hex, "hex");
  if (bytes.length !== 12) {
    throw new ValidationError(
      `${fieldName} must be 12 bytes (got ${bytes.length})`
    );
  }
}

/** Assert that a hex-encoded value decodes to exactly 16 bytes (128 bits). */
export function assertTagLength(hex: string, fieldName: string): void {
  assertHex(hex, fieldName);
  const bytes = Buffer.from(hex, "hex");
  if (bytes.length !== 16) {
    throw new ValidationError(
      `${fieldName} must be 16 bytes (got ${bytes.length})`
    );
  }
}

/** Validate all fields of a TxSecureRecord. */
export function validateRecord(record: {
  payload_nonce: string;
  payload_ct: string;
  payload_tag: string;
  dek_wrap_nonce: string;
  dek_wrapped: string;
  dek_wrap_tag: string;
}): void {
  assertNonceLength(record.payload_nonce, "payload_nonce");
  assertHex(record.payload_ct, "payload_ct");
  assertTagLength(record.payload_tag, "payload_tag");

  assertNonceLength(record.dek_wrap_nonce, "dek_wrap_nonce");
  assertHex(record.dek_wrapped, "dek_wrapped");
  assertTagLength(record.dek_wrap_tag, "dek_wrap_tag");
}

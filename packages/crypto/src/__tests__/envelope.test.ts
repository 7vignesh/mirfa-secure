import { describe, it, expect } from "vitest";
import { randomBytes } from "node:crypto";
import {
  encrypt,
  decrypt,
  validateRecord,
  assertNonceLength,
  assertHex,
  ValidationError,
} from "../index.js";

// Generate a random 32-byte master key for testing
const MASTER_KEY = randomBytes(32);

const SAMPLE_PAYLOAD = { amount: 100, currency: "AED" };
const PARTY_ID = "party_test";

describe("Envelope Encryption", () => {
  it("encrypt → decrypt returns original payload", () => {
    const record = encrypt(PARTY_ID, SAMPLE_PAYLOAD, MASTER_KEY);

    expect(record.partyId).toBe(PARTY_ID);
    expect(record.alg).toBe("AES-256-GCM");
    expect(record.mk_version).toBe(1);

    const decrypted = decrypt(record, MASTER_KEY);
    expect(decrypted).toEqual(SAMPLE_PAYLOAD);
  });

  it("tampered ciphertext fails decryption", () => {
    const record = encrypt(PARTY_ID, SAMPLE_PAYLOAD, MASTER_KEY);

    // Flip a byte in the payload ciphertext
    const ctBuf = Buffer.from(record.payload_ct, "hex");
    ctBuf[0] ^= 0xff;
    record.payload_ct = ctBuf.toString("hex");

    expect(() => decrypt(record, MASTER_KEY)).toThrow();
  });

  it("tampered auth tag fails decryption", () => {
    const record = encrypt(PARTY_ID, SAMPLE_PAYLOAD, MASTER_KEY);

    // Flip a byte in the payload auth tag
    const tagBuf = Buffer.from(record.payload_tag, "hex");
    tagBuf[0] ^= 0xff;
    record.payload_tag = tagBuf.toString("hex");

    expect(() => decrypt(record, MASTER_KEY)).toThrow();
  });

  it("tampered wrapped DEK fails decryption", () => {
    const record = encrypt(PARTY_ID, SAMPLE_PAYLOAD, MASTER_KEY);

    // Flip a byte in the wrapped DEK
    const dekBuf = Buffer.from(record.dek_wrapped, "hex");
    dekBuf[0] ^= 0xff;
    record.dek_wrapped = dekBuf.toString("hex");

    expect(() => decrypt(record, MASTER_KEY)).toThrow();
  });

  it("wrong nonce length is rejected by validation", () => {
    const record = encrypt(PARTY_ID, SAMPLE_PAYLOAD, MASTER_KEY);

    // Replace the 12-byte nonce with a 10-byte one
    record.payload_nonce = randomBytes(10).toString("hex");

    expect(() => validateRecord(record)).toThrow(ValidationError);
    expect(() => validateRecord(record)).toThrow("must be 12 bytes");
  });

  it("invalid hex string is rejected", () => {
    expect(() => assertHex("not-hex!!", "test_field")).toThrow(ValidationError);
    expect(() => assertHex("not-hex!!", "test_field")).toThrow(
      "not valid hex"
    );
  });

  it("wrong tag length is rejected by validation", () => {
    const record = encrypt(PARTY_ID, SAMPLE_PAYLOAD, MASTER_KEY);

    // Replace 16-byte tag with 8-byte one
    record.payload_tag = randomBytes(8).toString("hex");

    expect(() => validateRecord(record)).toThrow(ValidationError);
    expect(() => validateRecord(record)).toThrow("must be 16 bytes");
  });

  it("wrong master key fails decryption", () => {
    const record = encrypt(PARTY_ID, SAMPLE_PAYLOAD, MASTER_KEY);
    const wrongKey = randomBytes(32);

    expect(() => decrypt(record, wrongKey)).toThrow();
  });
});

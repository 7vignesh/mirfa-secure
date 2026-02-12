/**
 * In-memory store for encrypted transaction records.
 */

import type { TxSecureRecord } from "@repo/crypto";

const store = new Map<string, TxSecureRecord>();

export function save(record: TxSecureRecord): void {
  store.set(record.id, record);
}

export function findById(id: string): TxSecureRecord | undefined {
  return store.get(id);
}

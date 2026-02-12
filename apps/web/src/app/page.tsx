"use client";

import { useState } from "react";
import { encryptPayload, fetchRecord, decryptRecord } from "@/lib/api";

export default function Home() {
  const [partyId, setPartyId] = useState("party_123");
  const [jsonPayload, setJsonPayload] = useState(
    JSON.stringify({ amount: 100, currency: "AED" }, null, 2)
  );
  const [recordId, setRecordId] = useState("");
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setLoading(true);
    setError("");
    try {
      const data = await fn();
      setResult(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      setError(
        `${label} failed: ${err instanceof Error ? err.message : String(err)}`
      );
      setResult("");
    } finally {
      setLoading(false);
    }
  };

  const handleEncrypt = () =>
    run("Encrypt", async () => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonPayload);
      } catch {
        throw new Error("Invalid JSON payload");
      }
      const data = await encryptPayload(partyId, parsed);
      setRecordId(data.id);
      return data;
    });

  const handleFetch = () =>
    run("Fetch", async () => {
      if (!recordId) throw new Error("No record ID — encrypt first");
      return fetchRecord(recordId);
    });

  const handleDecrypt = () =>
    run("Decrypt", async () => {
      if (!recordId) throw new Error("No record ID — encrypt first");
      return decryptRecord(recordId);
    });

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-1">Mirfa</h1>
      <p className="text-gray-400 mb-8 text-sm">
        Secure Transaction Service — Envelope Encryption (AES-256-GCM)
      </p>

      {/* Party ID */}
      <label className="block text-sm font-medium mb-1">Party ID</label>
      <input
        type="text"
        value={partyId}
        onChange={(e) => setPartyId(e.target.value)}
        className="w-full mb-4 px-3 py-2 rounded-md bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        placeholder="party_123"
      />

      {/* JSON Payload */}
      <label className="block text-sm font-medium mb-1">JSON Payload</label>
      <textarea
        value={jsonPayload}
        onChange={(e) => setJsonPayload(e.target.value)}
        rows={5}
        className="w-full mb-4 px-3 py-2 rounded-md bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        placeholder='{ "amount": 100, "currency": "AED" }'
      />

      {/* Action Buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={handleEncrypt}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md text-sm font-medium transition-colors cursor-pointer"
        >
          Encrypt &amp; Save
        </button>
        <button
          onClick={handleFetch}
          disabled={loading || !recordId}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-md text-sm font-medium transition-colors cursor-pointer"
        >
          Fetch
        </button>
        <button
          onClick={handleDecrypt}
          disabled={loading || !recordId}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-md text-sm font-medium transition-colors cursor-pointer"
        >
          Decrypt
        </button>
      </div>

      {/* Record ID */}
      {recordId && (
        <p className="text-xs text-gray-400 mb-4">
          Record ID:{" "}
          <code className="bg-gray-900 px-1 py-0.5 rounded">{recordId}</code>
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-900/40 border border-red-700 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <pre className="p-4 rounded-md bg-gray-900 border border-gray-700 overflow-x-auto text-xs leading-relaxed">
          {result}
        </pre>
      )}
    </main>
  );
}

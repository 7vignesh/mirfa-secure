const raw = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
// Strip trailing slash to avoid double-slash in URLs
const API_BASE = raw.replace(/\/+$/, "");

export async function encryptPayload(partyId: string, payload: unknown) {
  const res = await fetch(`${API_BASE}/tx/encrypt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ partyId, payload }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
  }

  return res.json();
}

export async function fetchRecord(id: string) {
  const res = await fetch(`${API_BASE}/tx/${id}`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
  }

  return res.json();
}

export async function decryptRecord(id: string) {
  const res = await fetch(`${API_BASE}/tx/${id}/decrypt`, {
    method: "POST",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
  }

  return res.json();
}

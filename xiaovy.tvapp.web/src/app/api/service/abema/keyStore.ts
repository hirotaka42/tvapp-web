const KEY_TTL_MS = 10 * 60 * 1000;

interface KeyEntry {
  key: Uint8Array;
  expiresAt: number;
}

const sessions = new Map<string, Map<string, KeyEntry>>();

export function putAbemaKeys(sessionId: string, keys: Record<string, string>, now = Date.now()): void {
  const session = new Map<string, KeyEntry>();

  for (const [ticket, encodedKey] of Object.entries(keys)) {
    const key = decodeKey(encodedKey);
    if (key?.byteLength === 16) {
      session.set(ticket, { key, expiresAt: now + KEY_TTL_MS });
    }
  }

  if (session.size > 0) {
    sessions.set(sessionId, session);
  }
}

export function getAbemaKey(sessionId: string, ticket: string, now = Date.now()): Uint8Array | null {
  const session = sessions.get(sessionId);
  const entry = session?.get(ticket);

  if (!session || !entry) return null;

  if (entry.expiresAt <= now) {
    session.delete(ticket);
    if (session.size === 0) sessions.delete(sessionId);
    return null;
  }

  return entry.key;
}

function decodeKey(value: string): Uint8Array | null {
  if (/^[0-9a-f]{32}$/i.test(value)) {
    return Uint8Array.from(value.match(/.{2}/g)!.map((byte) => Number.parseInt(byte, 16)));
  }

  try {
    const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

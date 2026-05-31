import { randomUUID } from 'crypto';

interface Session {
  id: string;
  keys: Record<string, string>;
  createdAt: number;
}

const sessions = new Map<string, Session>();

export function createSession(keys: Record<string, string>): string {
  const id = randomUUID();
  sessions.set(id, { id, keys, createdAt: Date.now() });
  return id;
}

export function getSession(id: string): Session | undefined {
  return sessions.get(id);
}

export function deleteSession(id: string): void {
  sessions.delete(id);
}

export function cleanupStaleSessions(maxAgeMs = 3600000): void {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.createdAt > maxAgeMs) {
      sessions.delete(id);
    }
  }
}

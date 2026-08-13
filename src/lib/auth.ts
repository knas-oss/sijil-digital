// Auth helper utilities
import { db } from './db';

export interface SessionUser {
  id: string;
  namaPenuh: string;
  emel: string;
  peranan: string;
}

// Simple in-memory session store
const sessions = new Map<string, { user: SessionUser; expires: number }>();

export function createSession(user: SessionUser): string {
  const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
  sessions.set(token, {
    user,
    expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });
  return token;
}

export function getSession(token: string): SessionUser | null {
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expires) {
    sessions.delete(token);
    return null;
  }
  return session.user;
}

export function destroySession(token: string): void {
  sessions.delete(token);
}

// Hash password (simple approach using Web Crypto API)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'esijil-adtec-salt-2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

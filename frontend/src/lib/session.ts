import type { User } from "@/types/models";

const TOKEN_KEY = "nexora.accessToken";
const USER_KEY = "nexora.user";

export interface StoredSession {
  user: User;
  accessToken: string;
}

function readFromStorage(): StoredSession | null {
  if (typeof window === "undefined") return null;

  const accessToken = window.localStorage.getItem(TOKEN_KEY);
  const rawUser = window.localStorage.getItem(USER_KEY);
  if (!accessToken || !rawUser) return null;

  try {
    return { accessToken, user: JSON.parse(rawUser) as User };
  } catch {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
}

let snapshot: StoredSession | null = readFromStorage();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSessionSnapshot(): StoredSession | null {
  return snapshot;
}

export function getServerSessionSnapshot(): StoredSession | null {
  return null;
}

export function readToken(): string | null {
  return snapshot?.accessToken ?? null;
}

export function writeSession(session: StoredSession) {
  window.localStorage.setItem(TOKEN_KEY, session.accessToken);
  window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  snapshot = session;
  emit();
}

export function clearSession() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  }
  snapshot = null;
  emit();
}

let unauthorizedHandler: (() => void) | null = null;

/** Registered by the auth provider so the api client can end an invalid session. */
export function onUnauthorized(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export function notifyUnauthorized() {
  clearSession();
  unauthorizedHandler?.();
}

import { API_BASE_URL } from './config';
import { useSession } from '@/store/session';

// Authed fetch against the NestJS API (routes live under /v1). Attaches the
// access token, and on a 401 tries the refresh token ONCE before retrying;
// if refresh fails the session is cleared (kicks the user back to login).
const BASE = `${API_BASE_URL}/v1`;

async function raw(path: string, init: RequestInit, token: string | null): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
}

async function doRefresh(): Promise<boolean> {
  const rt = useSession.getState().refreshToken;
  if (!rt) return false;
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { accessToken?: string; refreshToken?: string };
    if (!data.accessToken || !data.refreshToken) return false;
    useSession.getState().setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

// The backend ROTATES the refresh token on every refresh, so two concurrent
// refreshes would spend the same token twice — the second fails and logs the
// user out. Single-flight it: all concurrent 401s await ONE refresh.
let refreshInFlight: Promise<boolean> | null = null;
function tryRefresh(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = doRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

// Low-level: returns the raw Response (never throws on HTTP status), so callers
// can special-case e.g. 404. Handles the one-shot token refresh.
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  let res = await raw(path, init, useSession.getState().accessToken);
  if (res.status === 401 && (await tryRefresh())) {
    res = await raw(path, init, useSession.getState().accessToken);
  }
  if (res.status === 401) useSession.getState().signOut();
  return res;
}

// High-level: parses JSON and throws Error(message) on any non-2xx.
export async function authedFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, init);
  if (!res.ok) {
    const e = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
    throw new Error(e.message ?? e.error ?? `Request failed (${res.status})`);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

import { API_BASE_URL } from './config';
import type { Me } from './types';

interface ApiUser {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  country: string | null;
  stats: {
    xp: number;
    level: number;
    streakCount: number;
    competitionsPlayed: number;
    wins: number;
    winRate: number;
  };
}

interface ApiAuthResult {
  user: ApiUser;
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession {
  user: Me;
  accessToken: string;
  refreshToken: string;
}

function toMe(u: ApiUser): Me {
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    displayName: u.displayName ?? u.username,
    avatarUrl: u.avatarUrl,
    country: u.country ?? 'TR',
    gems: 500,
    stats: u.stats,
  };
}

async function post(path: string, body: unknown): Promise<AuthSession> {
  const res = await fetch(`${API_BASE_URL}/v1${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const e = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
    throw new Error(e.message ?? e.error ?? `Request failed (${res.status})`);
  }
  const data = (await res.json()) as ApiAuthResult;
  return { user: toMe(data.user), accessToken: data.accessToken, refreshToken: data.refreshToken };
}

export const authApi = {
  google: (idToken: string) => post('/auth/google', { idToken }),
  login: (email: string, password: string) => post('/auth/login', { email, password }),
  register: (email: string, password: string, username: string) =>
    post('/auth/register', { email, password, username }),
};

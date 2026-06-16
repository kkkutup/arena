import { create } from 'zustand';
import type { Me } from '@/api/types';
import type { AuthSession } from '@/api/auth';

type AuthMethod = 'google' | 'apple' | 'email';

interface SessionState {
  user: Me | null;
  accessToken: string | null;
  refreshToken: string | null;
  needsProfile: boolean;
  // Real auth (backend): store tokens + user.
  setSession: (session: AuthSession) => void;
  // Mock auth (used by the email form until it's wired to the backend).
  signInWith: (method: AuthMethod, email?: string) => void;
  completeProfile: (username: string, displayName?: string) => void;
  signOut: () => void;
}

export const useSession = create<SessionState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  needsProfile: false,

  setSession: (session) =>
    set({
      user: session.user,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      needsProfile: false,
    }),

  signInWith: (method, email) =>
    set({
      needsProfile: true,
      accessToken: null,
      refreshToken: null,
      user: {
        id: 'me',
        username: '',
        displayName: '',
        avatarUrl: null,
        country: 'TR',
        email: email ?? `${method}@arena.app`,
        gems: 500,
        stats: {
          xp: 0,
          level: 1,
          streakCount: 0,
          competitionsPlayed: 0,
          wins: 0,
          winRate: 0,
        },
      },
    }),

  completeProfile: (username, displayName) =>
    set((s) =>
      s.user
        ? {
            needsProfile: false,
            user: {
              ...s.user,
              username: username.trim(),
              displayName: displayName?.trim() || username.trim(),
              stats: { ...s.user.stats, xp: 430, level: 4, streakCount: 7 },
            },
          }
        : s,
    ),

  signOut: () => set({ user: null, accessToken: null, refreshToken: null, needsProfile: false }),
}));

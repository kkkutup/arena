import { create } from 'zustand';
import type { Me } from '@/api/types';

type AuthMethod = 'google' | 'apple' | 'email';

interface SessionState {
  user: Me | null;
  needsProfile: boolean;
  signInWith: (method: AuthMethod, email?: string) => void;
  completeProfile: (username: string, displayName?: string) => void;
  signOut: () => void;
}

// Mock auth for the UI-first phase. Any sign-in creates a fresh local user and
// routes through profile setup. Swapped for real JWT auth when the backend
// (B1) is wired in.
export const useSession = create<SessionState>((set) => ({
  user: null,
  needsProfile: false,

  signInWith: (method, email) =>
    set({
      needsProfile: true,
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
              // give the mock account some life so screens look populated
              stats: { ...s.user.stats, xp: 430, level: 4, streakCount: 7 },
            },
          }
        : s,
    ),

  signOut: () => set({ user: null, needsProfile: false }),
}));

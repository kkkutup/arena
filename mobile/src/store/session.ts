import { create } from 'zustand';
import type { Me } from '@/api/types';
import type { AuthSession } from '@/api/auth';
import { useWallet } from '@/store/wallet';
import { useMyCompetitions } from '@/store/competitions';

type AuthMethod = 'google' | 'apple' | 'email';

interface SessionState {
  user: Me | null;
  accessToken: string | null;
  refreshToken: string | null;
  needsProfile: boolean;
  // First-login coach-mark tour shown? (in-memory for now; persist with
  // AsyncStorage later — that's a native add, so it needs a rebuild.)
  tourSeen: boolean;
  markTourSeen: () => void;
  // Backtest mini-game intro tour shown?
  btTourSeen: boolean;
  markBtTourSeen: () => void;
  // Award XP (e.g. from the backtest game); recomputes level.
  addXp: (n: number) => void;
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
  tourSeen: false,
  btTourSeen: false,

  markTourSeen: () => set({ tourSeen: true }),
  markBtTourSeen: () => set({ btTourSeen: true }),

  addXp: (n) =>
    set((s) =>
      s.user
        ? {
            user: {
              ...s.user,
              stats: {
                ...s.user.stats,
                xp: s.user.stats.xp + n,
                level: Math.floor((s.user.stats.xp + n) / 100) + 1,
              },
            },
          }
        : s,
    ),

  setSession: (session) => {
    useWallet.getState().reset();
    set({
      user: session.user,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      needsProfile: false,
    });
  },

  signInWith: (method, email) => {
    useWallet.getState().reset();
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
    });
  },

  // New users start fresh — no fake XP/level/streak. They earn it in-app.
  completeProfile: (username, displayName) =>
    set((s) =>
      s.user
        ? {
            needsProfile: false,
            user: {
              ...s.user,
              username: username.trim(),
              displayName: displayName?.trim() || username.trim(),
            },
          }
        : s,
    ),

  signOut: () => {
    useWallet.getState().reset();
    useMyCompetitions.getState().reset();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      needsProfile: false,
      tourSeen: false,
      btTourSeen: false,
    });
  },
}));

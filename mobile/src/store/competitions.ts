import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from '@/store/persist';
import type { Competition, CompetitionType } from '@/api/types';

// Client-side source of truth for the competitions a user has created or joined.
// Mock for now (in-memory); swaps to backend POST /v1/competitions later.
export interface CreateInput {
  name: string;
  type: CompetitionType;
  instruments: string[];
  durationHours: number;
  startingBalance: number;
  maxLeverage: number;
}

function joinCode(): string {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += A[Math.floor(Math.random() * A.length)];
  return s;
}

interface CompetitionsState {
  mine: Competition[];
  create: (input: CreateInput) => Competition;
  joinByCode: (code: string) => Competition;
  join: (comp: Competition) => Competition;
  getById: (id: string) => Competition | undefined;
  reset: () => void;
}

export const useMyCompetitions = create<CompetitionsState>()(
  persist(
    (set, get) => ({
      mine: [],

  create: (input) => {
    const now = Date.now();
    const c: Competition = {
      id: `uc_${now}`,
      name: input.name.trim(),
      type: input.type,
      instruments: input.instruments,
      startingBalance: input.startingBalance,
      maxLeverage: input.maxLeverage,
      status: 'LIVE',
      startAt: new Date(now).toISOString(),
      endAt: new Date(now + input.durationHours * 3_600_000).toISOString(),
      joinCode: joinCode(),
      participantCount: 1,
      myRank: 1,
      myEquity: input.startingBalance,
      myReturnPct: 0,
    };
    set((s) => ({ mine: [c, ...s.mine] }));
    return c;
  },

  joinByCode: (code) => {
    // If the code matches a competition you already have, open that one.
    const existing = get().mine.find((c) => c.joinCode?.toUpperCase() === code.toUpperCase());
    if (existing) return existing;
    const now = Date.now();
    const c: Competition = {
      id: `uc_${now}`,
      name: 'Friends League',
      type: 'PRIVATE_LEAGUE',
      instruments: ['BTCUSDT', 'ETHUSDT'],
      startingBalance: 100_000,
      maxLeverage: 20,
      status: 'LIVE',
      startAt: new Date(now).toISOString(),
      endAt: new Date(now + 72 * 3_600_000).toISOString(),
      joinCode: code.toUpperCase(),
      participantCount: 2,
      myRank: 2,
      myEquity: 100_000,
      myReturnPct: 0,
    };
    set((s) => ({ mine: [c, ...s.mine] }));
    return c;
  },

  // Join an existing (e.g. public/browsed) competition.
  join: (comp) => {
    const existing = get().mine.find((c) => c.id === comp.id);
    if (existing) return existing;
    const joined: Competition = {
      ...comp,
      participantCount: comp.participantCount + 1,
      myRank: comp.participantCount + 1,
      myEquity: comp.startingBalance,
      myReturnPct: 0,
    };
    set((s) => ({ mine: [joined, ...s.mine] }));
    return joined;
  },

      getById: (id) => get().mine.find((c) => c.id === id),

      reset: () => set({ mine: [] }),
    }),
    {
      name: 'arena-competitions',
      storage: jsonStorage,
      partialize: (s) => ({ mine: s.mine }),
    },
  ),
);

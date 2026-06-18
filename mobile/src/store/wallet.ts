import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from '@/store/persist';

// Diamonds — Arena's soft currency. Earned by playing (daily login, ads),
// spent to create/join competitions. Real-money purchase (Google Pay) is
// stubbed for now. COMPLIANCE: purchased diamonds must never buy a cash-prize
// leaderboard placing — keep competitions virtual-money / bragging-rights.
export const DIAMOND = {
  START: 100, // new account grant
  DAILY: 50, // daily login bonus
  CREATE_COST: 25, // create a competition
  JOIN_COST: 10, // join a competition
  AD_REWARD: 30, // rewarded ad (stub)
  BACKTEST_COST: 5, // play one backtest round
  TRADE_REWARD: 1, // earned per successful (profitable) trade
} as const;

function today(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD (local-ish, fine for mock)
}

interface WalletState {
  balance: number;
  lastDailyClaim: string | null;
  storeOpen: boolean;
  // lifecycle
  reset: () => void; // new account: grant START, daily not yet claimed
  // earn
  claimDaily: () => number; // grants DAILY on a new day; returns amount (0 if already claimed)
  add: (n: number) => void; // ad reward / purchase
  // spend
  canAfford: (n: number) => boolean;
  spend: (n: number) => boolean; // true on success, false if too poor
  // get-diamonds sheet
  openStore: () => void;
  closeStore: () => void;
}

export const useWallet = create<WalletState>()(
  persist(
    (set, get) => ({
      balance: DIAMOND.START,
      lastDailyClaim: null,
      storeOpen: false,

      reset: () => set({ balance: DIAMOND.START, lastDailyClaim: null, storeOpen: false }),

      claimDaily: () => {
        const t = today();
        if (get().lastDailyClaim === t) return 0;
        set((s) => ({ balance: s.balance + DIAMOND.DAILY, lastDailyClaim: t }));
        return DIAMOND.DAILY;
      },

      add: (n) => set((s) => ({ balance: s.balance + n })),

      canAfford: (n) => get().balance >= n,

      spend: (n) => {
        if (get().balance < n) return false;
        set((s) => ({ balance: s.balance - n }));
        return true;
      },

      openStore: () => set({ storeOpen: true }),
      closeStore: () => set({ storeOpen: false }),
    }),
    {
      name: 'arena-wallet',
      storage: jsonStorage,
      partialize: (s) => ({ balance: s.balance, lastDailyClaim: s.lastDailyClaim }),
    },
  ),
);

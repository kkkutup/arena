import { create } from 'zustand';
import type { Side } from '@/api/types';
import { marginRequired, liquidationPrice, unrealizedPnl } from '@/features/trade/engine';

export interface OpenPosition {
  id: string;
  symbol: string;
  side: Side;
  qty: number;
  leverage: number;
  entryPrice: number;
  margin: number;
  liquidationPrice: number;
  openedAt: number;
}

export interface ClosedTrade {
  id: string;
  symbol: string;
  side: Side;
  qty: number;
  entryPrice: number;
  closePrice: number;
  pnl: number;
  liquidated: boolean;
  at: number;
}

// One trading account PER competition (keyed by competition id). Each starts
// fresh at the competition's starting balance, so P&L never bleeds between
// competitions. ('practice' is the key for the standalone sandbox.)
export interface Account {
  startingBalance: number;
  cashBalance: number;
  positions: OpenPosition[];
  history: ClosedTrade[];
}

interface TradeState {
  accounts: Record<string, Account>;
  ensure: (key: string, startingBalance: number) => void;
  open: (
    key: string,
    a: { symbol: string; side: Side; qty: number; leverage: number; price: number },
  ) => string | null;
  close: (key: string, id: string, price: number) => void;
  settleLiquidation: (key: string, id: string) => void;
  resetAll: () => void;
}

let counter = 0;

const blank = (startingBalance: number): Account => ({
  startingBalance,
  cashBalance: startingBalance,
  positions: [],
  history: [],
});

export const useTrade = create<TradeState>((set, get) => ({
  accounts: {},

  ensure: (key, startingBalance) =>
    set((st) =>
      st.accounts[key] ? st : { accounts: { ...st.accounts, [key]: blank(startingBalance) } },
    ),

  open: (key, { symbol, side, qty, leverage, price }) => {
    const acct = get().accounts[key];
    if (!acct || !(qty > 0) || !(price > 0)) return null;
    const margin = marginRequired(qty, price, leverage);
    const used = acct.positions.reduce((s, p) => s + p.margin, 0);
    if (margin > acct.cashBalance - used + 1e-9) return null; // insufficient free margin
    const id = `pos_${++counter}`;
    const pos: OpenPosition = {
      id,
      symbol,
      side,
      qty,
      leverage,
      entryPrice: price,
      margin,
      liquidationPrice: liquidationPrice(side, price, leverage),
      openedAt: Date.now(),
    };
    set((st) => ({
      accounts: {
        ...st.accounts,
        [key]: { ...st.accounts[key], positions: [pos, ...st.accounts[key].positions] },
      },
    }));
    return id;
  },

  close: (key, id, price) =>
    set((st) => {
      const acct = st.accounts[key];
      const pos = acct?.positions.find((p) => p.id === id);
      if (!acct || !pos) return st;
      const pnl = unrealizedPnl(pos.side, pos.qty, pos.entryPrice, price);
      return {
        accounts: {
          ...st.accounts,
          [key]: {
            ...acct,
            cashBalance: acct.cashBalance + pnl,
            positions: acct.positions.filter((p) => p.id !== id),
            history: [toClosed(pos, price, pnl, false), ...acct.history],
          },
        },
      };
    }),

  settleLiquidation: (key, id) =>
    set((st) => {
      const acct = st.accounts[key];
      const pos = acct?.positions.find((p) => p.id === id);
      if (!acct || !pos) return st;
      const pnl = unrealizedPnl(pos.side, pos.qty, pos.entryPrice, pos.liquidationPrice);
      return {
        accounts: {
          ...st.accounts,
          [key]: {
            ...acct,
            cashBalance: acct.cashBalance + pnl,
            positions: acct.positions.filter((p) => p.id !== id),
            history: [toClosed(pos, pos.liquidationPrice, pnl, true), ...acct.history],
          },
        },
      };
    }),

  resetAll: () => set({ accounts: {} }),
}));

function toClosed(p: OpenPosition, closePrice: number, pnl: number, liquidated: boolean): ClosedTrade {
  return {
    id: p.id,
    symbol: p.symbol,
    side: p.side,
    qty: p.qty,
    entryPrice: p.entryPrice,
    closePrice,
    pnl,
    liquidated,
    at: Date.now(),
  };
}

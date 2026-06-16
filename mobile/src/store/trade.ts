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

interface TradeState {
  startingBalance: number;
  cashBalance: number;
  positions: OpenPosition[];
  history: ClosedTrade[];
  open: (a: { symbol: string; side: Side; qty: number; leverage: number; price: number }) => string | null;
  close: (id: string, price: number) => void;
  settleLiquidation: (id: string) => void;
  reset: () => void;
}

const STARTING = 100000;
let counter = 0;

export const useTrade = create<TradeState>((set, get) => ({
  startingBalance: STARTING,
  cashBalance: STARTING,
  positions: [],
  history: [],

  open: ({ symbol, side, qty, leverage, price }) => {
    if (!(qty > 0) || !(price > 0)) return null;
    const margin = marginRequired(qty, price, leverage);
    const used = get().positions.reduce((s, p) => s + p.margin, 0);
    if (margin > get().cashBalance - used + 1e-9) return null; // insufficient free margin
    const id = `pos_${++counter}`;
    set((st) => ({
      positions: [
        {
          id,
          symbol,
          side,
          qty,
          leverage,
          entryPrice: price,
          margin,
          liquidationPrice: liquidationPrice(side, price, leverage),
          openedAt: Date.now(),
        },
        ...st.positions,
      ],
    }));
    return id;
  },

  close: (id, price) =>
    set((st) => {
      const pos = st.positions.find((p) => p.id === id);
      if (!pos) return st;
      const pnl = unrealizedPnl(pos.side, pos.qty, pos.entryPrice, price);
      return {
        cashBalance: st.cashBalance + pnl,
        positions: st.positions.filter((p) => p.id !== id),
        history: [toClosed(pos, price, pnl, false), ...st.history],
      };
    }),

  settleLiquidation: (id) =>
    set((st) => {
      const pos = st.positions.find((p) => p.id === id);
      if (!pos) return st;
      const pnl = unrealizedPnl(pos.side, pos.qty, pos.entryPrice, pos.liquidationPrice);
      return {
        cashBalance: st.cashBalance + pnl,
        positions: st.positions.filter((p) => p.id !== id),
        history: [toClosed(pos, pos.liquidationPrice, pnl, true), ...st.history],
      };
    }),

  reset: () => set({ cashBalance: STARTING, positions: [], history: [] }),
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

import { create } from 'zustand';
import type { Drawing } from './drawings';

export type ChartTool = 'move' | 'hline' | 'trend' | 'channel';

// In-memory (per app session) chart drawings, keyed by symbol so they survive
// leaving/returning to the trade screen. Not persisted across app restarts.
interface ChartToolsState {
  tool: ChartTool;
  selectedId: string | null;
  bySymbol: Record<string, Drawing[]>;
  setTool: (t: ChartTool) => void;
  select: (id: string | null) => void;
  add: (symbol: string, d: Drawing) => void;
  replace: (symbol: string, d: Drawing) => void;
  remove: (symbol: string, id: string) => void;
  clear: (symbol: string) => void;
}

export const useChartTools = create<ChartToolsState>((set) => ({
  tool: 'move',
  selectedId: null,
  bySymbol: {},
  setTool: (tool) => set({ tool }),
  select: (selectedId) => set({ selectedId }),
  add: (symbol, d) =>
    set((s) => ({ bySymbol: { ...s.bySymbol, [symbol]: [...(s.bySymbol[symbol] ?? []), d] } })),
  replace: (symbol, d) =>
    set((s) => ({
      bySymbol: {
        ...s.bySymbol,
        [symbol]: (s.bySymbol[symbol] ?? []).map((x) => (x.id === d.id ? d : x)),
      },
    })),
  remove: (symbol, id) =>
    set((s) => ({
      bySymbol: { ...s.bySymbol, [symbol]: (s.bySymbol[symbol] ?? []).filter((x) => x.id !== id) },
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),
  clear: (symbol) => set((s) => ({ bySymbol: { ...s.bySymbol, [symbol]: [] }, selectedId: null })),
}));

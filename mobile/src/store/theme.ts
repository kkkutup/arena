import { create } from 'zustand';
import { applyTheme, type ThemeMode } from '@/theme/tokens';

// Night mode. The palette lives in tokens (`colors`, mutated in place by
// applyTheme); this store tracks the chosen mode and bumps `rev` on change so
// any component calling useThemeSync() re-renders and reads the fresh values.
// In-memory for now — persist with AsyncStorage later (native add = rebuild).
interface ThemeState {
  mode: ThemeMode;
  rev: number;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

export const useTheme = create<ThemeState>((set, get) => ({
  mode: 'light',
  rev: 0,
  setMode: (mode) => {
    applyTheme(mode);
    set((s) => ({ mode, rev: s.rev + 1 }));
  },
  toggle: () => get().setMode(get().mode === 'light' ? 'dark' : 'light'),
}));

// Subscribe a component to theme changes so it re-renders (and re-reads the
// live `colors`) when the mode flips. Returns the current mode.
export function useThemeSync(): ThemeMode {
  return useTheme((s) => {
    void s.rev;
    return s.mode;
  });
}

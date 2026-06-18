import { useEffect, useState } from 'react';
import { createJSONStorage, type StateStorage } from 'zustand/middleware';

// AsyncStorage is a NATIVE module. If the running build doesn't include it
// (e.g. an older dev build), touching it throws "NativeModule is null". So we
// load it defensively and wrap every call in try/catch, falling back to an
// in-memory map — the app then runs fine WITHOUT persistence, and real
// persistence kicks in for free once you're on a build that bundles
// AsyncStorage. Never crashes either way.
type AS = { getItem: (k: string) => Promise<string | null>; setItem: (k: string, v: string) => Promise<void>; removeItem: (k: string) => Promise<void> };
let AsyncStorage: AS | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  AsyncStorage = null;
}

const memory = new Map<string, string>();

const safeStorage: StateStorage = {
  getItem: async (name) => {
    if (AsyncStorage) {
      try {
        return await AsyncStorage.getItem(name);
      } catch {
        AsyncStorage = null;
      }
    }
    return memory.get(name) ?? null;
  },
  setItem: async (name, value) => {
    if (AsyncStorage) {
      try {
        await AsyncStorage.setItem(name, value);
        return;
      } catch {
        AsyncStorage = null;
      }
    }
    memory.set(name, value);
  },
  removeItem: async (name) => {
    if (AsyncStorage) {
      try {
        await AsyncStorage.removeItem(name);
        return;
      } catch {
        AsyncStorage = null;
      }
    }
    memory.delete(name);
  },
};

export const jsonStorage = createJSONStorage(() => safeStorage);

type Persisted = {
  persist: { hasHydrated: () => boolean; onFinishHydration: (cb: () => void) => () => void };
};

// True once every passed persisted store has finished rehydrating from storage.
// Gate the app on this so routing/theme read restored state, not defaults.
// Pass a STABLE array (module-level const) to avoid re-subscribing each render.
export function useStoresHydrated(stores: Persisted[]): boolean {
  const [hydrated, setHydrated] = useState(() => stores.every((s) => s.persist.hasHydrated()));
  useEffect(() => {
    const check = () => {
      if (stores.every((s) => s.persist.hasHydrated())) setHydrated(true);
    };
    check();
    const unsubs = stores.map((s) => s.persist.onFinishHydration(check));
    // Safety net: never block the app for more than 3s on storage.
    const fallback = setTimeout(() => setHydrated(true), 3000);
    return () => {
      unsubs.forEach((u) => u());
      clearTimeout(fallback);
    };
  }, [stores]);
  return hydrated;
}

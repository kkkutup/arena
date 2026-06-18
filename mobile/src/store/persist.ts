import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

// Shared AsyncStorage-backed JSON storage for zustand persist.
// NOTE: AsyncStorage is a NATIVE module — it only works in a dev/production
// build that includes it. On a build without it, persist logs a warning and
// the app simply runs in-memory (no crash); persistence kicks in after the
// next EAS build.
export const jsonStorage = createJSONStorage(() => AsyncStorage);

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

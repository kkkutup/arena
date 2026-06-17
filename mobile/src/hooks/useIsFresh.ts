import { useSession } from '@/store/session';

// A brand-new account: zero progress everywhere. Drives clean-slate empty
// states across the tabs instead of showing demo data.
export function useIsFresh(): boolean {
  const user = useSession((s) => s.user);
  if (!user) return true;
  const s = user.stats;
  return s.competitionsPlayed === 0 && s.streakCount === 0 && s.xp === 0;
}

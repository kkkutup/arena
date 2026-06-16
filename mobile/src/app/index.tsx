import { Redirect } from 'expo-router';
import { useSession } from '@/store/session';

// Auth gate: route to onboarding / profile-setup / app based on session.
export default function Index() {
  const user = useSession((s) => s.user);
  const needsProfile = useSession((s) => s.needsProfile);

  if (!user) return <Redirect href="/onboarding" />;
  if (needsProfile) return <Redirect href="/profile-setup" />;
  return <Redirect href="/home" />;
}

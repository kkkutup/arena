import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Txt, Avatar, Button, Card, StreakFlame } from '@/ui';
import { useSession } from '@/store/session';
import { colors, spacing } from '@/theme/tokens';

export default function Profile() {
  const router = useRouter();
  const user = useSession((s) => s.user);
  const signOut = useSession((s) => s.signOut);

  if (!user) return null;

  return (
    <Screen>
      <View style={{ alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg }}>
        <Avatar name={user.displayName || user.username} size={96} />
        <Txt variant="title">{user.displayName || user.username}</Txt>
        <Txt variant="body" color={colors.muted}>
          @{user.username}
        </Txt>
        <StreakFlame count={user.stats.streakCount} size={20} />
      </View>

      <Card style={{ marginTop: spacing.xl, flexDirection: 'row', justifyContent: 'space-around' }}>
        <Stat label="Level" value={user.stats.level} />
        <Stat label="XP" value={user.stats.xp} />
        <Stat label="Wins" value={user.stats.wins} />
      </Card>

      <Button
        label="Sign out"
        variant="neutral"
        full
        style={{ marginTop: spacing.xl }}
        onPress={() => {
          signOut();
          router.replace('/');
        }}
      />
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Txt variant="h2" color={colors.primary}>
        {value}
      </Txt>
      <Txt variant="small" color={colors.muted}>
        {label}
      </Txt>
    </View>
  );
}

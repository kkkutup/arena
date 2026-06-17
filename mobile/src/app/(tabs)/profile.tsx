import { View, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Txt, Avatar, Button, Card, StreakFlame, Icon } from '@/ui';
import { useSession } from '@/store/session';
import { useWallet } from '@/store/wallet';
import { useTheme, useThemeSync } from '@/store/theme';
import { AchievementGrid } from '@/features/profile/AchievementGrid';
import { useIsFresh } from '@/hooks/useIsFresh';
import { colors, spacing, radius } from '@/theme/tokens';

export default function Profile() {
  useThemeSync();
  const router = useRouter();
  const user = useSession((s) => s.user);
  const signOut = useSession((s) => s.signOut);
  const fresh = useIsFresh();
  const balance = useWallet((s) => s.balance);
  const openStore = useWallet((s) => s.openStore);
  const mode = useTheme((s) => s.mode);
  const toggleTheme = useTheme((s) => s.toggle);

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
        <Stat label="Streak" value={user.stats.streakCount} />
        <Stat label="Wins" value={user.stats.wins} />
      </Card>

      <Pressable onPress={openStore}>
        <Card style={{ marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: radius.md,
              backgroundColor: colors.primaryTint,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="diamond" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt variant="h3">{balance} diamonds</Txt>
            <Txt variant="small" color={colors.muted}>
              Tap to earn or buy more
            </Txt>
          </View>
          <Icon name="chevron-forward" size={22} color={colors.faint} />
        </Card>
      </Pressable>

      <Txt variant="h2" style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
        Settings
      </Txt>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: radius.md,
            backgroundColor: colors.surfaceAlt,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={mode === 'dark' ? 'moon' : 'sunny'} size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Txt variant="bodyBold">Night mode</Txt>
          <Txt variant="small" color={colors.muted}>
            {mode === 'dark' ? 'On — easy on the eyes' : 'Off'}
          </Txt>
        </View>
        <Switch
          value={mode === 'dark'}
          onValueChange={toggleTheme}
          trackColor={{ true: colors.primary, false: colors.line }}
          thumbColor={colors.white}
        />
      </Card>

      <Txt variant="h2" style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
        Achievements
      </Txt>
      <AchievementGrid locked={fresh} />

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

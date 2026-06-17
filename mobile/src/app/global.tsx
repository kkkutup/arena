import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Txt, Card, Icon, Avatar } from '@/ui';
import { useSession } from '@/store/session';
import { useThemeSync } from '@/store/theme';
import { globalRanking, type RankRow } from '@/features/ranking/global';
import { colors, spacing, radius } from '@/theme/tokens';

export default function GlobalRanking() {
  useThemeSync();
  const router = useRouter();
  const user = useSession((s) => s.user);
  const name = user?.displayName || user?.username || 'You';
  const rows = globalRanking(name, user?.stats.xp ?? 0);
  const me = rows.find((r) => r.isMe);

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={{ paddingVertical: spacing.sm, alignSelf: 'flex-start' }}>
        <Icon name="chevron-back" size={28} color={colors.ink} />
      </Pressable>

      <Txt variant="title">Global ranking</Txt>
      <Txt variant="body" color={colors.muted} style={{ marginTop: 2 }}>
        Everyone, ranked by XP. Earn XP in backtests and competitions to climb.
      </Txt>

      {me ? (
        <Card style={{ marginTop: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.primaryTint, borderColor: colors.primary }}>
          <Txt variant="display" color={colors.primary}>
            #{me.rank}
          </Txt>
          <View style={{ flex: 1 }}>
            <Txt variant="bodyBold">Your position</Txt>
            <Txt variant="small" color={colors.muted}>
              {me.xp} XP · Level {me.level} · of {rows.length} players
            </Txt>
          </View>
        </Card>
      ) : null}

      <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
        {rows.slice(0, 30).map((r) => (
          <Row key={`${r.rank}-${r.name}`} r={r} />
        ))}
      </View>
    </Screen>
  );
}

function Row({ r }: { r: RankRow }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.lg,
        backgroundColor: r.isMe ? colors.primaryTint : 'transparent',
      }}
    >
      <Txt variant="num" color={r.rank <= 3 ? colors.gold : colors.muted} style={{ width: 34 }}>
        {r.rank}
      </Txt>
      <Avatar name={r.name} size={34} />
      <View style={{ flex: 1 }}>
        <Txt variant="bodyBold" color={r.isMe ? colors.primary : colors.ink}>
          {r.name}
          {r.isMe ? ' (you)' : ''}
        </Txt>
        <Txt variant="tiny" color={colors.faint}>
          Level {r.level}
        </Txt>
      </View>
      <Txt variant="num" color={colors.ink}>
        {r.xp} XP
      </Txt>
    </View>
  );
}

import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Txt, Card, Icon, Avatar } from '@/ui';
import { useThemeSync } from '@/store/theme';
import { useRanking } from '@/hooks/queries';
import type { RankRow, RankingMetric } from '@/api/types';
import { colors, spacing, radius } from '@/theme/tokens';

function metricValue(r: RankRow, metric: RankingMetric): string {
  return metric === 'wins' ? `${r.wins} ${r.wins === 1 ? 'win' : 'wins'}` : `${r.xp} XP`;
}

export default function GlobalRanking() {
  useThemeSync();
  const router = useRouter();
  const [metric, setMetric] = useState<RankingMetric>('xp');
  const q = useRanking(metric);
  const rows = q.data?.rows ?? [];
  const me = q.data?.me ?? null;

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={{ paddingVertical: spacing.sm, alignSelf: 'flex-start' }}>
        <Icon name="chevron-back" size={28} color={colors.ink} />
      </Pressable>

      <Txt variant="title">Global ranking</Txt>
      <Txt variant="body" color={colors.muted} style={{ marginTop: 2 }}>
        {metric === 'xp'
          ? 'Everyone, ranked by XP. Earn XP in lessons & backtests to climb.'
          : 'Everyone, ranked by competition wins.'}
      </Txt>

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
        <Toggle label="XP" active={metric === 'xp'} onPress={() => setMetric('xp')} />
        <Toggle label="Wins" active={metric === 'wins'} onPress={() => setMetric('wins')} />
      </View>

      {me ? (
        <Card style={{ marginTop: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.primaryTint, borderColor: colors.primary }}>
          <Txt variant="display" color={colors.primary}>
            #{me.rank}
          </Txt>
          <View style={{ flex: 1 }}>
            <Txt variant="bodyBold">Your position</Txt>
            <Txt variant="small" color={colors.muted}>
              {metricValue(me, metric)} · Level {me.level}
            </Txt>
          </View>
        </Card>
      ) : null}

      <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
        {rows.map((r) => (
          <Row key={r.userId} r={r} metric={metric} />
        ))}
        {!rows.length ? (
          <Txt variant="small" color={colors.muted}>
            {q.isLoading ? 'Loading…' : 'No players yet.'}
          </Txt>
        ) : null}
      </View>
    </Screen>
  );
}

function Toggle({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
        backgroundColor: active ? colors.primary : colors.surfaceAlt,
      }}
    >
      <Txt variant="label" color={active ? colors.white : colors.muted}>
        {label}
      </Txt>
    </Pressable>
  );
}

function Row({ r, metric }: { r: RankRow; metric: RankingMetric }) {
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
      <Avatar name={r.displayName} uri={r.avatarUrl} size={34} />
      <View style={{ flex: 1 }}>
        <Txt variant="bodyBold" color={r.isMe ? colors.primary : colors.ink}>
          {r.displayName}
          {r.isMe ? ' (you)' : ''}
        </Txt>
        <Txt variant="tiny" color={colors.faint}>
          Level {r.level}
        </Txt>
      </View>
      <Txt variant="num" color={colors.ink}>
        {metricValue(r, metric)}
      </Txt>
    </View>
  );
}

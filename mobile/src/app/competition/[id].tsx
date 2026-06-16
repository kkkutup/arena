import { View, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Txt, Pill, Button, Card, Icon } from '@/ui';
import { useCompetition, useLeaderboard } from '@/hooks/queries';
import { compTypeMeta } from '@/features/competitions/util';
import { LeaderboardList } from '@/features/competitions/LeaderboardList';
import { fmtPct, fmtUsd, timeLeft } from '@/lib/format';
import { colors, spacing } from '@/theme/tokens';

export default function CompetitionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: c, isLoading } = useCompetition(id);
  const { data: rows } = useLeaderboard(id);

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={{ paddingVertical: spacing.sm, alignSelf: 'flex-start' }}>
        <Icon name="chevron-back" size={28} color={colors.ink} />
      </Pressable>

      {isLoading || !c ? (
        <Txt variant="body" color={colors.muted}>
          Loading…
        </Txt>
      ) : (
        <>
          <Pill {...pillProps(c.type)} />
          <Txt variant="title" style={{ marginTop: spacing.sm }}>
            {c.name}
          </Txt>
          <Txt variant="body" color={colors.muted} style={{ marginTop: 2 }}>
            {c.participantCount} traders · ends in {timeLeft(c.endAt)}
          </Txt>

          {c.myRank != null ? (
            <Card style={{ marginTop: spacing.lg, flexDirection: 'row', justifyContent: 'space-around' }}>
              <Stat label="Your rank" value={`#${c.myRank}`} color={colors.ink} />
              <Stat label="Equity" value={fmtUsd(c.myEquity ?? 0)} color={colors.ink} />
              <Stat
                label="Return"
                value={fmtPct(c.myReturnPct ?? 0)}
                color={(c.myReturnPct ?? 0) >= 0 ? colors.up : colors.down}
              />
            </Card>
          ) : (
            <Button label="Join competition" full style={{ marginTop: spacing.lg }} />
          )}

          <Button
            label="Open trade sandbox"
            variant="success"
            full
            style={{ marginTop: spacing.md }}
            onPress={() => router.push('/trade')}
          />

          <Txt variant="h2" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
            Leaderboard
          </Txt>
          {rows ? (
            <LeaderboardList rows={rows} />
          ) : (
            <Txt variant="small" color={colors.muted}>
              Loading leaderboard…
            </Txt>
          )}
        </>
      )}
    </Screen>
  );
}

function pillProps(type: Parameters<typeof compTypeMeta>[0]) {
  const m = compTypeMeta(type);
  return { label: m.label, color: m.color, tint: m.tint };
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Txt variant="h3" color={color}>
        {value}
      </Txt>
      <Txt variant="small" color={colors.muted}>
        {label}
      </Txt>
    </View>
  );
}

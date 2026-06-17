import { View, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Txt, Pill, Button, Card, Icon } from '@/ui';
import { useCompetition, useLeaderboard } from '@/hooks/queries';
import { compTypeMeta } from '@/features/competitions/util';
import { LeaderboardList } from '@/features/competitions/LeaderboardList';
import { useMyCompetitions } from '@/store/competitions';
import { useSession } from '@/store/session';
import type { LeaderboardRow } from '@/api/types';
import { fmtPct, fmtUsd, timeLeft } from '@/lib/format';
import { colors, spacing } from '@/theme/tokens';

export default function CompetitionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  // A competition the user just created/joined lives in the client store;
  // fall back to the mock API for the seeded public ones.
  const stored = useMyCompetitions((s) => s.getById(id));
  const me = useSession((s) => s.user);
  const { data: queried, isLoading } = useCompetition(id);
  const { data: mockRows } = useLeaderboard(id);
  const c = stored ?? queried;
  const loading = stored ? false : isLoading;
  const rows: LeaderboardRow[] = stored
    ? [
        {
          rank: 1,
          userId: 'me',
          username: me?.displayName || me?.username || 'You',
          avatarUrl: me?.avatarUrl ?? null,
          equity: stored.startingBalance,
          returnPct: 0,
          isMe: true,
        },
      ]
    : mockRows ?? [];

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={{ paddingVertical: spacing.sm, alignSelf: 'flex-start' }}>
        <Icon name="chevron-back" size={28} color={colors.ink} />
      </Pressable>

      {loading || !c ? (
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
            onPress={() => router.push('/sandbox')}
          />

          <Txt variant="h2" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
            Leaderboard
          </Txt>
          {rows.length ? (
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

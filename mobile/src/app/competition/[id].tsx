import { View, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen, Txt, Pill, Button, Card, Icon } from '@/ui';
import { useCompetition, useLeaderboard } from '@/hooks/queries';
import { compTypeMeta } from '@/features/competitions/util';
import { LeaderboardList } from '@/features/competitions/LeaderboardList';
import { useMyCompetitions } from '@/store/competitions';
import { useWallet, DIAMOND } from '@/store/wallet';
import { useSession } from '@/store/session';
import type { Competition, LeaderboardRow, User } from '@/api/types';
import { fmtPct, fmtUsd, timeLeft } from '@/lib/format';
import { colors, spacing } from '@/theme/tokens';

const BOTS = ['Mert', 'Zeynep', 'Deniz', 'Caner', 'Ece', 'Burak', 'Sıla', 'Kaan'];

// Build a leaderboard for a store-backed competition (you + filler rivals).
function synthRows(comp: Competition, me: User | null): LeaderboardRow[] {
  const n = Math.max(comp.participantCount, 1);
  const myRank = comp.myRank ?? 1;
  const rows: LeaderboardRow[] = [];
  for (let i = 1; i <= n; i++) {
    const isMe = i === myRank;
    const returnPct = isMe ? comp.myReturnPct ?? 0 : Number((6 - i * 0.8).toFixed(2));
    rows.push({
      rank: i,
      userId: isMe ? 'me' : `b${i}`,
      username: isMe ? me?.displayName || me?.username || 'You' : BOTS[(i * 2) % BOTS.length],
      avatarUrl: isMe ? me?.avatarUrl ?? null : null,
      equity: comp.startingBalance * (1 + returnPct / 100),
      returnPct,
      isMe,
    });
  }
  return rows;
}

export default function CompetitionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  // A competition the user just created/joined lives in the client store;
  // fall back to the mock API for the seeded public ones (queries off when stored).
  const stored = useMyCompetitions((s) => s.getById(id));
  const joinComp = useMyCompetitions((s) => s.join);
  const spend = useWallet((s) => s.spend);
  const openStore = useWallet((s) => s.openStore);
  const me = useSession((s) => s.user);
  const { data: queried, isLoading } = useCompetition(id, !stored);
  const { data: mockRows } = useLeaderboard(id, !stored);
  const c = stored ?? queried;
  const loading = stored ? false : isLoading;
  const rows: LeaderboardRow[] = stored ? synthRows(stored, me) : mockRows ?? [];

  const onJoin = () => {
    if (!c) return;
    if (!spend(DIAMOND.JOIN_COST)) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      openStore();
      return;
    }
    joinComp(c);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

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
            <Button
              label={`Join competition · ${DIAMOND.JOIN_COST} 💎`}
              full
              style={{ marginTop: spacing.lg }}
              onPress={onJoin}
            />
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

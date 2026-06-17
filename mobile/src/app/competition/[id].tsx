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
import { useTrade } from '@/store/trade';
import { useThemeSync } from '@/store/theme';
import type { Competition, LeaderboardRow, User } from '@/api/types';
import { fmtPct, fmtUsd, timeLeft } from '@/lib/format';
import { colors, spacing } from '@/theme/tokens';

const BOTS = ['Mert', 'Zeynep', 'Deniz', 'Caner', 'Ece', 'Burak', 'Sıla', 'Kaan'];

// Build a live leaderboard for a store-backed competition: your real trading
// return (from the sandbox) ranked against filler rivals, re-sorted each render.
function synthRows(
  comp: Competition,
  me: User | null,
  myReturnPct: number,
  myEquity: number,
): LeaderboardRow[] {
  const n = Math.max(comp.participantCount, 1);
  const rows: LeaderboardRow[] = [];
  for (let i = 0; i < n - 1; i++) {
    const returnPct = Number((5.5 - i * 0.9).toFixed(2));
    rows.push({
      rank: 0,
      userId: `b${i}`,
      username: BOTS[(i * 2) % BOTS.length],
      avatarUrl: null,
      equity: comp.startingBalance * (1 + returnPct / 100),
      returnPct,
      isMe: false,
    });
  }
  rows.push({
    rank: 0,
    userId: 'me',
    username: me?.displayName || me?.username || 'You',
    avatarUrl: me?.avatarUrl ?? null,
    equity: myEquity,
    returnPct: myReturnPct,
    isMe: true,
  });
  rows.sort((a, b) => b.returnPct - a.returnPct);
  rows.forEach((r, i) => (r.rank = i + 1));
  return rows;
}

export default function CompetitionDetail() {
  useThemeSync();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  // A competition the user just created/joined lives in the client store;
  // fall back to the mock API for the seeded public ones (queries off when stored).
  const stored = useMyCompetitions((s) => s.getById(id));
  const joinComp = useMyCompetitions((s) => s.join);
  const spend = useWallet((s) => s.spend);
  const openStore = useWallet((s) => s.openStore);
  const me = useSession((s) => s.user);
  // Live trading account → drives the user's equity/return in the leaderboard.
  const cash = useTrade((s) => s.cashBalance);
  const startBal = useTrade((s) => s.startingBalance);
  const myReturnPct = ((cash - startBal) / startBal) * 100;
  const { data: queried, isLoading } = useCompetition(id, !stored);
  const { data: mockRows } = useLeaderboard(id, !stored);
  const c = stored ?? queried;
  const loading = stored ? false : isLoading;
  const rows: LeaderboardRow[] = stored ? synthRows(stored, me, myReturnPct, cash) : mockRows ?? [];
  const myRow = rows.find((r) => r.isMe);
  const isMine = !!stored;
  const dispRank = isMine ? myRow?.rank ?? 1 : c?.myRank;
  const dispEquity = isMine ? cash : c?.myEquity;
  const dispReturn = isMine ? myReturnPct : c?.myReturnPct;

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

          {dispRank != null ? (
            <Card style={{ marginTop: spacing.lg, flexDirection: 'row', justifyContent: 'space-around' }}>
              <Stat label="Your rank" value={`#${dispRank}`} color={colors.ink} />
              <Stat label="Equity" value={fmtUsd(dispEquity ?? 0)} color={colors.ink} />
              <Stat
                label="Return"
                value={fmtPct(dispReturn ?? 0)}
                color={(dispReturn ?? 0) >= 0 ? colors.up : colors.down}
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

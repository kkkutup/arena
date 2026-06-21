import { View, Pressable, Share, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen, Txt, Pill, Button, Card, Icon } from '@/ui';
import {
  useCompetition,
  useLeaderboard,
  useJoinCompetition,
  useCloseCompetition,
} from '@/hooks/queries';
import { compTypeMeta } from '@/features/competitions/util';
import { LeaderboardList } from '@/features/competitions/LeaderboardList';
import { useWallet, DIAMOND } from '@/store/wallet';
import { useThemeSync } from '@/store/theme';
import { fmtPct, fmtUsd, timeLeft } from '@/lib/format';
import { colors, spacing } from '@/theme/tokens';

export default function CompetitionDetail() {
  useThemeSync();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Everything is server-backed now: the competition detail (with the viewer's
  // own rank/equity if joined) and the shared, live leaderboard.
  const { data: c, isLoading } = useCompetition(id);
  const { data: rows } = useLeaderboard(id);

  const spend = useWallet((s) => s.spend);
  const canAfford = useWallet((s) => s.canAfford);
  const openStore = useWallet((s) => s.openStore);
  const joinMut = useJoinCompetition();
  const closeMut = useCloseCompetition();

  // The server returns myRank only when the viewer is a participant.
  const joined = c?.myRank != null;

  const onClose = () => {
    if (!c || closeMut.isPending) return;
    Alert.alert('Close competition?', `"${c.name}" will end now for everyone. This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Close',
        style: 'destructive',
        onPress: async () => {
          try {
            await closeMut.mutateAsync(id);
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
          } catch {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        },
      },
    ]);
  };

  const onJoin = async () => {
    if (!c || joinMut.isPending) return;
    if (!canAfford(DIAMOND.JOIN_COST)) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      openStore();
      return;
    }
    try {
      await joinMut.mutateAsync(id);
      spend(DIAMOND.JOIN_COST);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

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

          {joined ? (
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
              loading={joinMut.isPending}
              style={{ marginTop: spacing.lg }}
              onPress={onJoin}
            />
          )}

          {joined ? (
            <Button
              label="Open trade sandbox"
              variant="success"
              full
              style={{ marginTop: spacing.md }}
              onPress={() =>
                router.push({
                  pathname: '/sandbox',
                  params: { cid: c.id, start: String(c.startingBalance) },
                })
              }
            />
          ) : null}

          {joined && c.joinCode ? (
            <Card style={{ marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View style={{ flex: 1 }}>
                <Txt variant="tiny" color={colors.faint}>
                  INVITE CODE
                </Txt>
                <Txt variant="h2" style={{ letterSpacing: 2 }}>
                  {c.joinCode}
                </Txt>
              </View>
              <Button
                label="Invite"
                size="sm"
                variant="neutral"
                left={<Icon name="share-social" size={16} color={colors.ink} />}
                onPress={() =>
                  void Share.share({
                    message: `Join my Arena competition "${c.name}" — code ${c.joinCode}`,
                  })
                }
              />
            </Card>
          ) : null}

          <Txt variant="h2" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
            Leaderboard
          </Txt>
          {rows && rows.length ? (
            <LeaderboardList rows={rows} />
          ) : (
            <Txt variant="small" color={colors.muted}>
              {rows ? 'No traders yet — be the first to join.' : 'Loading leaderboard…'}
            </Txt>
          )}

          {c.isOwner && c.status !== 'FINISHED' ? (
            <Button
              label="Close competition"
              variant="neutral"
              full
              loading={closeMut.isPending}
              left={<Icon name="lock-closed" size={16} color={colors.down} />}
              style={{ marginTop: spacing.xl }}
              onPress={onClose}
            />
          ) : null}
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

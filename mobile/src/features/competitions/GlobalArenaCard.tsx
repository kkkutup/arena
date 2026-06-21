import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Txt, Card, Icon, Button, Avatar } from '@/ui';
import { useGlobalRound, useJoinCompetition } from '@/hooks/queries';
import { colors, spacing, radius } from '@/theme/tokens';
import { timeLeft, fmtPct } from '@/lib/format';
import type { GlobalWinner } from '@/api/types';

// The recurring weekly global competition ("Gold Division"): $5k balance, 10×
// max leverage, all pairs. Live Mon→Sat, winners shown over the weekend, then a
// fresh round every Monday.
export function GlobalArenaCard() {
  const router = useRouter();
  const { data: round } = useGlobalRound();
  const join = useJoinCompetition();

  if (!round) return null;

  const live = round.exists && round.phase === 'live';
  const winners = round.winners ?? [];

  const openTradeBox = () =>
    router.push({
      pathname: '/sandbox',
      params: { cid: round.id ?? '', start: String(round.startingBalance ?? 5000) },
    });

  return (
    <Card style={{ marginTop: spacing.lg, gap: spacing.md, borderColor: colors.gold + '55', borderWidth: 1 }}>
      {/* header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: radius.lg,
            backgroundColor: colors.gold + '22',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="trophy" size={28} color={colors.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Txt variant="h3">Gold Division</Txt>
          <Txt variant="small" color={colors.muted}>
            Global Arena · weekly · $5,000 · 10× max
          </Txt>
        </View>
        <View
          style={{
            paddingHorizontal: spacing.sm,
            paddingVertical: 3,
            borderRadius: radius.pill,
            backgroundColor: live ? colors.upTint : colors.surfaceAlt,
          }}
        >
          <Txt variant="tiny" color={live ? colors.up : colors.muted}>
            {live ? 'LIVE' : 'RESULTS'}
          </Txt>
        </View>
      </View>

      {live ? (
        <>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Meta icon="time-outline" label="Ends in" value={round.endAt ? timeLeft(round.endAt) : '—'} />
            <Meta icon="people-outline" label="Traders" value={String(round.participantCount ?? 0)} />
            <Meta
              icon="podium-outline"
              label="Your rank"
              value={round.joined && round.myRank ? `#${round.myRank}` : '—'}
            />
          </View>

          {round.joined ? (
            <Button label="Open trade box" variant="success" full left={<Icon name="trending-up" color={colors.white} />} onPress={openTradeBox} />
          ) : (
            <Button
              label={join.isPending ? 'Joining…' : 'Join competition'}
              full
              left={<Icon name="flash" color={colors.white} />}
              onPress={() => round.id && join.mutate(round.id)}
            />
          )}
        </>
      ) : (
        <>
          <Txt variant="label" color={colors.muted}>
            {winners.length ? "This week's winners" : 'No finishers this round'}
          </Txt>
          {winners.slice(0, 3).map((w) => (
            <WinnerRow key={w.userId} w={w} />
          ))}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              marginTop: spacing.xs,
            }}
          >
            <Icon name="refresh-outline" size={16} color={colors.primary} />
            <Txt variant="small" color={colors.primary}>
              {round.nextStartAt
                ? `Next round starts in ${timeLeft(round.nextStartAt)}`
                : 'Next round starts Monday'}
            </Txt>
          </View>
        </>
      )}
    </Card>
  );
}

function Meta({ icon, label, value }: { icon: 'time-outline' | 'people-outline' | 'podium-outline'; label: string; value: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Icon name={icon} size={16} color={colors.faint} />
      <Txt variant="num">{value}</Txt>
      <Txt variant="tiny" color={colors.faint}>
        {label.toUpperCase()}
      </Txt>
    </View>
  );
}

function WinnerRow({ w }: { w: GlobalWinner }) {
  const medal = w.rank === 1 ? colors.gold : w.rank === 2 ? colors.silver : colors.bronze;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
      <Txt variant="num" color={medal} style={{ width: 22 }}>
        {w.rank}
      </Txt>
      <Avatar name={w.username} size={28} />
      <Txt variant="bodyBold" style={{ flex: 1 }} numberOfLines={1}>
        @{w.username}
      </Txt>
      <Txt variant="num" color={w.returnPct >= 0 ? colors.up : colors.down}>
        {fmtPct(w.returnPct)}
      </Txt>
    </View>
  );
}

import { useEffect } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Screen,
  Txt,
  Card,
  Avatar,
  ProgressRing,
  StreakFlame,
  Button,
  Icon,
  EmptyState,
} from '@/ui';
import type { IconName } from '@/ui/Icon';
import { useSession } from '@/store/session';
import { useActivity } from '@/hooks/queries';
import { CompetitionCard } from '@/features/competitions/CompetitionCard';
import { TourTarget } from '@/features/tour/TourTarget';
import { DiamondPill } from '@/features/wallet/DiamondPill';
import { useMyCompetitions } from '@/store/competitions';
import { useTour } from '@/store/tour';
import { useWallet } from '@/store/wallet';
import { useCelebration } from '@/store/celebration';
import { HOME_TOUR } from '@/features/tour/steps';
import type { ActivityItem } from '@/api/types';
import { colors, spacing } from '@/theme/tokens';
import { timeAgo } from '@/lib/format';

const DAILY_GOAL_XP = 60;
const DAILY_DONE = 38;

export default function Home() {
  const user = useSession((s) => s.user);
  const tourSeen = useSession((s) => s.tourSeen);
  const markTourSeen = useSession((s) => s.markTourSeen);
  const startTour = useTour((s) => s.start);
  const claimDaily = useWallet((s) => s.claimDaily);
  const celebrate = useCelebration((s) => s.celebrate);
  const router = useRouter();
  const myComps = useMyCompetitions((s) => s.mine);
  const activity = useActivity();

  // On the first login we run the coach-mark tour, then drop the daily diamond
  // bonus so the two overlays never fight; returning users get it right away.
  // claimDaily is idempotent per day, so re-runs can't double-grant.
  useEffect(() => {
    if (!user) return;
    const grantDaily = () => {
      const granted = claimDaily();
      if (granted > 0) {
        celebrate({
          icon: 'diamond',
          color: colors.primary,
          title: `+${granted} Diamonds`,
          subtitle: 'Daily login bonus — come back tomorrow for more!',
        });
      }
    };
    if (!tourSeen) {
      const t = setTimeout(
        () =>
          void startTour(HOME_TOUR, () => {
            markTourSeen();
            grantDaily();
          }),
        500,
      );
      return () => clearTimeout(t);
    }
    grantDaily();
  }, [user, tourSeen, startTour, markTourSeen, claimDaily, celebrate]);

  if (!user) return null;

  // A brand-new account starts empty — show a clean slate, not demo data.
  const fresh =
    user.stats.competitionsPlayed === 0 &&
    user.stats.streakCount === 0 &&
    user.stats.xp === 0;
  const dailyDone = fresh ? 0 : DAILY_DONE;
  const feed = fresh ? [] : activity.data ?? [];

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Txt variant="small" color={colors.muted}>
            {fresh ? 'Welcome to Arena' : 'Welcome back'}
          </Txt>
          <Txt variant="title">{user.displayName || user.username}</Txt>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <TourTarget id="home-streak">
            <StreakFlame count={user.stats.streakCount} size={20} />
          </TourTarget>
          <TourTarget id="home-diamonds">
            <DiamondPill />
          </TourTarget>
        </View>
      </View>

      <TourTarget id="home-daily" style={{ marginTop: spacing.lg }}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
          <ProgressRing progress={dailyDone / DAILY_GOAL_XP} size={76} color={colors.gold}>
            <Icon name="flash" size={26} color={colors.gold} />
          </ProgressRing>
          <View style={{ flex: 1, gap: 4 }}>
            <Txt variant="h3">Daily goal</Txt>
            <Txt variant="body" color={colors.muted}>
              {fresh
                ? `0 / ${DAILY_GOAL_XP} XP — start your streak today!`
                : `${dailyDone} / ${DAILY_GOAL_XP} XP — keep your streak alive!`}
            </Txt>
          </View>
        </Card>
      </TourTarget>

      <TourTarget id="home-duel" style={{ marginTop: spacing.lg }}>
        <Button
          label="Start a duel"
          full
          left={<Icon name="flash" color={colors.white} />}
          onPress={() => router.push('/compete')}
        />
      </TourTarget>

      <SectionHeader title="Your competitions" action={myComps.length ? 'See all' : undefined} onAction={() => router.push('/compete')} />
      {myComps.length ? (
        <View style={{ gap: spacing.md }}>
          {myComps.map((c) => (
            <CompetitionCard key={c.id} c={c} />
          ))}
        </View>
      ) : (
        <EmptyState
          icon="trophy-outline"
          text="No competitions yet"
          action="Find a competition"
          onAction={() => router.push('/compete')}
        />
      )}

      <SectionHeader title="Friends activity" />
      {feed.length ? (
        <Card padded={false} style={{ paddingVertical: 4 }}>
          {feed.map((a, i) => (
            <ActivityRow key={a.id} item={a} last={i === feed.length - 1} />
          ))}
        </Card>
      ) : (
        <EmptyState
          icon="people-outline"
          text="No friend activity yet"
          action="Add friends"
          onAction={() => router.push('/social')}
        />
      )}
    </Screen>
  );
}

function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.xl,
        marginBottom: spacing.md,
      }}
    >
      <Txt variant="h2">{title}</Txt>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Txt variant="label" color={colors.primary}>
            {action}
          </Txt>
        </Pressable>
      ) : null}
    </View>
  );
}

const KIND: Record<ActivityItem['kind'], { icon: IconName; color: string }> = {
  WIN: { icon: 'trophy', color: colors.gold },
  JOINED: { icon: 'enter', color: colors.primary },
  LEVEL_UP: { icon: 'arrow-up-circle', color: colors.up },
  STREAK: { icon: 'flame', color: colors.flame },
  PROMOTED: { icon: 'trending-up', color: colors.diamond },
};

function ActivityRow({ item, last }: { item: ActivityItem; last: boolean }) {
  const k = KIND[item.kind];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: last ? 0 : 1.5,
        borderBottomColor: colors.line,
      }}
    >
      <Avatar name={item.username} size={38} />
      <View style={{ flex: 1 }}>
        <Txt variant="body" color={colors.muted} numberOfLines={2}>
          <Txt variant="bodyBold" color={colors.ink}>
            {item.username}
          </Txt>{' '}
          {item.text}
        </Txt>
        <Txt variant="small" color={colors.faint}>
          {timeAgo(item.at)} ago
        </Txt>
      </View>
      <Icon name={k.icon} size={20} color={k.color} />
    </View>
  );
}

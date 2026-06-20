import { useEffect, useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
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
import { useActivity, useCompetitions } from '@/hooks/queries';
import { CompetitionCard } from '@/features/competitions/CompetitionCard';
import { TourTarget } from '@/features/tour/TourTarget';
import { DiamondPill } from '@/features/wallet/DiamondPill';
import { useLessons } from '@/store/lessons';
import { useTour } from '@/store/tour';
import { useWallet } from '@/store/wallet';
import { useThemeSync } from '@/store/theme';
import { useCelebration } from '@/store/celebration';
import { HOME_TOUR } from '@/features/tour/steps';
import type { ActivityItem } from '@/api/types';
import { colors, spacing } from '@/theme/tokens';
import { timeAgo } from '@/lib/format';
import { DAILY_GOAL_XP } from '@/lib/goals';

export default function Home() {
  useThemeSync();
  const user = useSession((s) => s.user);
  const dailyXp = useSession((s) => s.dailyXp);
  const tourSeen = useSession((s) => s.tourSeen);
  const markTourSeen = useSession((s) => s.markTourSeen);
  const startTour = useTour((s) => s.start);
  const claimDaily = useWallet((s) => s.claimDaily);
  const celebrate = useCelebration((s) => s.celebrate);
  const router = useRouter();
  const myComps = useCompetitions().data ?? [];
  // Select the stable `completed` map (not a fresh object) to avoid an
  // infinite getSnapshot loop, then derive next lesson via memo.
  const lessonsCompleted = useLessons((s) => s.completed);
  const nextLesson = useMemo(() => useLessons.getState().nextLesson(), [lessonsCompleted]);
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

  // If the session ever clears while we're here, bounce to the auth flow
  // instead of leaving a blank, stuck screen.
  if (!user) return <Redirect href="/onboarding" />;

  // A brand-new account starts empty — show a clean slate, not demo data.
  const fresh =
    user.stats.competitionsPlayed === 0 &&
    user.stats.streakCount === 0 &&
    user.stats.xp === 0;
  const dailyDone = Math.min(dailyXp, DAILY_GOAL_XP);
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
              {dailyDone >= DAILY_GOAL_XP
                ? `${dailyDone} / ${DAILY_GOAL_XP} XP — goal complete! 🎉`
                : `${dailyDone} / ${DAILY_GOAL_XP} XP — play to earn XP today`}
            </Txt>
          </View>
        </Card>
      </TourTarget>

      {nextLesson ? (
        <TourTarget id="home-lesson" style={{ marginTop: spacing.lg }}>
          <Pressable
            onPress={() =>
              router.push({ pathname: '/lesson/[id]', params: { id: nextLesson.lessonId } })
            }
          >
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: nextLesson.color + '22',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name={nextLesson.icon} size={24} color={nextLesson.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt variant="tiny" color={colors.faint}>
                LESSON OF THE DAY
              </Txt>
              <Txt variant="h3">{nextLesson.title}</Txt>
              <Txt variant="small" color={colors.muted}>
                {nextLesson.trackTitle}
              </Txt>
            </View>
            <Icon name="play-circle" size={26} color={nextLesson.color} />
            </Card>
          </Pressable>
        </TourTarget>
      ) : null}

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

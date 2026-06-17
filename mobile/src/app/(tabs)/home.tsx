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
} from '@/ui';
import type { IconName } from '@/ui/Icon';
import { useSession } from '@/store/session';
import { useCompetitions, useActivity } from '@/hooks/queries';
import { CompetitionCard } from '@/features/competitions/CompetitionCard';
import { TourTarget } from '@/features/tour/TourTarget';
import { useTour } from '@/store/tour';
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
  const router = useRouter();
  const comps = useCompetitions();
  const activity = useActivity();

  // First login only: kick off the coach-mark tour once the screen lays out.
  useEffect(() => {
    if (!user || tourSeen) return;
    const t = setTimeout(() => void startTour(HOME_TOUR, markTourSeen), 500);
    return () => clearTimeout(t);
  }, [user, tourSeen, startTour, markTourSeen]);

  if (!user) return null;

  // A brand-new account starts empty — show a clean slate, not demo data.
  const fresh =
    user.stats.competitionsPlayed === 0 &&
    user.stats.streakCount === 0 &&
    user.stats.xp === 0;
  const dailyDone = fresh ? 0 : DAILY_DONE;
  const myComps = fresh ? [] : comps.data ?? [];
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
          <GemChip count={user.gems} />
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

function EmptyState({
  icon,
  text,
  action,
  onAction,
}: {
  icon: IconName;
  text: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <Card
      flat
      style={{
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center',
        paddingVertical: spacing.xl,
        gap: spacing.md,
      }}
    >
      <Icon name={icon} size={28} color={colors.faint} />
      <Txt variant="body" color={colors.muted}>
        {text}
      </Txt>
      <Button label={action} size="sm" variant="neutral" onPress={onAction} />
    </Card>
  );
}

function GemChip({ count }: { count: number }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.primaryTint,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
      }}
    >
      <Icon name="diamond" size={14} color={colors.primary} />
      <Txt variant="label" color={colors.primary}>
        {count}
      </Txt>
    </View>
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

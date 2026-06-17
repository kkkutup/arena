import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Txt, Card, Icon, Button, ProgressBar } from '@/ui';
import { useThemeSync } from '@/store/theme';
import { TRACKS } from '@/features/lessons/curriculum';
import { useLessons } from '@/store/lessons';
import type { Track } from '@/features/lessons/types';
import { colors, spacing, radius } from '@/theme/tokens';

// Learn hub: free Backtest game + the gamified lesson tracks.
export default function Learn() {
  useThemeSync();
  const router = useRouter();

  return (
    <Screen>
      <View style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}>
        <Txt variant="title">Learn</Txt>
        <Txt variant="body" color={colors.muted} style={{ marginTop: 2 }}>
          Bite-sized lessons + a backtest lab
        </Txt>
      </View>

      {/* Playable backtest challenge */}
      <Pressable onPress={() => router.push('/backtest')}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: radius.lg,
              backgroundColor: colors.upTint,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="stats-chart" size={26} color={colors.up} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt variant="h3">Backtest challenge</Txt>
            <Txt variant="small" color={colors.muted} style={{ marginTop: 2 }}>
              Set SL/TP on a mystery chart, reveal the outcome, earn XP.
            </Txt>
          </View>
          <Icon name="play-circle" size={26} color={colors.up} />
        </Card>
      </Pressable>

      <Txt variant="h2" style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
        Lessons
      </Txt>
      <View style={{ gap: spacing.md }}>
        {TRACKS.map((t) => (
          <TrackCard
            key={t.id}
            track={t}
            onPress={() => router.push({ pathname: '/lessons/[track]', params: { track: t.id } })}
          />
        ))}
      </View>
    </Screen>
  );
}

function TrackCard({ track, onPress }: { track: Track; onPress: () => void }) {
  const progress = useLessons((s) => s.trackProgress(track.id));
  const pct = progress.total ? progress.done / progress.total : 0;
  return (
    <Pressable onPress={onPress}>
      <Card style={{ gap: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: radius.lg,
              backgroundColor: track.color + '22',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={track.icon} size={24} color={track.color} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Txt variant="h3">{track.title}</Txt>
              {track.premium ? (
                <View style={{ backgroundColor: colors.gold, borderRadius: radius.sm, paddingHorizontal: 7, paddingVertical: 1 }}>
                  <Txt variant="tiny" color={colors.ink}>
                    PREMIUM
                  </Txt>
                </View>
              ) : (
                <View style={{ backgroundColor: colors.upTint, borderRadius: radius.sm, paddingHorizontal: 7, paddingVertical: 1 }}>
                  <Txt variant="tiny" color={colors.upDark}>
                    FREE
                  </Txt>
                </View>
              )}
            </View>
            <Txt variant="small" color={colors.muted} style={{ marginTop: 2 }}>
              {track.subtitle}
            </Txt>
          </View>
          <Icon name="chevron-forward" size={22} color={colors.faint} />
        </View>
        <View style={{ gap: 5 }}>
          <ProgressBar progress={pct} color={track.color} height={8} />
          <Txt variant="tiny" color={colors.faint}>
            {progress.done} / {progress.total} lessons
          </Txt>
        </View>
      </Card>
    </Pressable>
  );
}

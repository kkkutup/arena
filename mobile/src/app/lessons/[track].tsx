import { View, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Txt, Icon, Card, ProgressBar } from '@/ui';
import { getTrack } from '@/features/lessons/curriculum';
import { useLessons } from '@/store/lessons';
import { useThemeSync } from '@/store/theme';
import { colors, spacing, radius } from '@/theme/tokens';

export default function TrackScreen() {
  useThemeSync();
  const { track: trackId } = useLocalSearchParams<{ track: string }>();
  const router = useRouter();
  const track = getTrack(trackId);
  const isDone = useLessons((s) => s.isDone);
  const isUnlocked = useLessons((s) => s.isUnlocked);
  const progress = useLessons((s) => s.trackProgress(trackId));

  if (!track) return null;

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={{ paddingVertical: spacing.sm, alignSelf: 'flex-start' }}>
        <Icon name="chevron-back" size={28} color={colors.ink} />
      </Pressable>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Txt variant="title">{track.title}</Txt>
        {track.premium ? (
          <View style={{ backgroundColor: colors.gold, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Txt variant="tiny" color={colors.ink}>
              PREMIUM
            </Txt>
          </View>
        ) : null}
      </View>
      <Txt variant="body" color={colors.muted} style={{ marginTop: 2 }}>
        {track.subtitle}
      </Txt>

      <View style={{ marginTop: spacing.md, gap: 6 }}>
        <ProgressBar progress={progress.total ? progress.done / progress.total : 0} color={track.color} height={10} />
        <Txt variant="small" color={colors.muted}>
          {progress.done} / {progress.total} lessons
        </Txt>
      </View>

      {track.premium ? (
        <View
          style={{
            flexDirection: 'row',
            gap: spacing.sm,
            backgroundColor: colors.surfaceAlt,
            borderRadius: radius.md,
            padding: spacing.md,
            marginTop: spacing.md,
          }}
        >
          <Icon name="sparkles" size={18} color={colors.gold} />
          <Txt variant="small" color={colors.muted} style={{ flex: 1 }}>
            Premium track — free to preview during the beta.
          </Txt>
        </View>
      ) : null}

      <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
        {track.lessons.map((lesson, i) => {
          const done = isDone(lesson.id);
          const unlocked = isUnlocked(trackId, lesson.id);
          return (
            <Pressable
              key={lesson.id}
              disabled={!unlocked}
              onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: lesson.id } })}
            >
              <Card
                flat
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                  opacity: unlocked ? 1 : 0.55,
                  borderColor: done ? track.color : colors.line,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: radius.pill,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: done ? track.color : unlocked ? colors.primaryTint : colors.surfaceAlt,
                  }}
                >
                  {done ? (
                    <Icon name="checkmark" size={22} color={colors.white} />
                  ) : unlocked ? (
                    <Txt variant="bodyBold" color={colors.primary}>
                      {i + 1}
                    </Txt>
                  ) : (
                    <Icon name="lock-closed" size={18} color={colors.faint} />
                  )}
                </View>
                <Txt variant="bodyBold" color={colors.ink} style={{ flex: 1 }}>
                  {lesson.title}
                </Txt>
                {unlocked ? (
                  <Icon name={done ? 'refresh' : 'play'} size={18} color={colors.faint} />
                ) : null}
              </Card>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

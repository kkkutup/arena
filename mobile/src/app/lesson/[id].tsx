import { useMemo, useRef, useState } from 'react';
import { View, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Txt, Button, Icon, ProgressBar, Card } from '@/ui';
import { getLesson } from '@/features/lessons/curriculum';
import { ExerciseView } from '@/features/lessons/Exercises';
import { LessonChart } from '@/features/lessons/LessonChart';
import type { TeachCard, Exercise } from '@/features/lessons/types';
import { useSession } from '@/store/session';
import { useLessons } from '@/store/lessons';
import { useCelebration } from '@/store/celebration';
import { useThemeSync } from '@/store/theme';
import { colors, spacing, radius } from '@/theme/tokens';

type Step = { type: 'teach'; card: TeachCard } | { type: 'ex'; ex: Exercise };

export default function LessonPlayer() {
  useThemeSync();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const found = getLesson(id);

  const addXp = useSession((s) => s.addXp);
  const completeLesson = useLessons((s) => s.complete);
  const grantXp = useLessons((s) => s.grantXp);
  const celebrate = useCelebration((s) => s.celebrate);

  const steps: Step[] = useMemo(() => {
    if (!found) return [];
    return [
      ...found.lesson.teach.map((card) => ({ type: 'teach' as const, card })),
      ...found.lesson.exercises.map((ex) => ({ type: 'ex' as const, ex })),
    ];
  }, [found]);

  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const [awarded, setAwarded] = useState(0);
  const correctRef = useRef(0);

  if (!found) return null;
  const total = steps.length;
  const exCount = found.lesson.exercises.length;

  const doFinish = () => {
    // Full value = 5 XP per correct + a 10 XP bonus only on a flawless run.
    // grantXp pays just the delta over what this lesson already earned.
    const perfect = correctRef.current === exCount;
    const value = correctRef.current * 5 + (perfect ? 10 : 0);
    const delta = grantXp(id, value);
    if (delta > 0) addXp(delta);
    completeLesson(id);
    setAwarded(delta);
    setFinished(true);
    celebrate({
      icon: perfect ? 'trophy' : 'school',
      color: delta > 0 ? colors.up : colors.muted,
      title: delta > 0 ? `+${delta} XP` : 'Reviewed!',
      subtitle:
        delta > 0
          ? perfect
            ? 'Flawless — full XP earned!'
            : 'Nice — redo it perfectly to top up the XP.'
          : 'You’ve already earned the XP for this lesson.',
    });
  };

  const advance = () => {
    if (step + 1 >= total) doFinish();
    else setStep((s) => s + 1);
  };
  const onExercise = (ok: boolean) => {
    if (ok) correctRef.current += 1;
    advance();
  };

  if (finished) {
    const acc = exCount ? Math.round((correctRef.current / exCount) * 100) : 100;
    return (
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg }}>
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: radius.pill,
              backgroundColor: acc === 100 ? colors.upTint : colors.surfaceAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="trophy" size={48} color={acc === 100 ? colors.up : colors.gold} />
          </View>
          <Txt variant="title" center>
            Lesson complete!
          </Txt>
          <Card flat style={{ flexDirection: 'row', gap: spacing.xxl, backgroundColor: colors.surfaceAlt }}>
            <Stat label="XP earned" value={`+${awarded}`} color={awarded > 0 ? colors.primary : colors.muted} />
            <Stat label="Accuracy" value={`${acc}%`} color={acc >= 80 ? colors.up : colors.ink} />
          </Card>
          {awarded === 0 ? (
            <Txt variant="small" color={colors.muted} center>
              Already earned — replays don’t pay XP again.
            </Txt>
          ) : null}
          <Button label="Continue" variant="success" full style={{ marginTop: spacing.lg }} onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const current = steps[step];

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* top bar: close + progress */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.sm }}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Icon name="close" size={26} color={colors.faint} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <ProgressBar progress={step / total} color={colors.up} height={10} />
        </View>
      </View>

      {current.type === 'teach' ? (
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: spacing.lg, gap: spacing.md }}>
          {current.card.emoji ? <Txt variant="display">{current.card.emoji}</Txt> : null}
          <Txt variant="title">{current.card.heading}</Txt>
          {current.card.chart ? (
            <LessonChart
              candles={current.card.chart.candles}
              markers={current.card.chart.markers}
              zones={current.card.chart.zones}
              width={width - spacing.lg * 2}
              height={190}
            />
          ) : null}
          <Txt variant="body" color={colors.muted}>
            {current.card.body}
          </Txt>
          <Button label="Continue" full style={{ marginTop: spacing.md }} onPress={advance} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.lg }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ExerciseView key={step} ex={current.ex} onDone={onExercise} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Txt variant="h2" color={color}>
        {value}
      </Txt>
      <Txt variant="small" color={colors.muted}>
        {label}
      </Txt>
    </View>
  );
}

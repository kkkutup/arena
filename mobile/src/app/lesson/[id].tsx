import { useMemo, useRef, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Txt, Button, Icon, ProgressBar, Card } from '@/ui';
import { getLesson } from '@/features/lessons/curriculum';
import { ExerciseView } from '@/features/lessons/Exercises';
import { LessonChart } from '@/features/lessons/LessonChart';
import type { TeachCard, Exercise } from '@/features/lessons/types';
import { useSession } from '@/store/session';
import { useLessons } from '@/store/lessons';
import { useCelebration } from '@/store/celebration';
import { useThemeSync } from '@/store/theme';
import { colors, spacing, radius } from '@/theme/tokens';
import { useWindowDimensions } from 'react-native';

type Step = { type: 'teach'; card: TeachCard } | { type: 'ex'; ex: Exercise };

export default function LessonPlayer() {
  useThemeSync();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const found = getLesson(id);

  const addXp = useSession((s) => s.addXp);
  const completeLesson = useLessons((s) => s.complete);
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
    const xp = correctRef.current * 5 + 10;
    addXp(xp);
    completeLesson(id);
    setAwarded(xp);
    setFinished(true);
    celebrate({
      icon: 'school',
      color: colors.up,
      title: `+${xp} XP`,
      subtitle: 'Lesson complete — keep the streak going!',
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
      <Screen>
        <View style={{ alignItems: 'center', gap: spacing.md, marginTop: spacing.xxxl }}>
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: radius.pill,
              backgroundColor: colors.upTint,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="trophy" size={48} color={colors.up} />
          </View>
          <Txt variant="title" center>
            Lesson complete!
          </Txt>
          <Card flat style={{ flexDirection: 'row', gap: spacing.xxl, backgroundColor: colors.surfaceAlt }}>
            <Stat label="XP earned" value={`+${awarded}`} color={colors.primary} />
            <Stat label="Accuracy" value={`${acc}%`} color={acc >= 80 ? colors.up : colors.ink} />
          </Card>
          <Button label="Continue" variant="success" full style={{ marginTop: spacing.lg }} onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const current = steps[step];

  return (
    <Screen>
      {/* top bar: close + progress */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm }}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Icon name="close" size={26} color={colors.faint} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <ProgressBar progress={step / total} color={colors.up} height={10} />
        </View>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        {current.type === 'teach' ? (
          <View style={{ gap: spacing.md }}>
            {current.card.emoji ? <Txt variant="display">{current.card.emoji}</Txt> : null}
            <Txt variant="title">{current.card.heading}</Txt>
            {current.card.chart ? (
              <LessonChart
                candles={current.card.chart.candles}
                markers={current.card.chart.markers}
                width={width - spacing.lg * 2}
                height={170}
              />
            ) : null}
            <Txt variant="body" color={colors.muted}>
              {current.card.body}
            </Txt>
            <Button label="Continue" full style={{ marginTop: spacing.md }} onPress={advance} />
          </View>
        ) : (
          <ExerciseView key={step} ex={current.ex} onDone={onExercise} />
        )}
      </View>
    </Screen>
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

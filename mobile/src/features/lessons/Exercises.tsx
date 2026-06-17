import { useMemo, useState } from 'react';
import { View, Pressable, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Txt, Button, Icon } from '@/ui';
import { LessonChart } from './LessonChart';
import type { Exercise } from './types';
import { colors, spacing, radius } from '@/theme/tokens';

// Stable shuffle for the life of the component (per mount).
function useShuffled<T>(arr: T[]): T[] {
  return useMemo(() => {
    const a = arr.map((v, i) => ({ v, k: Math.random(), i }));
    a.sort((x, y) => x.k - y.k);
    return a.map((x) => x.v);
  }, [arr]);
}

function Feedback({ correct, explain }: { correct: boolean; explain: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: spacing.sm,
        backgroundColor: correct ? colors.upTint : colors.downTint,
        borderRadius: radius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
      }}
    >
      <Icon
        name={correct ? 'checkmark-circle' : 'close-circle'}
        size={20}
        color={correct ? colors.upDark : colors.downDark}
      />
      <View style={{ flex: 1 }}>
        <Txt variant="bodyBold" color={correct ? colors.upDark : colors.downDark}>
          {correct ? 'Correct!' : 'Not quite'}
        </Txt>
        <Txt variant="small" color={colors.muted} style={{ marginTop: 2 }}>
          {explain}
        </Txt>
      </View>
    </View>
  );
}

function Footer({
  checked,
  canCheck,
  correct,
  explain,
  onCheck,
  onDone,
}: {
  checked: boolean;
  canCheck: boolean;
  correct: boolean;
  explain: string;
  onCheck: () => void;
  onDone: (correct: boolean) => void;
}) {
  if (checked) {
    return (
      <View>
        <Feedback correct={correct} explain={explain} />
        <Button
          label={correct ? 'Continue' : 'Got it'}
          variant={correct ? 'success' : 'neutral'}
          full
          onPress={() => onDone(correct)}
        />
      </View>
    );
  }
  return <Button label="Check" full disabled={!canCheck} onPress={onCheck} />;
}

function tap(correct: boolean) {
  void Haptics.notificationAsync(
    correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
  );
}

// ---- single-select option row (used by choice / blank / chart) ----
function OptionButton({
  label,
  state,
  onPress,
  disabled,
}: {
  label: string;
  state: 'idle' | 'selected' | 'correct' | 'wrong';
  onPress: () => void;
  disabled: boolean;
}) {
  const bg =
    state === 'correct'
      ? colors.upTint
      : state === 'wrong'
        ? colors.downTint
        : state === 'selected'
          ? colors.primaryTint
          : colors.surfaceAlt;
  const border =
    state === 'correct'
      ? colors.up
      : state === 'wrong'
        ? colors.down
        : state === 'selected'
          ? colors.primary
          : colors.line;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: bg,
        borderColor: border,
        borderWidth: 1.5,
        borderRadius: radius.lg,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
      }}
    >
      <Txt variant="bodyBold" color={colors.ink}>
        {label}
      </Txt>
    </Pressable>
  );
}

function SingleSelect({
  ex,
  options,
  answer,
  explain,
  chips,
  header,
  onDone,
}: {
  ex: Exercise;
  options: string[];
  answer: number;
  explain: string;
  chips?: boolean;
  header?: React.ReactNode;
  onDone: (correct: boolean) => void;
}) {
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = sel === answer;

  const stateFor = (i: number): 'idle' | 'selected' | 'correct' | 'wrong' => {
    if (!checked) return sel === i ? 'selected' : 'idle';
    if (i === answer) return 'correct';
    if (i === sel) return 'wrong';
    return 'idle';
  };

  return (
    <View style={{ gap: spacing.md }}>
      <Txt variant="h3">{ex.prompt}</Txt>
      {header}
      <View style={{ flexDirection: chips ? 'row' : 'column', flexWrap: 'wrap', gap: spacing.sm }}>
        {options.map((o, i) => (
          <OptionButton
            key={i}
            label={o}
            state={stateFor(i)}
            disabled={checked}
            onPress={() => setSel(i)}
          />
        ))}
      </View>
      <Footer
        checked={checked}
        canCheck={sel !== null}
        correct={correct}
        explain={explain}
        onCheck={() => {
          setChecked(true);
          tap(correct);
        }}
        onDone={onDone}
      />
    </View>
  );
}

// ---- match pairs ----
function MatchExercise({
  ex,
  onDone,
}: {
  ex: Extract<Exercise, { kind: 'match' }>;
  onDone: (correct: boolean) => void;
}) {
  const lefts = ex.pairs.map((p) => p.a);
  const rights = useShuffled(ex.pairs.map((p) => p.b));
  const [selLeft, setSelLeft] = useState<number | null>(null);
  const [map, setMap] = useState<Record<number, number>>({}); // left idx -> right idx
  const [checked, setChecked] = useState(false);

  const assignedRight = (ri: number) => Object.values(map).includes(ri);
  const canCheck = Object.keys(map).length === lefts.length;
  const correct = lefts.every((_, li) => rights[map[li]] === ex.pairs[li].b);

  const pickRight = (ri: number) => {
    if (selLeft === null || checked) return;
    setMap((m) => ({ ...m, [selLeft]: ri }));
    setSelLeft(null);
  };

  return (
    <View style={{ gap: spacing.md }}>
      <Txt variant="h3">{ex.prompt}</Txt>
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <View style={{ flex: 1, gap: spacing.sm }}>
          {lefts.map((l, li) => {
            const done = map[li] !== undefined;
            return (
              <OptionButton
                key={li}
                label={l}
                state={selLeft === li ? 'selected' : done ? 'correct' : 'idle'}
                disabled={checked}
                onPress={() => setSelLeft(li)}
              />
            );
          })}
        </View>
        <View style={{ flex: 1, gap: spacing.sm }}>
          {rights.map((r, ri) => (
            <OptionButton
              key={ri}
              label={r}
              state={assignedRight(ri) ? 'selected' : 'idle'}
              disabled={checked}
              onPress={() => pickRight(ri)}
            />
          ))}
        </View>
      </View>
      <Footer
        checked={checked}
        canCheck={canCheck}
        correct={correct}
        explain={ex.explain}
        onCheck={() => {
          setChecked(true);
          tap(correct);
        }}
        onDone={onDone}
      />
    </View>
  );
}

// ---- order / sequence ----
function OrderExercise({
  ex,
  onDone,
}: {
  ex: Extract<Exercise, { kind: 'order' }>;
  onDone: (correct: boolean) => void;
}) {
  // pool entries keep their original index so we can grade against ex.items
  const pool = useShuffled(ex.items.map((item, idx) => ({ item, idx })));
  const [answer, setAnswer] = useState<number[]>([]); // original indices in chosen order
  const [checked, setChecked] = useState(false);

  const canCheck = answer.length === ex.items.length;
  const correct = answer.every((origIdx, pos) => ex.items[origIdx] === ex.items[pos]);

  const add = (origIdx: number) => {
    if (checked || answer.includes(origIdx)) return;
    setAnswer((a) => [...a, origIdx]);
  };
  const removeAt = (pos: number) => {
    if (checked) return;
    setAnswer((a) => a.filter((_, i) => i !== pos));
  };

  return (
    <View style={{ gap: spacing.md }}>
      <Txt variant="h3">{ex.prompt}</Txt>
      {/* answer row */}
      <View
        style={{
          minHeight: 52,
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.sm,
          borderWidth: 1.5,
          borderColor: colors.line,
          borderStyle: 'dashed',
          borderRadius: radius.lg,
          padding: spacing.sm,
        }}
      >
        {answer.map((origIdx, pos) => (
          <Chip key={pos} label={ex.items[origIdx]} onPress={() => removeAt(pos)} tone="primary" />
        ))}
      </View>
      {/* pool */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {pool.map((p) => (
          <Chip
            key={p.idx}
            label={p.item}
            onPress={() => add(p.idx)}
            tone={answer.includes(p.idx) ? 'ghost' : 'idle'}
          />
        ))}
      </View>
      <Footer
        checked={checked}
        canCheck={canCheck}
        correct={correct}
        explain={ex.explain}
        onCheck={() => {
          setChecked(true);
          tap(correct);
        }}
        onDone={onDone}
      />
    </View>
  );
}

function Chip({
  label,
  onPress,
  tone,
}: {
  label: string;
  onPress: () => void;
  tone: 'idle' | 'primary' | 'ghost';
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor:
          tone === 'primary' ? colors.primaryTint : tone === 'ghost' ? colors.surfaceAlt : colors.surface,
        borderColor: tone === 'primary' ? colors.primary : colors.line,
        borderWidth: 1.5,
        borderRadius: radius.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        opacity: tone === 'ghost' ? 0.4 : 1,
      }}
    >
      <Txt variant="label" color={colors.ink}>
        {label}
      </Txt>
    </Pressable>
  );
}

// ---- dispatcher ----
export function ExerciseView({
  ex,
  onDone,
}: {
  ex: Exercise;
  onDone: (correct: boolean) => void;
}) {
  const { width } = useWindowDimensions();
  const chartWidth = width - spacing.lg * 2;

  switch (ex.kind) {
    case 'choice':
      return <SingleSelect ex={ex} options={ex.options} answer={ex.answer} explain={ex.explain} onDone={onDone} />;
    case 'blank':
      return (
        <SingleSelect ex={ex} options={ex.options} answer={ex.answer} explain={ex.explain} chips onDone={onDone} />
      );
    case 'chart':
      return (
        <ChartSelect ex={ex} chartWidth={chartWidth} onDone={onDone} />
      );
    case 'match':
      return <MatchExercise ex={ex} onDone={onDone} />;
    case 'order':
      return <OrderExercise ex={ex} onDone={onDone} />;
  }
}

function ChartSelect({
  ex,
  chartWidth,
  onDone,
}: {
  ex: Extract<Exercise, { kind: 'chart' }>;
  chartWidth: number;
  onDone: (correct: boolean) => void;
}) {
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = sel === ex.answer;
  const selLabel = sel !== null ? ex.options[sel] : undefined;
  const correctLabel = ex.options[ex.answer];

  return (
    <View style={{ gap: spacing.md }}>
      <Txt variant="h3">{ex.prompt}</Txt>
      <LessonChart
        candles={ex.chart.candles}
        markers={ex.chart.markers}
        width={chartWidth}
        height={180}
        selected={!checked ? selLabel : undefined}
        correct={checked ? correctLabel : undefined}
        wrong={checked && !correct ? selLabel : undefined}
      />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {ex.options.map((o, i) => (
          <View key={i} style={{ flex: 1 }}>
            <OptionButton
              label={o}
              state={
                !checked
                  ? sel === i
                    ? 'selected'
                    : 'idle'
                  : i === ex.answer
                    ? 'correct'
                    : i === sel
                      ? 'wrong'
                      : 'idle'
              }
              disabled={checked}
              onPress={() => setSel(i)}
            />
          </View>
        ))}
      </View>
      <Footer
        checked={checked}
        canCheck={sel !== null}
        correct={correct}
        explain={ex.explain}
        onCheck={() => {
          setChecked(true);
          tap(correct);
        }}
        onDone={onDone}
      />
    </View>
  );
}

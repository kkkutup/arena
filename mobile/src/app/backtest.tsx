import { useEffect, useRef, useState } from 'react';
import { View, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen, Txt, Card, Button, Icon } from '@/ui';
import { CandleChart, type PriceLine } from '@/features/trade/CandleChart';
import {
  makeScenario,
  evaluate,
  PAST,
  FUTURE,
  type Direction,
  type Result,
} from '@/features/backtest/engine';
import { useSession } from '@/store/session';
import { useWallet } from '@/store/wallet';
import { useCelebration } from '@/store/celebration';
import { useTour, type TourStep } from '@/store/tour';
import { TourTarget } from '@/features/tour/TourTarget';
import { useThemeSync } from '@/store/theme';
import { colors, spacing, radius } from '@/theme/tokens';
import { fmtPrice, fmtPct } from '@/lib/format';

const MIN_PCT = 0.5;
const MAX_PCT = 12;
const STEP = 0.5;
const TIMEFRAME = '1H';
const INTRO_TICKS = 20;

const BT_TOUR: TourStep[] = [
  {
    target: 'bt-chart',
    title: 'A real market moment',
    body: `A ${TIMEFRAME} chart of a random coin at a random time. You see what just happened — the next moves are hidden.`,
  },
  {
    target: 'bt-dir',
    title: 'Pick a side',
    body: 'Go Long if you think price will rise, or Short if you think it will fall.',
  },
  {
    target: 'bt-levels',
    title: 'Set your levels',
    body: 'Choose a take-profit (your target) and a stop-loss (your safety net) — your reward vs. your risk.',
  },
  {
    target: 'bt-reveal',
    title: 'Reveal the outcome',
    body: 'We replay what actually happened candle by candle, until your TP or SL hits — and you earn XP.',
  },
];

export default function Backtest() {
  useThemeSync();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const addXp = useSession((s) => s.addXp);
  const addDiamonds = useWallet((s) => s.add);
  const celebrate = useCelebration((s) => s.celebrate);
  const startTour = useTour((s) => s.start);
  const btTourSeen = useSession((s) => s.btTourSeen);
  const markBtTourSeen = useSession((s) => s.markBtTourSeen);

  const [scenario, setScenario] = useState(makeScenario);
  const [dir, setDir] = useState<Direction>('LONG');
  const [slPct, setSlPct] = useState(2);
  const [tpPct, setTpPct] = useState(3);
  const [phase, setPhase] = useState<'setup' | 'revealing' | 'done'>('setup');
  const [revealN, setRevealN] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [introN, setIntroN] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const introTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
      if (introTimer.current) clearInterval(introTimer.current);
    },
    [],
  );

  // Play back the last ~20 candles when a scenario loads, so you can see the
  // recent market action build up to "now".
  useEffect(() => {
    if (introTimer.current) clearInterval(introTimer.current);
    setIntroN(0);
    let k = 0;
    introTimer.current = setInterval(() => {
      k += 1;
      setIntroN(k);
      if (k >= INTRO_TICKS && introTimer.current) clearInterval(introTimer.current);
    }, 70);
    return () => {
      if (introTimer.current) clearInterval(introTimer.current);
    };
  }, [scenario]);

  // First visit only: a short coach-mark tour, after the intro animation plays.
  useEffect(() => {
    if (btTourSeen) return;
    const t = setTimeout(() => void startTour(BT_TOUR, markBtTourSeen), 1800);
    return () => clearTimeout(t);
  }, [btTourSeen, startTour, markBtTourSeen]);

  const { entry, precision, base, domain } = scenario;
  const slPrice = dir === 'LONG' ? entry * (1 - slPct / 100) : entry * (1 + slPct / 100);
  const tpPrice = dir === 'LONG' ? entry * (1 + tpPct / 100) : entry * (1 - tpPct / 100);
  const rr = tpPct / slPct;

  // During setup the past plays in over INTRO_TICKS frames; once revealing we
  // show the full past plus the revealed future.
  const introCount = Math.min(PAST, Math.max(8, PAST - INTRO_TICKS + introN));
  const candles =
    phase === 'setup'
      ? scenario.past.slice(0, introCount)
      : [...scenario.past, ...scenario.future.slice(0, revealN)];
  const chartWidth = width - spacing.lg * 2 - spacing.lg * 2;

  const lines: PriceLine[] = [
    { price: tpPrice, color: colors.up },
    { price: slPrice, color: colors.down },
    { price: entry, color: colors.faint },
  ];

  const reset = () => {
    if (timer.current) clearInterval(timer.current);
    setScenario(makeScenario());
    setDir('LONG');
    setSlPct(2);
    setTpPct(3);
    setPhase('setup');
    setRevealN(0);
    setResult(null);
  };

  const finish = (res: Result) => {
    setPhase('done');
    addXp(res.points);
    if (res.outcome === 'TP') addDiamonds(5);
    void Haptics.notificationAsync(
      res.win ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning,
    );
    celebrate({
      icon: res.outcome === 'TP' ? 'trophy' : res.win ? 'trending-up' : 'school',
      color: res.win ? colors.gold : colors.primary,
      title: `+${res.points} XP`,
      subtitle:
        res.outcome === 'TP'
          ? 'Take-profit hit — clean trade!'
          : res.outcome === 'SL'
            ? 'Stopped out — every test sharpens you.'
            : 'Time ran out — closed at market.',
    });
  };

  const start = () => {
    const res = evaluate(scenario, dir, slPrice, tpPrice);
    setResult(res);
    setPhase('revealing');
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    let n = 0;
    timer.current = setInterval(() => {
      n += 1;
      setRevealN(n);
      if (n >= res.hitIndex + 1) {
        if (timer.current) clearInterval(timer.current);
        finish(res);
      }
    }, 130);
  };

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={{ paddingVertical: spacing.sm, alignSelf: 'flex-start' }}>
        <Icon name="chevron-back" size={28} color={colors.ink} />
      </Pressable>

      <TourTarget id="bt-chart" style={{ marginTop: spacing.sm }}>
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Txt variant="h3">{base}</Txt>
                <View
                  style={{
                    backgroundColor: colors.surfaceAlt,
                    borderRadius: radius.sm,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }}
                >
                  <Txt variant="tiny" color={colors.muted}>
                    {TIMEFRAME}
                  </Txt>
                </View>
              </View>
              <Txt variant="tiny" color={colors.muted} style={{ marginTop: 2 }}>
                {phase === 'setup' ? 'your call' : phase === 'revealing' ? 'revealing…' : 'result'}
              </Txt>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Txt variant="tiny" color={colors.faint}>
                ENTRY
              </Txt>
              <Txt variant="h3">{fmtPrice(entry, precision)}</Txt>
            </View>
          </View>
          <View style={{ marginTop: spacing.md }}>
            <CandleChart
              candles={candles}
              width={chartWidth}
              height={200}
              lines={lines}
              domain={domain}
              slotCount={PAST + FUTURE}
            />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.lg, marginTop: spacing.sm }}>
            <Legend color={colors.up} label="Take profit" />
            <Legend color={colors.down} label="Stop loss" />
            <Legend color={colors.faint} label="Entry" />
          </View>
        </Card>
      </TourTarget>

      {phase === 'setup' ? (
        <View style={{ marginTop: spacing.lg, gap: spacing.lg }}>
          <TourTarget id="bt-dir">
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <DirButton label="Long" active={dir === 'LONG'} color={colors.up} onPress={() => setDir('LONG')} />
              <DirButton label="Short" active={dir === 'SHORT'} color={colors.down} onPress={() => setDir('SHORT')} />
            </View>
          </TourTarget>

          <TourTarget id="bt-levels">
            <View style={{ gap: spacing.lg }}>
              <Stepper
                label="Take profit"
                color={colors.up}
                pct={tpPct}
                price={fmtPrice(tpPrice, precision)}
                onDec={() => setTpPct((v) => Math.max(MIN_PCT, +(v - STEP).toFixed(1)))}
                onInc={() => setTpPct((v) => Math.min(MAX_PCT, +(v + STEP).toFixed(1)))}
              />
              <Stepper
                label="Stop loss"
                color={colors.down}
                pct={slPct}
                price={fmtPrice(slPrice, precision)}
                onDec={() => setSlPct((v) => Math.max(MIN_PCT, +(v - STEP).toFixed(1)))}
                onInc={() => setSlPct((v) => Math.min(MAX_PCT, +(v + STEP).toFixed(1)))}
              />
            </View>
          </TourTarget>

          <Txt variant="small" color={colors.muted} center>
            Risk / reward ≈ {rr.toFixed(2)}×
          </Txt>

          <TourTarget id="bt-reveal">
            <Button label="Reveal outcome" variant="success" full onPress={start} />
          </TourTarget>
        </View>
      ) : null}

      {phase === 'revealing' ? (
        <Txt variant="h3" color={colors.muted} center style={{ marginTop: spacing.xl }}>
          Replaying the market…
        </Txt>
      ) : null}

      {phase === 'done' && result ? (
        <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
          <Card
            flat
            style={{
              backgroundColor: result.win ? colors.upTint : colors.surfaceAlt,
              alignItems: 'center',
              gap: 4,
              paddingVertical: spacing.lg,
            }}
          >
            <Txt variant="tiny" color={result.win ? colors.upDark : colors.muted}>
              {result.outcome === 'TP'
                ? 'TAKE PROFIT HIT'
                : result.outcome === 'SL'
                  ? 'STOPPED OUT'
                  : 'CLOSED AT MARKET'}
            </Txt>
            <Txt variant="display" color={result.win ? colors.up : colors.down}>
              {fmtPct(result.pnlPct)}
            </Txt>
            <Txt variant="bodyBold" color={colors.primary}>
              +{result.points} XP{result.outcome === 'TP' ? '  ·  +5 💎' : ''}
            </Txt>
          </Card>
          <Button label="Play again" variant="success" full onPress={reset} />
          <Button label="Back to Learn" variant="neutral" full onPress={() => router.back()} />
        </View>
      ) : null}
    </Screen>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View style={{ width: 14, height: 3, borderRadius: 2, backgroundColor: color }} />
      <Txt variant="tiny" color={colors.muted}>
        {label}
      </Txt>
    </View>
  );
}

function DirButton({
  label,
  active,
  color,
  onPress,
}: {
  label: string;
  active: boolean;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        height: 48,
        borderRadius: radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: active ? color : colors.surfaceAlt,
        borderWidth: 1.5,
        borderColor: active ? color : colors.line,
      }}
    >
      <Txt variant="bodyBold" color={active ? colors.white : colors.muted}>
        {label}
      </Txt>
    </Pressable>
  );
}

function Stepper({
  label,
  color,
  pct,
  price,
  onDec,
  onInc,
}: {
  label: string;
  color: string;
  pct: number;
  price: string;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <View style={{ flex: 1 }}>
        <Txt variant="label" color={color}>
          {label}
        </Txt>
        <Txt variant="small" color={colors.muted}>
          {pct.toFixed(1)}% · {price}
        </Txt>
      </View>
      <StepBtn icon="remove" onPress={onDec} />
      <StepBtn icon="add" onPress={onInc} />
    </View>
  );
}

function StepBtn({ icon, onPress }: { icon: 'add' | 'remove'; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => {
        void Haptics.selectionAsync();
        onPress();
      }}
      style={{
        width: 44,
        height: 44,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surfaceAlt,
        borderWidth: 1.5,
        borderColor: colors.line,
      }}
    >
      <Icon name={icon} size={22} color={colors.ink} />
    </Pressable>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen, Txt, Card, Icon, ErrorBoundary } from '@/ui';
import { colors, spacing, radius } from '@/theme/tokens';
import { INSTRUMENTS } from '@/mock/data';
import { usePriceEngine, type Candle } from '@/features/trade/usePriceEngine';
import { InteractiveChart } from '@/features/trade/chart/InteractiveChart';
import { CandleChart } from '@/features/trade/CandleChart';
import { OrderTicket } from '@/features/trade/OrderTicket';
import { PositionRow } from '@/features/trade/PositionRow';
import { unrealizedPnl } from '@/features/trade/engine';
import { useTrade } from '@/store/trade';
import { useWallet, DIAMOND } from '@/store/wallet';
import { useCelebration } from '@/store/celebration';
import { useSession } from '@/store/session';
import {
  useCompetition,
  useInstruments,
  usePrices,
  useCandles,
  useCompetitionAccount,
  useOpenPosition,
  useClosePosition,
} from '@/hooks/queries';
import { useThemeSync } from '@/store/theme';
import { fmtUsd, fmtSignedUsd, fmtPct, fmtPrice } from '@/lib/format';
import { playSound } from '@/lib/sound';
import type { Side } from '@/api/types';

type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
const TIMEFRAMES: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1d'];
const CHART_HEIGHT = 240;

function changePct(candles: Candle[]): number {
  if (!candles?.length) return 0;
  const first = candles[0].open;
  return ((candles[candles.length - 1].close - first) / first) * 100;
}

export default function Sandbox() {
  useThemeSync();
  const router = useRouter();
  const { width } = useWindowDimensions();
  // `cid` + `start` come from a competition's "Open trade sandbox" button. A
  // real competition id => trade on the SERVER (moves the shared leaderboard).
  // 'practice' (or no cid) => the standalone local mock sandbox.
  const { cid, start } = useLocalSearchParams<{ cid?: string; start?: string }>();
  const live = !!cid && cid !== 'practice';
  const acctKey = cid ?? 'practice';
  const startParam = Number(start) || 100000;

  // ── data sources (all hooks called unconditionally) ──────────────────────
  const engine = usePriceEngine(acctKey, !live); // mock; interval off when live
  const compQ = useCompetition(cid ?? '', live);
  const instrumentsQ = useInstruments();
  const pricesQ = usePrices(live);
  const accountQ = useCompetitionAccount(cid ?? '', live);
  const openMut = useOpenPosition(cid ?? '');
  const closeMut = useClosePosition(cid ?? '');

  const ensure = useTrade((s) => s.ensure);
  const mockAccount = useTrade((s) => s.accounts[acctKey]);
  const openFn = useTrade((s) => s.open);
  const closeFn = useTrade((s) => s.close);
  const addDiamonds = useWallet((s) => s.add);
  const celebrate = useCelebration((s) => s.celebrate);
  const firstTradeDone = useSession((s) => s.firstTradeDone);
  const markFirstTrade = useSession((s) => s.markFirstTrade);

  const [symbol, setSymbol] = useState(INSTRUMENTS[0].symbol);
  const [timeframe, setTimeframe] = useState<Timeframe>('1m');
  const [tradeError, setTradeError] = useState<string | null>(null);

  const instrumentsList = useMemo(() => {
    if (!live) return INSTRUMENTS;
    const allowed = compQ.data?.instruments ?? [];
    return (instrumentsQ.data ?? []).filter((i) => allowed.includes(i.symbol));
  }, [live, compQ.data, instrumentsQ.data]);

  const candlesQ = useCandles(symbol, timeframe, live);

  // Local mock account only matters in practice mode.
  useEffect(() => {
    if (!live) ensure(acctKey, startParam);
  }, [live, ensure, acctKey, startParam]);

  // Keep the selected symbol within this competition's allowed instruments.
  useEffect(() => {
    if (live && instrumentsList.length && !instrumentsList.some((i) => i.symbol === symbol)) {
      setSymbol(instrumentsList[0].symbol);
    }
  }, [live, instrumentsList, symbol]);

  // ── unified view-model ───────────────────────────────────────────────────
  const pricesMap = live ? pricesQ.data?.prices ?? {} : engine.prices;
  const candles = live ? candlesQ.data ?? [] : engine.candles[symbol] ?? [];
  const positions = live ? accountQ.data?.positions ?? [] : mockAccount?.positions ?? [];
  const cashBalance = live
    ? accountQ.data?.cashBalance ?? startParam
    : mockAccount?.cashBalance ?? startParam;
  const startingBalance = live
    ? accountQ.data?.startingBalance ?? startParam
    : mockAccount?.startingBalance ?? startParam;

  const inst = instrumentsList.find((i) => i.symbol === symbol) ?? instrumentsList[0];
  const price = pricesMap[symbol] ?? 0;
  const chg = changePct(candles);

  let unreal = 0;
  let used = 0;
  for (const p of positions) {
    unreal += unrealizedPnl(p.side, p.qty, p.entryPrice, pricesMap[p.symbol] ?? p.entryPrice);
    used += p.margin;
  }
  const equity = cashBalance + unreal;
  const freeMargin = equity - used;
  const totalPnl = equity - startingBalance;
  const maxLev = live
    ? Math.min(inst?.maxLeverage ?? 100, compQ.data?.maxLeverage ?? 100)
    : inst?.maxLeverage ?? 100;

  const submit = async (side: Side, qty: number, leverage: number) => {
    setTradeError(null);
    if (live) {
      try {
        await openMut.mutateAsync({ symbol, side, qty, leverage });
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        playSound('open');
        if (!firstTradeDone) {
          markFirstTrade();
          celebrate({
            icon: 'flash',
            color: colors.gold,
            title: 'First Trade!',
            subtitle: 'You opened your first position. Welcome to the Arena.',
          });
        }
      } catch (e) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setTradeError(e instanceof Error ? e.message : 'Could not open position');
      }
      return;
    }
    const id = openFn(acctKey, { symbol, side, qty, leverage, price });
    void Haptics.notificationAsync(
      id ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
    );
    if (id) playSound('open');
    if (id && !firstTradeDone) {
      markFirstTrade();
      celebrate({
        icon: 'flash',
        color: colors.gold,
        title: 'First Trade!',
        subtitle: 'You opened your first position. Welcome to the Arena.',
      });
    }
  };

  const closePos = async (p: { id: string; symbol: string; side: Side; qty: number; entryPrice: number }) => {
    setTradeError(null);
    const exit = pricesMap[p.symbol] ?? p.entryPrice;
    const pnl = unrealizedPnl(p.side, p.qty, p.entryPrice, exit);
    if (live) {
      try {
        await closeMut.mutateAsync(p.id);
        if (pnl > 0) addDiamonds(DIAMOND.TRADE_REWARD);
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        playSound(pnl > 0 ? 'win' : 'lose');
      } catch (e) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setTradeError(e instanceof Error ? e.message : 'Could not close position');
      }
      return;
    }
    closeFn(acctKey, p.id, exit);
    if (pnl > 0) addDiamonds(DIAMOND.TRADE_REWARD);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playSound(pnl > 0 ? 'win' : 'lose');
  };

  const chartWidth = width - spacing.lg * 2 - spacing.lg * 2;
  const busy = openMut.isPending || closeMut.isPending;

  // Need the selected instrument before rendering (in live mode this also
  // waits on the competition's instrument list to load).
  if (!inst) {
    return (
      <Screen>
        <Pressable onPress={() => router.back()} style={{ paddingVertical: spacing.sm, alignSelf: 'flex-start' }}>
          <Icon name="chevron-back" size={28} color={colors.ink} />
        </Pressable>
        <Txt variant="body" color={colors.muted}>
          Loading market…
        </Txt>
      </Screen>
    );
  }

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={{ paddingVertical: spacing.sm, alignSelf: 'flex-start' }}>
        <Icon name="chevron-back" size={28} color={colors.ink} />
      </Pressable>

      {/* account bar */}
      <Card flat style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm }}>
        <Stat label="Equity" value={fmtUsd(equity, 2)} />
        <Stat label="Free margin" value={fmtUsd(freeMargin, 2)} />
        <Stat
          label="P&L"
          value={fmtSignedUsd(totalPnl)}
          color={totalPnl >= 0 ? colors.up : colors.down}
        />
      </Card>

      {/* symbol tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: spacing.md }}
        contentContainerStyle={{ gap: spacing.sm, paddingVertical: 2 }}
      >
        {instrumentsList.map((i) => {
          const active = i.symbol === symbol;
          const tabChg = changePct(engine.candles[i.symbol] ?? []);
          return (
            <Pressable
              key={i.symbol}
              onPress={() => setSymbol(i.symbol)}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: radius.md,
                backgroundColor: active ? colors.primary : colors.surfaceAlt,
                minWidth: 96,
              }}
            >
              <Txt variant="label" color={active ? colors.white : colors.ink}>
                {i.base}
              </Txt>
              {live ? (
                <Txt variant="tiny" color={active ? colors.white : colors.muted}>
                  {fmtPrice(pricesMap[i.symbol] ?? 0, i.pricePrecision)}
                </Txt>
              ) : (
                <Txt variant="tiny" color={tabChg >= 0 ? colors.up : colors.down}>
                  {fmtPct(tabChg)}
                </Txt>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* chart */}
      <Card style={{ marginTop: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View>
            <Txt variant="h3">{inst.label}</Txt>
            <Txt variant="tiny" color={colors.muted}>
              {live ? 'live prices · virtual funds' : 'virtual · practice feed'}
            </Txt>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Txt variant="h2" color={chg >= 0 ? colors.up : colors.down}>
              {fmtPrice(price, inst.pricePrecision)}
            </Txt>
            <Txt variant="small" color={chg >= 0 ? colors.up : colors.down}>
              {fmtPct(chg)}
            </Txt>
          </View>
        </View>
        {live ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: spacing.md }}
            contentContainerStyle={{ gap: spacing.xs }}
          >
            {TIMEFRAMES.map((tf) => {
              const active = tf === timeframe;
              return (
                <Pressable
                  key={tf}
                  onPress={() => setTimeframe(tf)}
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: 6,
                    borderRadius: radius.sm,
                    backgroundColor: active ? colors.primary : colors.surfaceAlt,
                  }}
                >
                  <Txt variant="label" color={active ? colors.white : colors.muted}>
                    {tf}
                  </Txt>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}
        <View style={{ marginTop: spacing.md }}>
          <ErrorBoundary
            fallback={(error) => (
              <View>
                <CandleChart candles={candles} width={chartWidth} height={190} />
                <Txt variant="tiny" color={colors.down} style={{ marginTop: spacing.sm }}>
                  chart error: {error.message}
                </Txt>
              </View>
            )}
          >
            <InteractiveChart
              candles={candles}
              symbol={symbol}
              width={chartWidth}
              height={CHART_HEIGHT}
            />
          </ErrorBoundary>
        </View>
      </Card>

      {/* order ticket */}
      <View style={{ marginTop: spacing.md }}>
        <OrderTicket
          base={inst.base}
          price={price}
          precision={inst.pricePrecision}
          freeMargin={freeMargin}
          maxLeverage={maxLev}
          tradingHalted={busy}
          onSubmit={submit}
        />
      </View>

      {tradeError ? (
        <Txt variant="small" color={colors.down} center style={{ marginTop: spacing.sm }}>
          {tradeError}
        </Txt>
      ) : null}

      {/* open positions */}
      <Txt variant="h2" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
        Open positions
      </Txt>
      {positions.length === 0 ? (
        <Card flat style={{ backgroundColor: colors.surfaceAlt, alignItems: 'center', paddingVertical: spacing.xl }}>
          <Icon name="pulse" size={28} color={colors.faint} />
          <Txt variant="body" color={colors.muted} style={{ marginTop: spacing.sm }}>
            No open positions yet
          </Txt>
        </Card>
      ) : (
        <Card>
          {positions.map((p, i) => (
            <PositionRow
              key={p.id}
              pos={p}
              price={pricesMap[p.symbol] ?? p.entryPrice}
              last={i === positions.length - 1}
              onClose={() => void closePos(p)}
            />
          ))}
        </Card>
      )}
    </Screen>
  );
}

function Stat({ label, value, color = colors.ink }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Txt variant="tiny" color={colors.faint}>
        {label.toUpperCase()}
      </Txt>
      <Txt variant="num" color={color}>
        {value}
      </Txt>
    </View>
  );
}

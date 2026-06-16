import { useState } from 'react';
import { View, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen, Txt, Card, Icon } from '@/ui';
import { colors, spacing, radius } from '@/theme/tokens';
import { INSTRUMENTS } from '@/mock/data';
import { usePriceEngine, type Candle } from '@/features/trade/usePriceEngine';
import { CandleChart } from '@/features/trade/CandleChart';
import { OrderTicket } from '@/features/trade/OrderTicket';
import { PositionRow } from '@/features/trade/PositionRow';
import { unrealizedPnl } from '@/features/trade/engine';
import { useTrade } from '@/store/trade';
import { useCelebration } from '@/store/celebration';
import { fmtUsd, fmtSignedUsd, fmtPct, fmtPrice } from '@/lib/format';
import type { Side } from '@/api/types';

function changePct(candles: Candle[]): number {
  if (!candles?.length) return 0;
  const first = candles[0].open;
  return ((candles[candles.length - 1].close - first) / first) * 100;
}

export default function Sandbox() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const engine = usePriceEngine();
  const [symbol, setSymbol] = useState(INSTRUMENTS[0].symbol);

  const positions = useTrade((s) => s.positions);
  const cashBalance = useTrade((s) => s.cashBalance);
  const startingBalance = useTrade((s) => s.startingBalance);
  const history = useTrade((s) => s.history);
  const openFn = useTrade((s) => s.open);
  const closeFn = useTrade((s) => s.close);
  const celebrate = useCelebration((s) => s.celebrate);

  const inst = INSTRUMENTS.find((i) => i.symbol === symbol)!;
  const price = engine.prices[symbol] ?? 0;
  const candles = engine.candles[symbol] ?? [];
  const chg = changePct(candles);

  let unreal = 0;
  let used = 0;
  for (const p of positions) {
    unreal += unrealizedPnl(p.side, p.qty, p.entryPrice, engine.prices[p.symbol] ?? p.entryPrice);
    used += p.margin;
  }
  const equity = cashBalance + unreal;
  const freeMargin = equity - used;
  const totalPnl = equity - startingBalance;

  const submit = (side: Side, qty: number, leverage: number) => {
    const wasFirst = positions.length === 0 && history.length === 0;
    const id = openFn({ symbol, side, qty, leverage, price });
    void Haptics.notificationAsync(
      id ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
    );
    if (id && wasFirst) {
      celebrate({
        icon: 'flash',
        color: colors.gold,
        title: 'First Trade!',
        subtitle: 'You opened your first position. Welcome to the Arena.',
      });
    }
  };

  const chartWidth = width - spacing.lg * 2 - spacing.lg * 2;

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
        {INSTRUMENTS.map((i) => {
          const active = i.symbol === symbol;
          const c = changePct(engine.candles[i.symbol] ?? []);
          return (
            <Pressable
              key={i.symbol}
              onPress={() => setSymbol(i.symbol)}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: radius.md,
                backgroundColor: active ? colors.ink : colors.surfaceAlt,
                minWidth: 96,
              }}
            >
              <Txt variant="label" color={active ? colors.white : colors.ink}>
                {i.base}
              </Txt>
              <Txt variant="tiny" color={c >= 0 ? colors.up : colors.down}>
                {fmtPct(c)}
              </Txt>
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
              virtual · live mock feed
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
        <View style={{ marginTop: spacing.md }}>
          <CandleChart candles={candles} width={chartWidth} height={190} />
        </View>
      </Card>

      {/* order ticket */}
      <View style={{ marginTop: spacing.md }}>
        <OrderTicket
          base={inst.base}
          price={price}
          precision={inst.pricePrecision}
          freeMargin={freeMargin}
          maxLeverage={inst.maxLeverage}
          onSubmit={submit}
        />
      </View>

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
              price={engine.prices[p.symbol] ?? p.entryPrice}
              last={i === positions.length - 1}
              onClose={() => {
                closeFn(p.id, engine.prices[p.symbol] ?? p.entryPrice);
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
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

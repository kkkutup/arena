import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Card, Txt, TextField, Button } from '@/ui';
import { colors, spacing, radius } from '@/theme/tokens';
import { marginRequired, liquidationPrice } from './engine';
import { fmtUsd, fmtPrice } from '@/lib/format';
import type { Side } from '@/api/types';

const LEVS = [1, 2, 5, 10, 20, 50, 100];

export function OrderTicket({
  base,
  price,
  precision,
  freeMargin,
  maxLeverage,
  tradingHalted,
  onSubmit,
}: {
  base: string;
  price: number;
  precision: number;
  freeMargin: number;
  maxLeverage: number;
  tradingHalted?: boolean;
  onSubmit: (side: Side, qty: number, leverage: number) => void;
}) {
  const [qty, setQty] = useState('');
  const [lev, setLev] = useState(10);
  const levs = LEVS.filter((l) => l <= maxLeverage);
  const effLev = Math.min(lev, maxLeverage);
  const qn = parseFloat(qty) || 0;
  const margin = price > 0 ? marginRequired(qn, price, effLev) : 0;
  const notional = qn * price;
  const longLiq = price > 0 ? liquidationPrice('LONG', price, effLev) : 0;
  const shortLiq = price > 0 ? liquidationPrice('SHORT', price, effLev) : 0;

  const setPct = (pct: number) => {
    if (price <= 0) return;
    const usable = Math.max(freeMargin, 0) * pct;
    setQty(((usable * effLev) / price).toFixed(4));
  };

  const submit = (side: Side) => {
    if (qn <= 0) return;
    onSubmit(side, qn, effLev);
    setQty('');
  };

  return (
    <Card>
      <TextField
        label={`Quantity (${base})`}
        value={qty}
        onChangeText={(t) => setQty(t.replace(/[^0-9.]/g, ''))}
        keyboardType="decimal-pad"
        placeholder={`0.00 ${base}`}
      />

      <View style={{ flexDirection: 'row', gap: 6, marginTop: spacing.sm }}>
        {[0.25, 0.5, 0.75, 1].map((p) => (
          <Pressable
            key={p}
            onPress={() => setPct(p)}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 7,
              borderRadius: radius.md,
              borderWidth: 1.5,
              borderColor: colors.line,
            }}
          >
            <Txt variant="small" color={colors.muted}>
              {p * 100}%
            </Txt>
          </Pressable>
        ))}
      </View>

      <Txt variant="label" color={colors.muted} style={{ marginTop: spacing.md, marginBottom: 6 }}>
        Leverage
      </Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {levs.map((l) => {
          const active = l === effLev;
          return (
            <Pressable
              key={l}
              onPress={() => setLev(l)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: radius.md,
                backgroundColor: active ? colors.primary : colors.surfaceAlt,
              }}
            >
              <Txt variant="label" color={active ? colors.white : colors.muted}>
                {l}×
              </Txt>
            </Pressable>
          );
        })}
      </View>

      <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md, gap: 6 }}>
        <Row label="Position value" value={fmtUsd(notional, 2)} />
        <Row label="Margin required" value={fmtUsd(margin, 2)} />
        <Row label="Liq. (long)" value={fmtPrice(longLiq, precision)} color={colors.down} />
        <Row label="Liq. (short)" value={fmtPrice(shortLiq, precision)} color={colors.down} />
      </View>

      {tradingHalted ? (
        <Txt variant="small" color={colors.flameDark} style={{ marginTop: spacing.sm }}>
          Trading halted.
        </Txt>
      ) : null}

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Button label="Buy / Long" variant="success" full disabled={tradingHalted} onPress={() => submit('LONG')} />
        </View>
        <View style={{ flex: 1 }}>
          <Button label="Sell / Short" variant="danger" full disabled={tradingHalted} onPress={() => submit('SHORT')} />
        </View>
      </View>

      <Txt variant="tiny" color={colors.faint} style={{ marginTop: spacing.sm }}>
        Free margin: {fmtUsd(freeMargin, 2)} · virtual funds
      </Txt>
    </Card>
  );
}

function Row({ label, value, color = colors.ink }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Txt variant="small" color={colors.muted}>
        {label}
      </Txt>
      <Txt variant="small" color={color} style={{ fontVariant: ['tabular-nums'] }}>
        {value}
      </Txt>
    </View>
  );
}

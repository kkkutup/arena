import { View } from 'react-native';
import { Txt, Pill, Button } from '@/ui';
import { colors, spacing } from '@/theme/tokens';
import { unrealizedPnl, roe } from './engine';
import { fmtSignedUsd, fmtPct, fmtPrice, fmtNum } from '@/lib/format';
import { INSTRUMENTS } from '@/mock/data';
import type { Side } from '@/api/types';

// Structural shape shared by the local store's OpenPosition and the server's
// Position — only the fields this row actually renders.
type PositionView = {
  symbol: string;
  side: Side;
  qty: number;
  leverage: number;
  entryPrice: number;
  margin: number;
};

export function PositionRow({
  pos,
  price,
  onClose,
  last,
}: {
  pos: PositionView;
  price: number;
  onClose: () => void;
  last: boolean;
}) {
  const inst = INSTRUMENTS.find((i) => i.symbol === pos.symbol);
  const precision = inst?.pricePrecision ?? 2;
  const label = inst?.label ?? pos.symbol;
  const pnl = unrealizedPnl(pos.side, pos.qty, pos.entryPrice, price);
  const r = roe(pnl, pos.margin);
  const up = pnl >= 0;
  const sideColor = pos.side === 'LONG' ? colors.up : colors.down;

  return (
    <View
      style={{
        paddingVertical: spacing.md,
        borderBottomWidth: last ? 0 : 1.5,
        borderBottomColor: colors.line,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Pill
            label={`${pos.side} ${pos.leverage}×`}
            color={sideColor}
            tint={pos.side === 'LONG' ? colors.upTint : colors.downTint}
          />
          <Txt variant="bodyBold">{label}</Txt>
        </View>
        <Txt variant="num" color={up ? colors.up : colors.down}>
          {fmtSignedUsd(pnl)}
        </Txt>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        <Txt variant="small" color={colors.muted}>
          {fmtNum(pos.qty, 4)} @ {fmtPrice(pos.entryPrice, precision)} · mark{' '}
          {fmtPrice(price, precision)}
        </Txt>
        <Txt variant="small" color={up ? colors.up : colors.down}>
          {fmtPct(r * 100)}
        </Txt>
      </View>

      <Button
        label="Close"
        variant="neutral"
        size="sm"
        style={{ marginTop: spacing.sm }}
        onPress={onClose}
      />
    </View>
  );
}

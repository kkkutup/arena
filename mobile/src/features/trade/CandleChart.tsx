import { Fragment } from 'react';
import { View } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';
import { colors } from '@/theme/tokens';
import type { Candle } from './usePriceEngine';

export function CandleChart({
  candles,
  width,
  height,
}: {
  candles: Candle[];
  width: number;
  height: number;
}) {
  if (candles.length === 0 || width <= 0) return <View style={{ width, height }} />;

  const padTop = 10;
  const padBottom = 10;
  const h = height - padTop - padBottom;

  let max = -Infinity;
  let min = Infinity;
  for (const c of candles) {
    if (c.high > max) max = c.high;
    if (c.low < min) min = c.low;
  }
  if (max === min) {
    max += 1;
    min -= 1;
  }
  const range = max - min;
  const n = candles.length;
  const slot = width / n;
  const bodyW = Math.max(2.5, slot * 0.62);
  const y = (p: number) => padTop + (1 - (p - min) / range) * h;

  const last = candles[n - 1].close;
  const lastY = y(last);
  const up = last >= candles[n - 1].open;

  return (
    <Svg width={width} height={height}>
      {/* current price guide */}
      <Line
        x1={0}
        y1={lastY}
        x2={width}
        y2={lastY}
        stroke={up ? colors.up : colors.down}
        strokeWidth={1}
        strokeDasharray="4 4"
        opacity={0.5}
      />
      {candles.map((c, i) => {
        const x = i * slot + slot / 2;
        const isUp = c.close >= c.open;
        const col = isUp ? colors.up : colors.down;
        const yOpen = y(c.open);
        const yClose = y(c.close);
        const top = Math.min(yOpen, yClose);
        const bodyH = Math.max(2, Math.abs(yClose - yOpen));
        return (
          <Fragment key={i}>
            <Line x1={x} y1={y(c.high)} x2={x} y2={y(c.low)} stroke={col} strokeWidth={1.2} />
            <Rect x={x - bodyW / 2} y={top} width={bodyW} height={bodyH} fill={col} rx={1} />
          </Fragment>
        );
      })}
    </Svg>
  );
}

import { Fragment } from 'react';
import { View } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';
import { colors } from '@/theme/tokens';
import type { Candle } from './usePriceEngine';

export interface PriceLine {
  price: number;
  color: string;
  dashed?: boolean;
}

export function CandleChart({
  candles,
  width,
  height,
  lines,
  domain,
  slotCount,
}: {
  candles: Candle[];
  width: number;
  height: number;
  // optional horizontal price markers (SL / TP / entry)
  lines?: PriceLine[];
  // fixed price domain so the y-scale stays put while candles are revealed
  domain?: { min: number; max: number };
  // fixed number of horizontal slots (so a growing series keeps candle width)
  slotCount?: number;
}) {
  if (candles.length === 0 || width <= 0) return <View style={{ width, height }} />;

  const padTop = 10;
  const padBottom = 10;
  const h = height - padTop - padBottom;

  let max = -Infinity;
  let min = Infinity;
  if (domain) {
    min = domain.min;
    max = domain.max;
  } else {
    for (const c of candles) {
      if (c.high > max) max = c.high;
      if (c.low < min) min = c.low;
    }
    for (const l of lines ?? []) {
      if (l.price > max) max = l.price;
      if (l.price < min) min = l.price;
    }
  }
  if (max === min) {
    max += 1;
    min -= 1;
  }
  const range = max - min;
  const n = candles.length;
  const slots = slotCount ?? n;
  const slot = width / slots;
  const bodyW = Math.max(2.5, slot * 0.62);
  const y = (p: number) => padTop + (1 - (p - min) / range) * h;

  const last = candles[n - 1].close;
  const lastY = y(last);
  const up = last >= candles[n - 1].open;

  return (
    <Svg width={width} height={height}>
      {/* SL / TP / entry markers */}
      {(lines ?? []).map((l, i) => (
        <Line
          key={`l${i}`}
          x1={0}
          y1={y(l.price)}
          x2={width}
          y2={y(l.price)}
          stroke={l.color}
          strokeWidth={1.5}
          strokeDasharray={l.dashed === false ? undefined : '5 4'}
          opacity={0.9}
        />
      ))}
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

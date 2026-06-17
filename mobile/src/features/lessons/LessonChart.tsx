import { Fragment } from 'react';
import { View } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';
import { Txt } from '@/ui';
import type { SimpleCandle, ChartMarker } from './types';
import { colors, radius } from '@/theme/tokens';

// Renders a small candle series with optional labelled marker bands (A/B/C…)
// for "tap the zone" exercises. `selected` highlights a band; `correct` /
// `wrong` recolour bands after the answer is checked.
export function LessonChart({
  candles,
  markers,
  width,
  height,
  selected,
  correct,
  wrong,
}: {
  candles: SimpleCandle[];
  markers?: ChartMarker[];
  width: number;
  height: number;
  selected?: string;
  correct?: string;
  wrong?: string;
}) {
  const padTop = 18;
  const padBottom = 8;
  const h = height - padTop - padBottom;

  let max = -Infinity;
  let min = Infinity;
  for (const k of candles) {
    if (k.h > max) max = k.h;
    if (k.l < min) min = k.l;
  }
  const range = max - min || 1;
  const n = candles.length;
  const slot = width / n;
  const bodyW = Math.max(4, slot * 0.6);
  const y = (p: number) => padTop + (1 - (p - min) / range) * h;

  const bandColor = (label: string) => {
    if (correct === label) return colors.up;
    if (wrong === label) return colors.down;
    if (selected === label) return colors.primary;
    return colors.faint;
  };

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        {/* marker bands */}
        {(markers ?? []).map((m) => {
          const col = bandColor(m.label);
          return (
            <Rect
              key={`band-${m.label}`}
              x={m.index * slot + 1}
              y={padTop}
              width={slot - 2}
              height={h}
              fill={col}
              opacity={selected === m.label || correct === m.label || wrong === m.label ? 0.18 : 0.08}
              rx={4}
            />
          );
        })}
        {/* candles */}
        {candles.map((k, i) => {
          const x = i * slot + slot / 2;
          const isUp = k.c >= k.o;
          const col = isUp ? colors.up : colors.down;
          const top = Math.min(y(k.o), y(k.c));
          const bodyH = Math.max(2, Math.abs(y(k.c) - y(k.o)));
          return (
            <Fragment key={i}>
              <Line x1={x} y1={y(k.h)} x2={x} y2={y(k.l)} stroke={col} strokeWidth={1.4} />
              <Rect x={x - bodyW / 2} y={top} width={bodyW} height={bodyH} fill={col} rx={1.5} />
            </Fragment>
          );
        })}
      </Svg>
      {/* labels above each band */}
      {(markers ?? []).map((m) => (
        <View
          key={`lbl-${m.label}`}
          style={{
            position: 'absolute',
            top: 0,
            left: m.index * slot,
            width: slot,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: bandColor(m.label),
              borderRadius: radius.sm,
              paddingHorizontal: 7,
              paddingVertical: 1,
            }}
          >
            <Txt variant="tiny" color={colors.white}>
              {m.label}
            </Txt>
          </View>
        </View>
      ))}
    </View>
  );
}

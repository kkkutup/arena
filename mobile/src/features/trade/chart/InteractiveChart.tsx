import { useRef, useState } from 'react';
import {
  View,
  Pressable,
  PanResponder,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from 'react-native';
import Svg, { Rect, Line, Circle, Polygon, Text as SvgText } from 'react-native-svg';
import { Icon } from '@/ui';
import type { IconName } from '@/ui/Icon';
import type { Candle } from '@/features/trade/usePriceEngine';
import { colors, radius, spacing } from '@/theme/tokens';
import { useChartTools, type ChartTool } from './useChartTools';
import { drawId, linePriceAt, type Anchor, type Drawing } from './drawings';

const PAD = 10;
const AXIS_H = 16; // bottom band reserved for time-axis labels
const MIN_VIEW = 12;
const MAX_VIEW = 200;
const HANDLE_HIT = 26;
const SELECT_HIT = 16;

// Candle times are unix seconds in live mode and ms in the mock feed.
const toMs = (t: number): number => (t < 1e12 ? t * 1000 : t);
const pad2 = (n: number): string => String(n).padStart(2, '0');
function fmtAxisTime(t: number, dateMode: boolean): string {
  const d = new Date(toMs(t));
  if (dateMode) return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

// react-native-svg throws a hard native crash on Android if any coordinate prop
// is NaN/Infinity. Every number we hand to an SVG element goes through this.
const fin = (v: number, fb = 0): number => (Number.isFinite(v) ? v : fb);
const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};
const clamp = (v: number, lo: number, hi: number): number => Math.min(Math.max(v, lo), hi);

// Distance between the first two active touches (for pinch-zoom).
function touchDist(touches: { pageX: number; pageY: number }[]): number {
  if (touches.length < 2) return 0;
  return Math.hypot(touches[0].pageX - touches[1].pageX, touches[0].pageY - touches[1].pageY);
}

type HandlePart = 'a' | 'b' | 'price' | 'offset';

interface Geom {
  count: number;
  visible: Candle[];
  slot: number;
  width: number;
  height: number;
  xOf: (time: number) => number;
  yOf: (price: number) => number;
  timeOf: (x: number) => number;
  priceOf: (y: number) => number;
}

function buildGeom(candles: Candle[], count: number, rightGap: number, width: number, height: number): Geom {
  const n = candles.length;
  const c = Math.min(Math.max(count, MIN_VIEW), Math.max(MIN_VIEW, n || MIN_VIEW));
  const offset = Math.min(Math.max(n - c - rightGap, 0), Math.max(0, n - c));
  const visible = candles.slice(offset, offset + c);
  const slot = width / Math.max(c, 1);
  let min = Infinity;
  let max = -Infinity;
  for (const k of visible) {
    const lo = num(k.low);
    const hi = num(k.high);
    if (lo < min) min = lo;
    if (hi > max) max = hi;
  }
  if (!isFinite(min) || !isFinite(max) || min === max) {
    min = (isFinite(min) ? min : 1) - 1;
    max = (isFinite(max) ? max : 1) + 1;
  }
  const pad = (max - min) * 0.08;
  min -= pad;
  max += pad;
  const h = height - PAD - AXIS_H;
  const t0 = visible.length ? num(visible[0].time) : 0;
  const t1 = visible.length ? num(visible[visible.length - 1].time) : 1;
  const span = t1 - t0 || 1;
  const range = max - min || 1;
  return {
    count: c,
    visible,
    slot,
    width,
    height,
    xOf: (time) => fin(slot / 2 + ((num(time) - t0) / span) * (width - slot)),
    yOf: (price) => fin(PAD + (1 - (num(price) - min) / range) * h),
    timeOf: (x) => fin(t0 + ((x - slot / 2) / (width - slot || 1)) * span),
    priceOf: (y) => fin(min + (1 - (y - PAD) / h) * range),
  };
}

function handlesOf(d: Drawing, g: Geom): { part: HandlePart; x: number; y: number }[] {
  if (d.kind === 'hline') return [{ part: 'price', x: g.width / 2, y: g.yOf(d.price) }];
  const base = [
    { part: 'a' as HandlePart, x: g.xOf(d.a.time), y: g.yOf(d.a.price) },
    { part: 'b' as HandlePart, x: g.xOf(d.b.time), y: g.yOf(d.b.price) },
  ];
  if (d.kind === 'trend') return base;
  return [...base, { part: 'offset', x: g.xOf(d.b.time), y: g.yOf(d.b.price + d.offset) }];
}

function moveHandle(d: Drawing, part: HandlePart, time: number, price: number): Drawing {
  if (d.kind === 'hline') return { ...d, price };
  if (part === 'a') return { ...d, a: { time, price } };
  if (part === 'b') return { ...d, b: { time, price } };
  if (d.kind === 'channel' && part === 'offset') return { ...d, offset: price - d.b.price };
  return d;
}

function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  let t = len2 ? ((px - x1) * dx + (py - y1) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function distToDrawing(d: Drawing, px: number, py: number, g: Geom): number {
  if (d.kind === 'hline') return Math.abs(py - g.yOf(d.price));
  const ax = g.xOf(d.a.time);
  const ay = g.yOf(d.a.price);
  const bx = g.xOf(d.b.time);
  const by = g.yOf(d.b.price);
  if (d.kind === 'trend') return distToSegment(px, py, ax, ay, bx, by);
  const ay2 = g.yOf(d.a.price + d.offset);
  const by2 = g.yOf(d.b.price + d.offset);
  return Math.min(distToSegment(px, py, ax, ay, bx, by), distToSegment(px, py, ax, ay2, bx, by2));
}

// Stable reference for "no drawings yet" — returning a fresh [] from the zustand
// selector each render makes useSyncExternalStore loop forever ("Maximum update
// depth exceeded").
const EMPTY_DRAWINGS: Drawing[] = [];

const TOOLS: { key: ChartTool; icon: IconName }[] = [
  { key: 'move', icon: 'move' },
  { key: 'hline', icon: 'remove' },
  { key: 'trend', icon: 'trending-up' },
  { key: 'channel', icon: 'reorder-two' },
];

export function InteractiveChart({
  candles,
  symbol,
  width,
  height,
}: {
  candles: Candle[];
  symbol: string;
  width: number;
  height: number;
}) {
  'use no memo'; // opt out of React Compiler — this component mutates a ref during
  // render (the gesture snapshot), which the compiler can miscompile.
  const tool = useChartTools((s) => s.tool);
  const setTool = useChartTools((s) => s.setTool);
  const selectedId = useChartTools((s) => s.selectedId);
  const select = useChartTools((s) => s.select);
  const drawings = useChartTools((s) => s.bySymbol[symbol]) ?? EMPTY_DRAWINGS;
  const add = useChartTools((s) => s.add);
  const replace = useChartTools((s) => s.replace);
  const remove = useChartTools((s) => s.remove);
  const clear = useChartTools((s) => s.clear);

  const [count, setCount] = useState(60);
  const [rightGap, setRightGap] = useState(0);
  const [pending, setPending] = useState<Anchor[]>([]);

  const geom = buildGeom(candles, count, rightGap, Math.max(width, 1), height);

  // Live snapshot for gesture handlers (avoids stale closures on continuous gestures).
  const ref = useRef({ geom, candles, count, rightGap, tool, drawings, selectedId, symbol, pending });
  ref.current = { geom, candles, count, rightGap, tool, drawings, selectedId, symbol, pending };

  // Touch handling uses React Native's built-in PanResponder (pure JS, runs on
  // the JS thread) rather than react-native-gesture-handler — no Reanimated /
  // worklets involved, so it can't trigger a native gesture/worklet crash.
  const grant = useRef<{ x: number; y: number } | null>(null);
  const panStart = useRef<number | null>(null);
  const pinchStart = useRef<{ dist: number; count: number } | null>(null);
  const dragHandle = useRef<{ id: string; part: HandlePart } | null>(null);
  const moved = useRef(false);

  // A discrete tap (no drag, no pinch): select a drawing or place a draw point.
  const handleTap = (x: number, y: number) => {
    const r = ref.current;
    const g = r.geom;
    if (r.tool === 'move') {
      let bestId: string | null = null;
      let best = SELECT_HIT;
      for (const d of r.drawings) {
        const dist = distToDrawing(d, x, y, g);
        if (dist < best) {
          best = dist;
          bestId = d.id;
        }
      }
      select(bestId);
      return;
    }
    const pt: Anchor = { time: g.timeOf(x), price: g.priceOf(y) };
    if (r.tool === 'hline') {
      const d: Drawing = { id: drawId(), kind: 'hline', price: pt.price };
      add(r.symbol, d);
      select(d.id);
      setTool('move');
      return;
    }
    const need = r.tool === 'trend' ? 2 : 3;
    const pts = [...r.pending, pt];
    if (pts.length < need) {
      setPending(pts);
      return;
    }
    let d: Drawing;
    if (r.tool === 'trend') {
      d = { id: drawId(), kind: 'trend', a: pts[0], b: pts[1] };
    } else {
      const offset = pts[2].price - linePriceAt(pts[0], pts[1], pts[2].time);
      d = { id: drawId(), kind: 'channel', a: pts[0], b: pts[1], offset };
    }
    add(r.symbol, d);
    select(d.id);
    setPending([]);
    setTool('move');
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      // Don't let a parent ScrollView steal an in-progress chart gesture.
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: (e: GestureResponderEvent) => {
        const r = ref.current;
        const { locationX, locationY, touches } = e.nativeEvent;
        grant.current = { x: locationX, y: locationY };
        moved.current = false;
        panStart.current = null;
        pinchStart.current = null;
        dragHandle.current = null;
        if (touches.length >= 2) {
          pinchStart.current = { dist: touchDist(touches), count: r.count };
          return;
        }
        if (r.tool !== 'move') return;
        if (r.selectedId) {
          const d = r.drawings.find((x) => x.id === r.selectedId);
          if (d) {
            for (const hnd of handlesOf(d, r.geom)) {
              if (Math.hypot(locationX - hnd.x, locationY - hnd.y) <= HANDLE_HIT) {
                dragHandle.current = { id: d.id, part: hnd.part };
                return;
              }
            }
          }
        }
        panStart.current = r.rightGap;
      },
      onPanResponderMove: (e: GestureResponderEvent, g: PanResponderGestureState) => {
        const r = ref.current;
        const touches = e.nativeEvent.touches;
        if (Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6) moved.current = true;

        // pinch — zoom by the ratio of start/current finger spread
        if (touches.length >= 2) {
          if (!pinchStart.current) pinchStart.current = { dist: touchDist(touches), count: r.count };
          const dist = touchDist(touches);
          if (pinchStart.current.dist > 0 && dist > 0) {
            const next = Math.round(pinchStart.current.count * (pinchStart.current.dist / dist));
            setCount(clamp(next, MIN_VIEW, Math.min(MAX_VIEW, r.candles.length || MIN_VIEW)));
          }
          return;
        }

        // drag a selected drawing's handle
        if (dragHandle.current && grant.current) {
          const d = r.drawings.find((x) => x.id === dragHandle.current!.id);
          if (d) {
            const lx = grant.current.x + g.dx;
            const ly = grant.current.y + g.dy;
            replace(r.symbol, moveHandle(d, dragHandle.current.part, r.geom.timeOf(lx), r.geom.priceOf(ly)));
          }
          return;
        }

        // pan time
        if (r.tool === 'move' && panStart.current != null) {
          const maxGap = Math.max(0, r.candles.length - r.geom.count);
          const next = panStart.current + Math.round(g.dx / (r.geom.slot || 1));
          setRightGap(clamp(next, 0, maxGap));
        }
      },
      onPanResponderRelease: (_e: GestureResponderEvent, g: PanResponderGestureState) => {
        const wasPinch = !!pinchStart.current;
        const isTap = !moved.current && !wasPinch && Math.abs(g.dx) < 8 && Math.abs(g.dy) < 8;
        if (isTap && grant.current) handleTap(grant.current.x, grant.current.y);
        panStart.current = null;
        dragHandle.current = null;
        pinchStart.current = null;
      },
      onPanResponderTerminate: () => {
        panStart.current = null;
        dragHandle.current = null;
        pinchStart.current = null;
      },
    }),
  ).current;

  const { visible, slot, xOf, yOf } = geom;
  const lastClose = visible.length ? num(visible[visible.length - 1].close) : 0;
  const bodyW = fin(Math.max(2, slot * 0.6), 2);

  // Time-axis ticks: a handful of evenly-spaced labels across the visible candles.
  // Show dates once the window spans more than ~3 days, otherwise HH:MM.
  const axisTicks: { x: number; label: string }[] = [];
  if (visible.length > 1) {
    const spanMs = toMs(num(visible[visible.length - 1].time)) - toMs(num(visible[0].time));
    const dateMode = spanMs > 3 * 86400 * 1000;
    const ticks = 4;
    for (let i = 0; i < ticks; i++) {
      const idx = Math.min(visible.length - 1, Math.floor(((i + 0.5) / ticks) * visible.length));
      const c = visible[idx];
      axisTicks.push({ x: clamp(xOf(c.time), 16, width - 16), label: fmtAxisTime(num(c.time), dateMode) });
    }
  }

  return (
    <View>
      {/* toolbar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm }}>
        {TOOLS.map((t) => (
          <ToolBtn
            key={t.key}
            icon={t.icon}
            active={tool === t.key}
            onPress={() => {
              setTool(tool === t.key ? 'move' : t.key);
              setPending([]);
            }}
          />
        ))}
        <View style={{ flex: 1 }} />
        {selectedId ? <ToolBtn icon="trash" danger onPress={() => remove(symbol, selectedId)} /> : null}
        {drawings.length ? <ToolBtn icon="layers-outline" onPress={() => clear(symbol)} /> : null}
      </View>

      <View style={{ width, height }} {...responder.panHandlers}>
          {width > 0 ? (
            <Svg width={width} height={height}>
              {/* candles */}
              {visible.map((c, i) => {
                const x = xOf(c.time);
                const up = c.close >= c.open;
                const col = up ? colors.up : colors.down;
                const yO = yOf(c.open);
                const yC = yOf(c.close);
                return (
                  <Rect
                    key={i}
                    // wick drawn separately below via Line for crispness
                    x={x - bodyW / 2}
                    y={Math.min(yO, yC)}
                    width={bodyW}
                    height={Math.max(1.5, Math.abs(yC - yO))}
                    fill={col}
                    rx={1}
                  />
                );
              })}
              {visible.map((c, i) => {
                const x = xOf(c.time);
                const up = c.close >= c.open;
                return (
                  <Line
                    key={`w${i}`}
                    x1={x}
                    y1={yOf(c.high)}
                    x2={x}
                    y2={yOf(c.low)}
                    stroke={up ? colors.up : colors.down}
                    strokeWidth={1.2}
                  />
                );
              })}

              {/* last price guide */}
              {visible.length ? (
                <Line
                  x1={0}
                  y1={yOf(lastClose)}
                  x2={width}
                  y2={yOf(lastClose)}
                  stroke={colors.faint}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  opacity={0.5}
                />
              ) : null}

              {/* drawings */}
              {drawings.map((d) => (
                <DrawingShape key={d.id} d={d} g={geom} selected={d.id === selectedId} />
              ))}

              {/* in-progress points */}
              {pending.map((p, i) => (
                <Circle key={`p${i}`} cx={xOf(p.time)} cy={yOf(p.price)} r={5} fill={colors.primary} />
              ))}

              {/* time axis */}
              {axisTicks.map((t, i) => (
                <SvgText
                  key={`t${i}`}
                  x={t.x}
                  y={height - 4}
                  fill={colors.faint}
                  fontSize={9}
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {t.label}
                </SvgText>
              ))}
            </Svg>
          ) : null}
        </View>
    </View>
  );
}

function DrawingShape({ d, g, selected }: { d: Drawing; g: Geom; selected: boolean }) {
  const stroke = selected ? colors.primary : colors.gold;
  const handles = selected ? handlesOf(d, g) : [];
  const dots = handles.map((h, i) => (
    <Circle key={`h${i}`} cx={h.x} cy={h.y} r={6} fill={colors.surface} stroke={colors.primary} strokeWidth={2} />
  ));

  if (d.kind === 'hline') {
    return (
      <>
        <Line x1={0} y1={g.yOf(d.price)} x2={g.width} y2={g.yOf(d.price)} stroke={stroke} strokeWidth={1.5} />
        {dots}
      </>
    );
  }

  const ax = g.xOf(d.a.time);
  const ay = g.yOf(d.a.price);
  const bx = g.xOf(d.b.time);
  const by = g.yOf(d.b.price);

  if (d.kind === 'trend') {
    return (
      <>
        <Line x1={ax} y1={ay} x2={bx} y2={by} stroke={stroke} strokeWidth={1.5} />
        {dots}
      </>
    );
  }

  const ay2 = g.yOf(d.a.price + d.offset);
  const by2 = g.yOf(d.b.price + d.offset);
  return (
    <>
      <Polygon
        points={`${ax},${ay} ${bx},${by} ${bx},${by2} ${ax},${ay2}`}
        fill={stroke}
        opacity={0.08}
      />
      <Line x1={ax} y1={ay} x2={bx} y2={by} stroke={stroke} strokeWidth={1.5} />
      <Line x1={ax} y1={ay2} x2={bx} y2={by2} stroke={stroke} strokeWidth={1.5} />
      {dots}
    </>
  );
}

function ToolBtn({
  icon,
  active,
  danger,
  onPress,
}: {
  icon: IconName;
  active?: boolean;
  danger?: boolean;
  onPress: () => void;
}) {
  const bg = danger ? colors.downTint : active ? colors.primary : colors.surfaceAlt;
  const fg = danger ? colors.down : active ? colors.white : colors.muted;
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 38,
        height: 34,
        borderRadius: radius.md,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={icon} size={18} color={fg} />
    </Pressable>
  );
}

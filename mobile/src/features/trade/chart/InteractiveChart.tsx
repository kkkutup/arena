import { useRef, useState } from 'react';
import { View, Pressable } from 'react-native';
import Svg, { Rect, Line, Circle, Polygon } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Icon } from '@/ui';
import type { IconName } from '@/ui/Icon';
import type { Candle } from '@/features/trade/usePriceEngine';
import { colors, radius, spacing } from '@/theme/tokens';
import { useChartTools, type ChartTool } from './useChartTools';
import { drawId, linePriceAt, type Anchor, type Drawing } from './drawings';

const PAD = 10;
const MIN_VIEW = 12;
const MAX_VIEW = 200;
const HANDLE_HIT = 26;
const SELECT_HIT = 16;

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
  const slot = width / c;
  let min = Infinity;
  let max = -Infinity;
  for (const k of visible) {
    if (k.low < min) min = k.low;
    if (k.high > max) max = k.high;
  }
  if (!isFinite(min) || !isFinite(max) || min === max) {
    min = (isFinite(min) ? min : 1) - 1;
    max = (isFinite(max) ? max : 1) + 1;
  }
  const pad = (max - min) * 0.08;
  min -= pad;
  max += pad;
  const h = height - PAD * 2;
  const t0 = visible.length ? visible[0].time : 0;
  const t1 = visible.length ? visible[visible.length - 1].time : 1;
  const span = t1 - t0 || 1;
  return {
    count: c,
    visible,
    slot,
    width,
    height,
    xOf: (time) => slot / 2 + ((time - t0) / span) * (width - slot),
    yOf: (price) => PAD + (1 - (price - min) / (max - min)) * h,
    timeOf: (x) => t0 + ((x - slot / 2) / (width - slot || 1)) * span,
    priceOf: (y) => min + (1 - (y - PAD) / h) * (max - min),
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
  const tool = useChartTools((s) => s.tool);
  const setTool = useChartTools((s) => s.setTool);
  const selectedId = useChartTools((s) => s.selectedId);
  const select = useChartTools((s) => s.select);
  const drawings = useChartTools((s) => s.bySymbol[symbol] ?? []);
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

  const panStart = useRef<number | null>(null);
  const pinchStart = useRef<number | null>(null);
  const dragHandle = useRef<{ id: string; part: HandlePart } | null>(null);

  const pan = Gesture.Pan()
    .minDistance(6)
    .runOnJS(true)
    .onBegin((e) => {
      const r = ref.current;
      dragHandle.current = null;
      panStart.current = null;
      if (r.tool !== 'move') return;
      if (r.selectedId) {
        const d = r.drawings.find((x) => x.id === r.selectedId);
        if (d) {
          for (const hnd of handlesOf(d, r.geom)) {
            if (Math.hypot(e.x - hnd.x, e.y - hnd.y) <= HANDLE_HIT) {
              dragHandle.current = { id: d.id, part: hnd.part };
              return;
            }
          }
        }
      }
      panStart.current = r.rightGap;
    })
    .onUpdate((e) => {
      const r = ref.current;
      if (dragHandle.current) {
        const d = r.drawings.find((x) => x.id === dragHandle.current!.id);
        if (d) replace(r.symbol, moveHandle(d, dragHandle.current.part, r.geom.timeOf(e.x), r.geom.priceOf(e.y)));
        return;
      }
      if (r.tool === 'move' && panStart.current != null) {
        const maxGap = Math.max(0, r.candles.length - r.geom.count);
        const next = panStart.current + Math.round(e.translationX / (r.geom.slot || 1));
        setRightGap(Math.min(Math.max(next, 0), maxGap));
      }
    })
    .onFinalize(() => {
      panStart.current = null;
      dragHandle.current = null;
    });

  const pinch = Gesture.Pinch()
    .runOnJS(true)
    .onBegin(() => {
      pinchStart.current = ref.current.count;
    })
    .onUpdate((e) => {
      if (ref.current.tool !== 'move' || pinchStart.current == null) return;
      const next = Math.round(pinchStart.current / e.scale);
      setCount(Math.min(Math.max(next, MIN_VIEW), Math.min(MAX_VIEW, ref.current.candles.length || MIN_VIEW)));
    })
    .onFinalize(() => {
      pinchStart.current = null;
    });

  const tap = Gesture.Tap()
    .maxDistance(14)
    .runOnJS(true)
    .onEnd((e, success) => {
      if (!success) return;
      const r = ref.current;
      const g = r.geom;
      if (r.tool === 'move') {
        let bestId: string | null = null;
        let best = SELECT_HIT;
        for (const d of r.drawings) {
          const dist = distToDrawing(d, e.x, e.y, g);
          if (dist < best) {
            best = dist;
            bestId = d.id;
          }
        }
        select(bestId);
        return;
      }
      const pt: Anchor = { time: g.timeOf(e.x), price: g.priceOf(e.y) };
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
    });

  const gesture = Gesture.Simultaneous(pinch, pan, tap);

  const { visible, slot, xOf, yOf } = geom;
  const lastClose = visible.length ? visible[visible.length - 1].close : 0;
  const bodyW = Math.max(2, slot * 0.6);

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

      <GestureDetector gesture={gesture}>
        <View style={{ width, height }}>
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
            </Svg>
          ) : null}
        </View>
      </GestureDetector>
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

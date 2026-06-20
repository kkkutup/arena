// Chart drawings anchored in DATA space ({time, price}) so they stay pinned to
// the chart across pan, zoom and timeframe changes.

export interface Anchor {
  time: number; // candle time (unix — seconds for live, ms for the mock feed; only relative position matters)
  price: number;
}

export type Drawing =
  | { id: string; kind: 'hline'; price: number }
  | { id: string; kind: 'trend'; a: Anchor; b: Anchor }
  | { id: string; kind: 'channel'; a: Anchor; b: Anchor; offset: number };

let seq = 0;
export const drawId = (): string => `d${Date.now()}_${++seq}`;

// Price on the a→b line at an arbitrary time (for sloped channels / hit-testing).
export function linePriceAt(a: Anchor, b: Anchor, t: number): number {
  const dt = b.time - a.time;
  if (dt === 0) return a.price;
  return a.price + (b.price - a.price) * ((t - a.time) / dt);
}

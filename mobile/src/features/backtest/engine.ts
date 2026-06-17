import { INSTRUMENTS, SEED_PRICES } from '@/mock/data';
import type { Candle } from '@/features/trade/usePriceEngine';

// A simplified backtest "challenge": a random instrument at a random moment.
// The user sees the past, sets a direction + stop-loss / take-profit, and the
// hidden future is replayed to see which level hits first.

export const PAST = 36;
export const FUTURE = 24;

export interface Scenario {
  symbol: string;
  base: string;
  label: string;
  precision: number;
  past: Candle[];
  future: Candle[];
  entry: number;
  domain: { min: number; max: number };
}

export type Direction = 'LONG' | 'SHORT';
export type Outcome = 'TP' | 'SL' | 'TIMEOUT';

export interface Result {
  outcome: Outcome;
  hitIndex: number; // index into future where it resolved
  exitPrice: number;
  pnlPct: number; // signed, for the chosen direction
  points: number;
  win: boolean;
}

function walk(start: number, n: number, vol: number, t0: number, dt: number): Candle[] {
  const arr: Candle[] = [];
  let p = start;
  let t = t0;
  for (let i = 0; i < n; i++) {
    const open = p;
    let high = p;
    let low = p;
    let close = p;
    for (let k = 0; k < 6; k++) {
      close = close * (1 + (Math.random() - 0.5) * vol * 2);
      high = Math.max(high, close);
      low = Math.min(low, close);
    }
    arr.push({ time: t, open, high, low, close });
    p = close;
    t += dt;
  }
  return arr;
}

export function makeScenario(): Scenario {
  const inst = INSTRUMENTS[Math.floor(Math.random() * INSTRUMENTS.length)];
  const seed = SEED_PRICES[inst.symbol] ?? 100;
  const start = seed * (0.9 + Math.random() * 0.2);
  const vol = 0.005 + Math.random() * 0.004;
  const dt = 3_600_000;
  const t0 = Date.now() - (PAST + FUTURE) * dt;
  const past = walk(start, PAST, vol, t0, dt);
  const entry = past[past.length - 1].close;
  const future = walk(entry, FUTURE, vol, t0 + PAST * dt, dt);

  // Fixed price domain across the whole path so the chart doesn't rescale on reveal.
  let min = Infinity;
  let max = -Infinity;
  for (const c of [...past, ...future]) {
    if (c.high > max) max = c.high;
    if (c.low < min) min = c.low;
  }
  const pad = (max - min) * 0.08;
  return {
    symbol: inst.symbol,
    base: inst.base,
    label: inst.label,
    precision: inst.pricePrecision,
    past,
    future,
    entry,
    domain: { min: min - pad, max: max + pad },
  };
}

// Walk the future; whichever of SL / TP is touched first resolves the trade.
// If both are touched in the same candle we conservatively assume SL first.
export function evaluate(s: Scenario, dir: Direction, sl: number, tp: number): Result {
  for (let i = 0; i < s.future.length; i++) {
    const c = s.future[i];
    const slHit = dir === 'LONG' ? c.low <= sl : c.high >= sl;
    const tpHit = dir === 'LONG' ? c.high >= tp : c.low <= tp;
    if (slHit) return finalize(s, dir, sl, i, 'SL');
    if (tpHit) return finalize(s, dir, tp, i, 'TP');
  }
  const last = s.future[s.future.length - 1].close;
  return finalize(s, dir, last, s.future.length - 1, 'TIMEOUT');
}

function finalize(
  s: Scenario,
  dir: Direction,
  exit: number,
  hitIndex: number,
  outcome: Outcome,
): Result {
  const pnlPct = ((dir === 'LONG' ? exit - s.entry : s.entry - exit) / s.entry) * 100;
  const win = pnlPct > 0;
  let points: number;
  if (outcome === 'TP') points = 20 + Math.round(Math.min(Math.max(pnlPct, 0), 20));
  else if (outcome === 'TIMEOUT') points = win ? 10 + Math.round(Math.min(pnlPct, 10)) : 3;
  else points = 5; // hit SL — small consolation for taking the shot
  return { outcome, hitIndex, exitPrice: exit, pnlPct, points, win };
}

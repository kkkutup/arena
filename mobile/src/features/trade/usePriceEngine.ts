import { useEffect, useRef, useState } from 'react';
import { INSTRUMENTS, SEED_PRICES } from '@/mock/data';
import { useTrade } from '@/store/trade';
import { isLiquidated } from './engine';

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

const SYMBOLS = INSTRUMENTS.map((i) => i.symbol);
const HISTORY = 48;
const TICK_MS = 700;
const TICKS_PER_CANDLE = 8;

const VOL: Record<string, number> = {
  BTCUSDT: 0.0008,
  ETHUSDT: 0.0011,
  SOLUSDT: 0.0015,
  BNBUSDT: 0.001,
  XRPUSDT: 0.0017,
};

function seedCandles(price: number, vol: number): Candle[] {
  const arr: Candle[] = [];
  let p = price * (1 - vol * HISTORY * 0.25);
  let t = Date.now() - HISTORY * TICK_MS * TICKS_PER_CANDLE;
  for (let i = 0; i < HISTORY; i++) {
    const open = p;
    let high = p;
    let low = p;
    let close = p;
    for (let k = 0; k < TICKS_PER_CANDLE; k++) {
      close = close * (1 + (Math.random() - 0.48) * vol * 2);
      high = Math.max(high, close);
      low = Math.min(low, close);
    }
    arr.push({ time: t, open, high, low, close });
    p = close;
    t += TICK_MS * TICKS_PER_CANDLE;
  }
  return arr;
}

export interface PriceEngine {
  prices: Record<string, number>;
  candles: Record<string, Candle[]>;
}

// One instance per trade screen. Mutates an internal ref each tick and forces a
// re-render so the chart, tabs, and P&L update together.
export function usePriceEngine(): PriceEngine {
  const ref = useRef<PriceEngine | null>(null);
  if (!ref.current) {
    const prices: Record<string, number> = {};
    const candles: Record<string, Candle[]> = {};
    for (const s of SYMBOLS) {
      candles[s] = seedCandles(SEED_PRICES[s], VOL[s] ?? 0.001);
      prices[s] = candles[s][candles[s].length - 1].close;
    }
    ref.current = { prices, candles };
  }

  const [, force] = useState(0);
  const tick = useRef(0);
  const settleLiquidation = useTrade((s) => s.settleLiquidation);

  useEffect(() => {
    const id = setInterval(() => {
      const { prices, candles } = ref.current!;
      tick.current += 1;
      const roll = tick.current % TICKS_PER_CANDLE === 0;

      for (const s of SYMBOLS) {
        const vol = VOL[s] ?? 0.001;
        const next = prices[s] * (1 + (Math.random() - 0.5) * vol * 2);
        prices[s] = next;
        const cs = candles[s];
        const cur = cs[cs.length - 1];
        cur.close = next;
        cur.high = Math.max(cur.high, next);
        cur.low = Math.min(cur.low, next);
        if (roll) {
          cs.push({ time: Date.now(), open: next, high: next, low: next, close: next });
          if (cs.length > HISTORY) cs.shift();
        }
      }

      for (const p of useTrade.getState().positions) {
        if (isLiquidated(p.side, p.liquidationPrice, prices[p.symbol])) {
          settleLiquidation(p.id);
        }
      }

      force((v) => v + 1);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [settleLiquidation]);

  return ref.current;
}

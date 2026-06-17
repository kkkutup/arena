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

function makeInitial(): PriceEngine {
  const prices: Record<string, number> = {};
  const candles: Record<string, Candle[]> = {};
  for (const s of SYMBOLS) {
    candles[s] = seedCandles(SEED_PRICES[s], VOL[s] ?? 0.001);
    prices[s] = candles[s][candles[s].length - 1].close;
  }
  return { prices, candles };
}

// One instance per trade screen. Each tick produces NEW object/array references
// (not in-place mutation) and stores them in state, so the chart, price, and
// live P&L all re-render — even under React's compiler memoization, which would
// otherwise serve a stale value from a ref whose identity never changes.
export function usePriceEngine(): PriceEngine {
  const dataRef = useRef<PriceEngine | null>(null);
  if (!dataRef.current) dataRef.current = makeInitial();

  const [engine, setEngine] = useState<PriceEngine>(dataRef.current);
  const tick = useRef(0);
  const settleLiquidation = useTrade((s) => s.settleLiquidation);

  useEffect(() => {
    const id = setInterval(() => {
      const prev = dataRef.current!;
      tick.current += 1;
      const roll = tick.current % TICKS_PER_CANDLE === 0;

      const prices: Record<string, number> = { ...prev.prices };
      const candles: Record<string, Candle[]> = { ...prev.candles };

      for (const s of SYMBOLS) {
        const vol = VOL[s] ?? 0.001;
        const next = prices[s] * (1 + (Math.random() - 0.5) * vol * 2);
        prices[s] = next;
        const cs = prev.candles[s].slice(); // new array reference
        const cur = { ...cs[cs.length - 1] }; // new candle reference
        cur.close = next;
        cur.high = Math.max(cur.high, next);
        cur.low = Math.min(cur.low, next);
        cs[cs.length - 1] = cur;
        if (roll) {
          cs.push({ time: Date.now(), open: next, high: next, low: next, close: next });
          if (cs.length > HISTORY) cs.shift();
        }
        candles[s] = cs;
      }

      const nextEngine: PriceEngine = { prices, candles };
      dataRef.current = nextEngine;

      // Liquidation sweep — side effect, safe here outside the render path.
      for (const p of useTrade.getState().positions) {
        if (isLiquidated(p.side, p.liquidationPrice, prices[p.symbol])) {
          settleLiquidation(p.id);
        }
      }

      setEngine(nextEngine);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [settleLiquidation]);

  return engine;
}

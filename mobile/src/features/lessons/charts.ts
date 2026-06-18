import type { ChartSpec, SimpleCandle } from './types';

const c = (o: number, h: number, l: number, cl: number): SimpleCandle => ({ o, h, l, c: cl });

const UP = '#17C283';
const DOWN = '#FF5A6A';
const PRIM = '#6C5CE7';
const GOLD = '#E0A91F';

// Named, hand-crafted chart illustrations reused across lesson teach cards.
export const CHARTS = {
  candleAnatomy: {
    candles: [c(100, 104, 99, 103), c(103, 104, 101, 102), c(102, 107, 101, 106), c(106, 108, 104, 105)],
    markers: [{ index: 2, label: 'Bull' }],
  },
  bodyWick: {
    candles: [c(100, 100.6, 99.4, 100.2), c(100.2, 107, 100, 106.5), c(106.5, 107.5, 101, 106), c(106, 109, 105.5, 108)],
    markers: [
      { index: 0, label: 'Doji' },
      { index: 2, label: 'Wick' },
    ],
  },
  uptrend: {
    candles: [
      c(100, 102, 99, 101),
      c(101, 104, 100.5, 103.5),
      c(103.5, 104, 101.5, 102.5),
      c(102.5, 107, 102, 106),
      c(106, 108, 104.5, 105.5),
      c(105.5, 110, 105, 109),
    ],
  },
  downtrend: {
    candles: [
      c(110, 111, 108, 109),
      c(109, 109.5, 106, 106.5),
      c(106.5, 107.5, 105, 107),
      c(107, 107.5, 103, 104),
      c(104, 105, 101, 102),
      c(102, 103, 98, 99),
    ],
  },
  supportResistance: {
    candles: [
      c(101, 109, 100.5, 108),
      c(108, 110, 101, 102),
      c(102, 109, 101, 108),
      c(108, 110, 101.5, 102),
      c(102, 109, 100.5, 108),
    ],
    zones: [
      { from: 0, to: 4, low: 100, high: 101.8, label: 'Support', color: UP },
      { from: 0, to: 4, low: 108.5, high: 110.5, label: 'Resistance', color: DOWN },
    ],
  },
  slTp: {
    candles: [
      c(100, 101, 99.5, 100.5),
      c(100.5, 102, 100, 101.5),
      c(101.5, 104, 101, 103),
      c(103, 105, 102.5, 104.5),
      c(104.5, 106, 104, 105.5),
    ],
    zones: [
      { from: 0, to: 4, low: 96.5, high: 98.5, label: 'Stop loss', color: DOWN },
      { from: 0, to: 4, low: 106, high: 108, label: 'Take profit', color: UP },
    ],
  },
  riskReward: {
    candles: [
      c(100, 101, 99.5, 100.5),
      c(100.5, 102, 100, 101.5),
      c(101.5, 104, 101, 103),
      c(103, 105, 102.5, 104.5),
      c(104.5, 106, 104, 105.5),
    ],
    zones: [
      { from: 0, to: 4, low: 97.5, high: 99.5, label: 'Risk 1R', color: DOWN },
      { from: 0, to: 4, low: 105.5, high: 111.5, label: 'Reward 3R', color: UP },
    ],
  },
  doji: {
    candles: [c(100, 104, 99, 103), c(103, 106, 102, 105), c(105, 107, 103, 105.2), c(105, 109, 104, 108)],
    markers: [{ index: 2, label: 'Doji' }],
  },
  hammer: {
    candles: [c(108, 109, 106, 107), c(107, 108, 105, 106), c(106, 107, 99, 106.5), c(106.5, 110, 106, 109)],
    markers: [{ index: 2, label: 'Hammer' }],
  },
  shootingStar: {
    candles: [c(100, 102, 99, 101), c(101, 103, 100, 102), c(102, 109, 101, 102.5), c(102.5, 103, 98, 99)],
    markers: [{ index: 2, label: 'Star' }],
  },
  engulfing: {
    candles: [c(104, 105, 102, 103), c(103, 104, 101, 102), c(101.5, 108, 101, 107), c(107, 109, 106, 108)],
    markers: [{ index: 2, label: 'Engulf' }],
  },
  morningStar: {
    candles: [c(106, 107, 103, 104), c(103.5, 104, 102.5, 103.2), c(103, 108, 102.5, 107.5), c(107.5, 109, 106, 108)],
    markers: [{ index: 2, label: 'Star' }],
  },
  fvg: {
    candles: [c(100, 101, 99, 100.5), c(100.5, 106, 100.5, 105.5), c(106, 107, 105, 106.5), c(106.5, 108, 106, 107)],
    zones: [{ from: 0, to: 3, low: 101, high: 105, label: 'FVG', color: PRIM }],
  },
  liquiditySweep: {
    candles: [c(102, 103, 100, 101), c(101, 102, 100, 100.5), c(100.5, 101, 95, 100), c(100, 105, 99.5, 104.5)],
    zones: [{ from: 2, to: 2, low: 95, high: 99, label: 'Sweep', color: DOWN }],
  },
  premiumDiscount: {
    candles: [c(100, 107, 100, 106), c(106, 108, 102, 103), c(103, 109, 102, 108), c(108, 110, 101, 102), c(102, 108, 100, 106)],
    zones: [
      { from: 0, to: 4, low: 105, high: 110, label: 'Premium', color: DOWN },
      { from: 0, to: 4, low: 100, high: 105, label: 'Discount', color: UP },
    ],
  },
  ote: {
    candles: [c(100, 108, 99, 107), c(107, 108, 103, 104), c(104, 105, 102, 103), c(103, 109, 102, 108)],
    zones: [{ from: 1, to: 2, low: 102, high: 104.5, label: 'OTE', color: PRIM }],
  },
  structureBreak: {
    candles: [c(100, 103, 99, 102), c(102, 105, 101, 104), c(104, 105, 102, 103), c(103, 107, 102, 106), c(106, 107, 100, 101)],
    markers: [{ index: 4, label: 'Break' }],
  },
  liquidityTypes: {
    candles: [c(101, 108, 100, 107), c(107, 108, 101, 102), c(102, 108, 101, 107), c(107, 108, 100, 101)],
    zones: [
      { from: 0, to: 3, low: 108, high: 109.5, label: 'Buy-side', color: DOWN },
      { from: 0, to: 3, low: 99.5, high: 101, label: 'Sell-side', color: UP },
    ],
  },
  doubleTop: {
    candles: [c(100, 101, 99, 100), c(100, 108, 100, 107), c(107, 108, 102, 103), c(103, 108, 102, 107), c(107, 108, 99, 100)],
    zones: [{ from: 1, to: 3, low: 107, high: 109, label: 'Double top', color: DOWN }],
  },
  headShoulders: {
    candles: [
      c(100, 105, 99, 104),
      c(104, 105, 101, 102),
      c(102, 109, 101, 108),
      c(108, 109, 103, 104),
      c(104, 106, 103, 105),
      c(105, 106, 99, 100),
    ],
    markers: [
      { index: 0, label: 'LS' },
      { index: 2, label: 'Head' },
      { index: 4, label: 'RS' },
    ],
  },
  bullFlag: {
    candles: [c(100, 108, 99, 107), c(107, 108, 105, 105.5), c(105.5, 106.5, 104, 104.5), c(104.5, 105.5, 103.5, 104), c(104, 110, 103.5, 109)],
    zones: [{ from: 1, to: 3, low: 103, high: 108.5, label: 'Flag', color: PRIM }],
  },
  spring: {
    candles: [c(100, 101, 99, 100), c(100, 101, 99, 99.5), c(99.5, 100, 95, 99), c(99, 104, 98, 103)],
    zones: [{ from: 2, to: 2, low: 95, high: 99, label: 'Spring', color: UP }],
  },
  utad: {
    candles: [c(100, 101, 99, 100), c(100, 101, 99, 100.5), c(100.5, 105, 100, 101), c(101, 102, 96, 97)],
    zones: [{ from: 2, to: 2, low: 101, high: 105, label: 'UTAD', color: DOWN }],
  },
  fomo: {
    candles: [c(100, 103, 99, 102), c(102, 106, 101, 105), c(105, 110, 104, 109), c(109, 110, 103, 104), c(104, 105, 100, 101)],
    markers: [{ index: 2, label: 'You buy' }],
  },
  waves: {
    candles: [
      c(100, 103, 99, 102),
      c(102, 103, 100, 101),
      c(101, 108, 100, 107),
      c(107, 108, 104, 105),
      c(105, 110, 104, 109),
      c(109, 110, 105, 106),
      c(106, 108, 104, 107),
      c(107, 108, 102, 103),
    ],
    markers: [
      { index: 0, label: '1' },
      { index: 2, label: '3' },
      { index: 4, label: '5' },
    ],
  },
  goldenPocket: {
    candles: [c(100, 110, 99, 109), c(109, 110, 104, 105), c(105, 106, 102, 103), c(103, 111, 102, 110)],
    zones: [{ from: 1, to: 2, low: 102.5, high: 104.5, label: '0.618', color: GOLD }],
  },
  liquidation: {
    candles: [c(104, 105, 103, 104), c(104, 104.5, 101, 102), c(102, 102.5, 98, 99), c(99, 99.5, 95, 96), c(96, 97, 93, 94)],
    zones: [{ from: 0, to: 4, low: 92, high: 95, label: 'Liquidation', color: DOWN }],
  },
  valueArea: {
    candles: [c(102, 108, 101, 107), c(107, 108, 103, 104), c(104, 109, 103, 108), c(108, 109, 102, 103), c(103, 108, 102, 107)],
    zones: [
      { from: 0, to: 4, low: 102, high: 108, label: 'Value area', color: GOLD },
      { from: 0, to: 4, low: 104, high: 106, label: 'POC', color: PRIM },
    ],
  },
  marketCycle: {
    candles: [
      c(100, 101, 99, 100),
      c(100, 101, 99, 100.5),
      c(100.5, 105, 100, 104),
      c(104, 109, 103, 108),
      c(108, 110, 107, 109),
      c(109, 110, 105, 106),
      c(106, 107, 100, 101),
    ],
    markers: [
      { index: 1, label: 'Accum' },
      { index: 3, label: 'Markup' },
      { index: 4, label: 'Distrib' },
      { index: 6, label: 'Markdown' },
    ],
  },
  abcd: {
    candles: [
      c(108, 109, 107, 107.5),
      c(107.5, 108, 103, 103.5),
      c(103.5, 104, 102, 103.8),
      c(103.8, 106, 103.5, 105.5),
      c(105.5, 106, 105, 105.8),
      c(105.8, 106, 100, 100.5),
      c(100.5, 101, 99, 100),
      c(100, 103, 99.5, 102.5),
    ],
    markers: [
      { index: 0, label: 'A' },
      { index: 2, label: 'B' },
      { index: 4, label: 'C' },
      { index: 6, label: 'D' },
    ],
  },
  xabcd: {
    candles: [
      c(95, 96, 94, 95.5),
      c(95.5, 103, 95, 102.5),
      c(102.5, 103, 101, 102),
      c(102, 103, 98, 98.5),
      c(98.5, 99, 97, 98.8),
      c(98.8, 101, 98.5, 100.5),
      c(100.5, 101, 99, 100),
      c(100, 101, 96, 96.5),
      c(96.5, 97, 95, 96),
    ],
    markers: [
      { index: 0, label: 'X' },
      { index: 2, label: 'A' },
      { index: 4, label: 'B' },
      { index: 6, label: 'C' },
      { index: 8, label: 'D' },
    ],
  },
} satisfies Record<string, ChartSpec>;

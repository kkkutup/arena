export interface Instrument {
  symbol: string;
  label: string;
  base: string;
  pricePrecision: number;
  qtyStep: number;
  maxLeverage: number;
}

// Tradable instruments. Mirrors the mobile app's list.
export const INSTRUMENTS: Instrument[] = [
  { symbol: 'BTCUSDT', label: 'BTC/USDT', base: 'BTC', pricePrecision: 2, qtyStep: 0.0001, maxLeverage: 100 },
  { symbol: 'ETHUSDT', label: 'ETH/USDT', base: 'ETH', pricePrecision: 2, qtyStep: 0.001, maxLeverage: 100 },
  { symbol: 'SOLUSDT', label: 'SOL/USDT', base: 'SOL', pricePrecision: 2, qtyStep: 0.01, maxLeverage: 75 },
  { symbol: 'BNBUSDT', label: 'BNB/USDT', base: 'BNB', pricePrecision: 2, qtyStep: 0.001, maxLeverage: 75 },
  { symbol: 'XRPUSDT', label: 'XRP/USDT', base: 'XRP', pricePrecision: 4, qtyStep: 1, maxLeverage: 50 },
];

export const SYMBOLS = INSTRUMENTS.map((i) => i.symbol);

export const bySymbol = (s: string): Instrument | undefined =>
  INSTRUMENTS.find((i) => i.symbol === s);

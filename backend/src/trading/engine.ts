// Pure CFD position math — the authoritative version the sandbox mirrors.
export type Side = 'LONG' | 'SHORT';

export const MAINTENANCE_MARGIN_RATE = 0.005;

export function marginRequired(qty: number, price: number, leverage: number): number {
  return (qty * price) / leverage;
}

export function liquidationPrice(
  side: Side,
  entry: number,
  leverage: number,
  mmr = MAINTENANCE_MARGIN_RATE,
): number {
  const move = entry * (1 / leverage - mmr);
  const liq = side === 'LONG' ? entry - move : entry + move;
  return Math.max(liq, 0);
}

export function unrealizedPnl(side: Side, qty: number, entry: number, price: number): number {
  const diff = price - entry;
  return side === 'LONG' ? diff * qty : -diff * qty;
}

export function roe(pnl: number, margin: number): number {
  return margin > 0 ? pnl / margin : 0;
}

export function isLiquidated(side: Side, liqPrice: number, price: number): boolean {
  return side === 'LONG' ? price <= liqPrice : price >= liqPrice;
}

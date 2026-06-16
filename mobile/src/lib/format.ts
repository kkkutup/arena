// Hermes-safe number formatting (no reliance on Intl).

function group(intStr: string): string {
  return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function fmtNum(n: number, decimals = 2): string {
  if (!isFinite(n)) return '—';
  const neg = n < 0;
  const [i, f] = Math.abs(n).toFixed(decimals).split('.');
  return (neg ? '-' : '') + group(i) + (decimals > 0 && f ? '.' + f : '');
}

export function fmtUsd(n: number, decimals = 0): string {
  const neg = n < 0;
  return (neg ? '-$' : '$') + fmtNum(Math.abs(n), decimals);
}

export function fmtSignedUsd(n: number, decimals = 2): string {
  return (n >= 0 ? '+$' : '-$') + fmtNum(Math.abs(n), decimals);
}

export function fmtPct(n: number): string {
  return (n >= 0 ? '+' : '') + fmtNum(n, 2) + '%';
}

export function fmtPrice(n: number, precision: number): string {
  return fmtNum(n, precision);
}

export function timeLeft(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return 'ended';
  const totalMin = Math.floor(ms / 60000);
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

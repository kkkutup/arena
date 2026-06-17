// Global ranking by XP. Mock for now: a fixed pool of rivals the user is
// ranked against; their position climbs as they earn XP (backtests, trades).
// Swaps to a backend GET /v1/ranking/global later.

export interface RankRow {
  rank: number;
  name: string;
  xp: number;
  level: number;
  isMe: boolean;
}

const NAMES = [
  'Mert', 'Zeynep', 'Deniz', 'Caner', 'Ece', 'Burak', 'Sıla', 'Kaan', 'Aslı', 'Emir',
  'Derya', 'Cem', 'Naz', 'Onur', 'İpek', 'Tolga', 'Bora', 'Selin', 'Arda', 'Yağmur',
];

// Deterministic rival pool (stable across renders): XP decays from ~2400.
const BOTS = Array.from({ length: 40 }, (_, i) => ({
  name: i < NAMES.length ? NAMES[i] : `${NAMES[i % NAMES.length]}${Math.floor(i / NAMES.length) + 1}`,
  xp: Math.round(2400 * Math.pow(0.93, i)) + ((i * 7) % 31),
}));

const level = (xp: number) => Math.floor(xp / 100) + 1;

export function globalRanking(meName: string, meXp: number): RankRow[] {
  const all = [
    ...BOTS.map((b) => ({ name: b.name, xp: b.xp, isMe: false })),
    { name: meName, xp: meXp, isMe: true },
  ];
  all.sort((a, b) => b.xp - a.xp);
  return all.map((r, i) => ({
    rank: i + 1,
    name: r.name,
    xp: r.xp,
    level: level(r.xp),
    isMe: r.isMe,
  }));
}

export function myRank(meName: string, meXp: number): { rank: number; total: number } {
  const rows = globalRanking(meName, meXp);
  const me = rows.find((r) => r.isMe)!;
  return { rank: me.rank, total: rows.length };
}

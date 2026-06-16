import type {
  Instrument,
  Competition,
  LeaderboardRow,
  Friend,
  ActivityItem,
  Division,
  Achievement,
} from '@/api/types';

export const INSTRUMENTS: Instrument[] = [
  { symbol: 'BTCUSDT', label: 'BTC/USDT', base: 'BTC', pricePrecision: 2, qtyStep: 0.0001, maxLeverage: 100 },
  { symbol: 'ETHUSDT', label: 'ETH/USDT', base: 'ETH', pricePrecision: 2, qtyStep: 0.001, maxLeverage: 100 },
  { symbol: 'SOLUSDT', label: 'SOL/USDT', base: 'SOL', pricePrecision: 2, qtyStep: 0.01, maxLeverage: 75 },
  { symbol: 'BNBUSDT', label: 'BNB/USDT', base: 'BNB', pricePrecision: 2, qtyStep: 0.001, maxLeverage: 75 },
  { symbol: 'XRPUSDT', label: 'XRP/USDT', base: 'XRP', pricePrecision: 4, qtyStep: 1, maxLeverage: 50 },
];

export const SEED_PRICES: Record<string, number> = {
  BTCUSDT: 65740,
  ETHUSDT: 1719,
  SOLUSDT: 71.3,
  BNBUSDT: 615.6,
  XRPUSDT: 1.182,
};

const now = Date.now();
const hours = (h: number) => new Date(now + h * 3600_000).toISOString();
const ago = (m: number) => new Date(now - m * 60_000).toISOString();

export const COMPETITIONS: Competition[] = [
  {
    id: 'c_friends',
    name: 'Friends Faceoff',
    type: 'PRIVATE_LEAGUE',
    instruments: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'],
    startingBalance: 100000,
    maxLeverage: 20,
    status: 'LIVE',
    startAt: ago(60 * 20),
    endAt: hours(28),
    joinCode: 'ARENA42',
    participantCount: 6,
    myRank: 2,
    myEquity: 104230,
    myReturnPct: 4.23,
  },
  {
    id: 'c_division',
    name: 'Weekly Crypto Cup',
    type: 'PUBLIC_DIVISION',
    instruments: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT'],
    startingBalance: 100000,
    maxLeverage: 10,
    status: 'LIVE',
    startAt: ago(60 * 40),
    endAt: hours(52),
    joinCode: null,
    participantCount: 128,
    myRank: 14,
    myEquity: 101820,
    myReturnPct: 1.82,
  },
  {
    id: 'c_duel',
    name: 'Duel vs ahmet',
    type: 'DUEL',
    instruments: ['BTCUSDT'],
    startingBalance: 50000,
    maxLeverage: 50,
    status: 'LIVE',
    startAt: ago(60 * 3),
    endAt: hours(3),
    joinCode: null,
    participantCount: 2,
    myRank: 1,
    myEquity: 53060,
    myReturnPct: 6.12,
  },
];

export const PUBLIC_COMPETITIONS: Competition[] = [
  {
    id: 'p_scalpers',
    name: 'Scalpers Sprint',
    type: 'PUBLIC_DIVISION',
    instruments: ['BTCUSDT', 'ETHUSDT'],
    startingBalance: 100000,
    maxLeverage: 25,
    status: 'SCHEDULED',
    startAt: hours(2),
    endAt: hours(26),
    joinCode: null,
    participantCount: 43,
  },
  {
    id: 'p_hodl',
    name: 'Weekend Warriors',
    type: 'PUBLIC_DIVISION',
    instruments: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'],
    startingBalance: 100000,
    maxLeverage: 10,
    status: 'LIVE',
    startAt: ago(60 * 90),
    endAt: hours(40),
    joinCode: null,
    participantCount: 211,
  },
];

const NAMES = ['ahmet', 'zeynep', 'can', 'elif', 'mert', 'deniz', 'burak', 'ece'];

export function leaderboardFor(competitionId: string): LeaderboardRow[] {
  const comp = [...COMPETITIONS, ...PUBLIC_COMPETITIONS].find((c) => c.id === competitionId);
  const n = Math.min(comp?.participantCount ?? 8, 12);
  const myRank = comp?.myRank ?? 0;
  const rows: LeaderboardRow[] = [];
  for (let i = 1; i <= n; i++) {
    const isMe = i === myRank;
    const ret = 9 - i * 0.9 + (isMe ? 0.1 : 0);
    rows.push({
      rank: i,
      userId: isMe ? 'me' : `u${i}`,
      username: isMe ? 'you' : NAMES[(i * 3) % NAMES.length] + (i > 8 ? i : ''),
      avatarUrl: null,
      equity: 100000 * (1 + ret / 100),
      returnPct: ret,
      isMe,
    });
  }
  return rows;
}

export const FRIENDS: Friend[] = [
  { id: 'u1', username: 'ahmet', displayName: 'Ahmet K.', avatarUrl: null, level: 6, status: 'FRIENDS', online: true },
  { id: 'u2', username: 'zeynep', displayName: 'Zeynep', avatarUrl: null, level: 9, status: 'FRIENDS', online: true },
  { id: 'u3', username: 'can', displayName: 'Can', avatarUrl: null, level: 3, status: 'FRIENDS', online: false },
  { id: 'u4', username: 'elif', displayName: 'Elif', avatarUrl: null, level: 12, status: 'FRIENDS', online: false },
  { id: 'u5', username: 'mert', displayName: 'Mert', avatarUrl: null, level: 4, status: 'PENDING_IN' },
];

export const SUGGESTED: Friend[] = [
  { id: 'u6', username: 'deniz', displayName: 'Deniz', avatarUrl: null, level: 7, status: 'NONE' },
  { id: 'u7', username: 'burak', displayName: 'Burak', avatarUrl: null, level: 2, status: 'NONE' },
  { id: 'u8', username: 'ece', displayName: 'Ece', avatarUrl: null, level: 15, status: 'NONE' },
];

export const ACTIVITY: ActivityItem[] = [
  { id: 'a1', kind: 'WIN', username: 'zeynep', avatarUrl: null, text: 'won Friends Faceoff #3', at: ago(12) },
  { id: 'a2', kind: 'PROMOTED', username: 'ahmet', avatarUrl: null, text: 'was promoted to Gold', at: ago(48) },
  { id: 'a3', kind: 'STREAK', username: 'elif', avatarUrl: null, text: 'hit a 30-day streak 🔥', at: ago(90) },
  { id: 'a4', kind: 'JOINED', username: 'can', avatarUrl: null, text: 'joined Weekly Crypto Cup', at: ago(180) },
  { id: 'a5', kind: 'LEVEL_UP', username: 'mert', avatarUrl: null, text: 'reached Level 5', at: ago(240) },
];

export const DIVISION: Division = {
  tier: 'GOLD',
  weekEndsAt: hours(3 * 24),
  promoteZone: 5,
  relegateZone: 5,
  rows: Array.from({ length: 15 }, (_, idx) => {
    const i = idx + 1;
    const isMe = i === 4;
    const ret = 14 - i * 0.8;
    return {
      rank: i,
      userId: isMe ? 'me' : `d${i}`,
      username: isMe ? 'you' : NAMES[(i * 5) % NAMES.length] + (i > 8 ? i : ''),
      avatarUrl: null,
      equity: 100000 * (1 + ret / 100),
      returnPct: ret,
      isMe,
    };
  }),
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_trade', title: 'First Blood', description: 'Open your first position', icon: 'flash', unlocked: true },
  { id: 'win_duel', title: 'Duelist', description: 'Win a 1-on-1 duel', icon: 'flame', unlocked: true },
  { id: 'streak7', title: 'On Fire', description: 'Reach a 7-day streak', icon: 'bonfire', unlocked: true },
  { id: 'gold', title: 'Gold Standard', description: 'Reach the Gold division', icon: 'trophy', unlocked: false, progress: 0.7 },
  { id: 'win10', title: 'Champion', description: 'Win 10 competitions', icon: 'ribbon', unlocked: false, progress: 0.3 },
  { id: 'diamond', title: 'Diamond Hands', description: 'Reach the Diamond division', icon: 'diamond', unlocked: false, progress: 0.1 },
];

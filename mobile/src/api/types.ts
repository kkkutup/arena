// API contracts — mirror the backend Prisma models so swapping the mock client
// for the real NestJS client later is type-safe and screen code never changes.
// See arena/backend/prisma/schema.prisma.

export type Side = 'LONG' | 'SHORT';
export type PositionStatus = 'OPEN' | 'CLOSED' | 'LIQUIDATED';
export type CompetitionType = 'PRIVATE_LEAGUE' | 'DUEL' | 'PUBLIC_DIVISION';
export type CompetitionStatus = 'SCHEDULED' | 'LIVE' | 'SETTLING' | 'FINISHED';
export type DivisionTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  country: string; // ISO-2
  email: string;
}

export interface ProfileStats {
  xp: number;
  level: number;
  streakCount: number;
  competitionsPlayed: number;
  wins: number;
  winRate: number; // 0..100
}

export interface Me extends User {
  stats: ProfileStats;
  gems: number;
}

export interface Instrument {
  symbol: string; // BTCUSDT
  label: string; // BTC/USDT
  base: string; // BTC
  pricePrecision: number;
  qtyStep: number;
  maxLeverage: number;
}

export interface Position {
  id: string;
  symbol: string;
  side: Side;
  qty: number;
  leverage: number;
  entryPrice: number;
  markPrice: number;
  margin: number;
  liquidationPrice: number;
  pnl: number;
  roe: number; // fraction, e.g. 0.25
  status: PositionStatus;
}

export interface Competition {
  id: string;
  name: string;
  type: CompetitionType;
  instruments: string[];
  startingBalance: number;
  maxLeverage: number;
  status: CompetitionStatus;
  startAt: string; // ISO
  endAt: string; // ISO
  joinCode: string | null;
  participantCount: number;
  // viewer's participation summary (if joined)
  myRank?: number;
  myEquity?: number;
  myReturnPct?: number;
}

export interface LeaderboardRow {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  equity: number;
  returnPct: number;
  isMe?: boolean;
}

export type FriendStatus = 'FRIENDS' | 'PENDING_IN' | 'PENDING_OUT' | 'NONE';

export interface Friend {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  level: number;
  status: FriendStatus;
  online?: boolean;
}

export interface Division {
  tier: DivisionTier;
  weekEndsAt: string;
  promoteZone: number; // top N promote
  relegateZone: number; // bottom N relegate
  rows: LeaderboardRow[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Ionicons name
  unlocked: boolean;
  progress?: number; // 0..1 for locked
}

export interface ActivityItem {
  id: string;
  kind: 'WIN' | 'JOINED' | 'LEVEL_UP' | 'STREAK' | 'PROMOTED';
  username: string;
  avatarUrl: string | null;
  text: string;
  at: string; // ISO
}

import type {
  Competition,
  CreateInput,
  LeaderboardRow,
  Friend,
  ActivityItem,
  Instrument,
  Division,
  Achievement,
  Candle,
  CompetitionAccount,
  OpenPositionInput,
  RankingMetric,
  RankingResponse,
} from './types';
import * as mock from '@/mock/data';

// The single client interface every screen depends on. `mockClient` backs it
// now; an `httpClient` hitting the NestJS API drops in later with no screen
// changes.
export interface ApiClient {
  getCompetitions(): Promise<Competition[]>;
  getPublicCompetitions(): Promise<Competition[]>;
  getCompetition(id: string): Promise<Competition | null>;
  getLeaderboard(competitionId: string): Promise<LeaderboardRow[]>;
  createCompetition(input: CreateInput): Promise<Competition>;
  joinCompetition(id: string): Promise<Competition>;
  joinByCode(code: string): Promise<Competition>;
  getActivity(): Promise<ActivityItem[]>;
  getFriends(): Promise<Friend[]>;
  getSuggestedFriends(): Promise<Friend[]>;
  getInstruments(): Promise<Instrument[]>;
  getDivision(): Promise<Division>;
  getAchievements(): Promise<Achievement[]>;
  // market + in-competition trading
  getPrices(): Promise<{ prices: Record<string, number>; updatedAt: number }>;
  getCandles(symbol: string, interval?: string, limit?: number): Promise<Candle[]>;
  getCompetitionAccount(id: string): Promise<CompetitionAccount>;
  openPosition(id: string, input: OpenPositionInput): Promise<CompetitionAccount>;
  closePosition(id: string, posId: string): Promise<CompetitionAccount>;
  // social + ranking
  searchFriends(q: string): Promise<Friend[]>;
  sendFriendRequest(userId: string): Promise<Friend[]>;
  acceptFriend(userId: string): Promise<Friend[]>;
  removeFriend(userId: string): Promise<Friend[]>;
  getRanking(metric: RankingMetric): Promise<RankingResponse>;
  addXp(amount: number): Promise<void>;
}

const delay = (ms = 220) => new Promise<void>((r) => setTimeout(r, ms));

function fakeCode(): string {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += A[Math.floor(Math.random() * A.length)];
  return s;
}

export const mockClient: ApiClient = {
  async getCompetitions() {
    await delay();
    return mock.COMPETITIONS;
  },
  async getPublicCompetitions() {
    await delay();
    return mock.PUBLIC_COMPETITIONS;
  },
  async getCompetition(id) {
    await delay();
    return [...mock.COMPETITIONS, ...mock.PUBLIC_COMPETITIONS].find((c) => c.id === id) ?? null;
  },
  async getLeaderboard(id) {
    await delay();
    return mock.leaderboardFor(id);
  },
  async createCompetition(input) {
    await delay();
    const now = Date.now();
    return {
      id: `uc_${now}`,
      name: input.name.trim(),
      type: input.type,
      instruments: input.instruments,
      startingBalance: input.startingBalance,
      maxLeverage: input.maxLeverage,
      status: 'LIVE',
      startAt: new Date(now).toISOString(),
      endAt: new Date(now + input.durationHours * 3_600_000).toISOString(),
      joinCode: fakeCode(),
      participantCount: 1,
      myRank: 1,
      myEquity: input.startingBalance,
      myReturnPct: 0,
    };
  },
  async joinCompetition(id) {
    await delay();
    const c = [...mock.COMPETITIONS, ...mock.PUBLIC_COMPETITIONS].find((x) => x.id === id);
    const start = c?.startingBalance ?? 100_000;
    const count = (c?.participantCount ?? 1) + 1;
    return {
      id,
      name: c?.name ?? 'Competition',
      type: c?.type ?? 'PUBLIC_DIVISION',
      instruments: c?.instruments ?? ['BTCUSDT'],
      startingBalance: start,
      maxLeverage: c?.maxLeverage ?? 20,
      status: 'LIVE',
      startAt: c?.startAt ?? new Date().toISOString(),
      endAt: c?.endAt ?? new Date(Date.now() + 72 * 3_600_000).toISOString(),
      joinCode: c?.joinCode ?? null,
      participantCount: count,
      myRank: count,
      myEquity: start,
      myReturnPct: 0,
    };
  },
  async joinByCode(code) {
    await delay();
    const now = Date.now();
    return {
      id: `uc_${now}`,
      name: 'Friends League',
      type: 'PRIVATE_LEAGUE',
      instruments: ['BTCUSDT', 'ETHUSDT'],
      startingBalance: 100_000,
      maxLeverage: 20,
      status: 'LIVE',
      startAt: new Date(now).toISOString(),
      endAt: new Date(now + 72 * 3_600_000).toISOString(),
      joinCode: code.toUpperCase(),
      participantCount: 2,
      myRank: 2,
      myEquity: 100_000,
      myReturnPct: 0,
    };
  },
  async getActivity() {
    await delay();
    return mock.ACTIVITY;
  },
  async getFriends() {
    await delay();
    return mock.FRIENDS;
  },
  async getSuggestedFriends() {
    await delay();
    return mock.SUGGESTED;
  },
  async getInstruments() {
    await delay(0);
    return mock.INSTRUMENTS;
  },
  async getDivision() {
    await delay();
    return mock.DIVISION;
  },
  async getAchievements() {
    await delay();
    return mock.ACHIEVEMENTS;
  },
  async getPrices() {
    await delay(0);
    return { prices: { ...mock.SEED_PRICES }, updatedAt: Date.now() };
  },
  async getCandles() {
    await delay();
    return [];
  },
  async getCompetitionAccount(id) {
    await delay();
    return {
      competitionId: id,
      cashBalance: 100_000,
      equity: 100_000,
      usedMargin: 0,
      freeMargin: 100_000,
      startingBalance: 100_000,
      totalPnl: 0,
      positions: [],
    };
  },
  async openPosition(id) {
    return this.getCompetitionAccount(id);
  },
  async closePosition(id) {
    return this.getCompetitionAccount(id);
  },
  async searchFriends(q) {
    await delay();
    const t = q.trim().toLowerCase();
    return mock.SUGGESTED.filter(
      (f) => f.username.toLowerCase().includes(t) || f.displayName.toLowerCase().includes(t),
    );
  },
  async sendFriendRequest() {
    await delay();
    return mock.FRIENDS;
  },
  async acceptFriend() {
    await delay();
    return mock.FRIENDS;
  },
  async removeFriend() {
    await delay();
    return mock.FRIENDS;
  },
  async getRanking(metric) {
    await delay();
    const pool = [...mock.FRIENDS, ...mock.SUGGESTED];
    const rows = pool.slice(0, 20).map((f, i) => ({
      rank: i + 1,
      userId: f.id,
      username: f.username,
      displayName: f.displayName,
      avatarUrl: f.avatarUrl,
      xp: (20 - i) * 120,
      level: f.level,
      wins: Math.max(0, 5 - i),
      isMe: false,
    }));
    return { metric, rows, me: null };
  },
  async addXp() {
    await delay(0);
  },
};

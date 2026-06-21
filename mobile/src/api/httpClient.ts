import type {
  Competition,
  LeaderboardRow,
  Instrument,
  Candle,
  CompetitionAccount,
  Friend,
  RankingResponse,
  GlobalRound,
} from './types';
import { mockClient, type ApiClient } from './client';
import { authedFetch, apiFetch } from './http';

// Real client against the NestJS backend. Only the competition + leaderboard
// endpoints exist server-side today; everything else (friends, activity,
// division, achievements, instruments) falls back to the mock until its
// backend lands — so no screen breaks.
export const httpClient: ApiClient = {
  ...mockClient,

  async getCompetitions() {
    const d = await authedFetch<{ competitions: Competition[] }>('/competitions');
    return d.competitions;
  },

  async getPublicCompetitions() {
    const d = await authedFetch<{ competitions: Competition[] }>('/competitions/public');
    return d.competitions;
  },

  async getCompetition(id) {
    const res = await apiFetch(`/competitions/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    return (await res.json()) as Competition;
  },

  async getLeaderboard(id) {
    const d = await authedFetch<{ leaderboard: LeaderboardRow[] }>(`/competitions/${id}/leaderboard`);
    return d.leaderboard;
  },

  async createCompetition(input) {
    // Body must contain ONLY the DTO fields (backend ValidationPipe is
    // forbidNonWhitelisted).
    return authedFetch<Competition>('/competitions', {
      method: 'POST',
      body: JSON.stringify({
        name: input.name.trim(),
        type: input.type,
        instruments: input.instruments,
        startingBalance: input.startingBalance,
        maxLeverage: input.maxLeverage,
        durationHours: input.durationHours,
      }),
    });
  },

  async joinCompetition(id) {
    return authedFetch<Competition>(`/competitions/${id}/join`, { method: 'POST' });
  },

  async getGlobalRound() {
    return authedFetch<GlobalRound>('/competitions/global');
  },

  async joinByCode(code) {
    return authedFetch<Competition>('/competitions/join', {
      method: 'POST',
      body: JSON.stringify({ code: code.trim().toUpperCase() }),
    });
  },

  async getInstruments() {
    const d = await authedFetch<{ instruments: Instrument[] }>('/market/instruments');
    return d.instruments;
  },

  async getPrices() {
    return authedFetch<{ prices: Record<string, number>; updatedAt: number }>('/market/prices');
  },

  async getCandles(symbol, interval = '1m', limit = 200) {
    const d = await authedFetch<{ candles: Candle[] }>(
      `/market/candles?symbol=${symbol}&interval=${interval}&limit=${limit}`,
    );
    return d.candles;
  },

  async getCompetitionAccount(id) {
    return authedFetch<CompetitionAccount>(`/competitions/${id}/positions`);
  },

  async openPosition(id, input) {
    return authedFetch<CompetitionAccount>(`/competitions/${id}/positions`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async closePosition(id, posId) {
    return authedFetch<CompetitionAccount>(`/competitions/${id}/positions/${posId}/close`, {
      method: 'POST',
    });
  },

  async getFriends() {
    const d = await authedFetch<{ friends: Friend[] }>('/friends');
    return d.friends;
  },

  async getSuggestedFriends() {
    const d = await authedFetch<{ friends: Friend[] }>('/friends/suggested');
    return d.friends;
  },

  async searchFriends(q) {
    const d = await authedFetch<{ friends: Friend[] }>(`/friends/search?q=${encodeURIComponent(q)}`);
    return d.friends;
  },

  async sendFriendRequest(userId) {
    const d = await authedFetch<{ friends: Friend[] }>('/friends/request', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    return d.friends;
  },

  async acceptFriend(userId) {
    const d = await authedFetch<{ friends: Friend[] }>(`/friends/${userId}/accept`, {
      method: 'POST',
    });
    return d.friends;
  },

  async removeFriend(userId) {
    const d = await authedFetch<{ friends: Friend[] }>(`/friends/${userId}`, { method: 'DELETE' });
    return d.friends;
  },

  async getRanking(metric) {
    return authedFetch<RankingResponse>(`/ranking?metric=${metric}`);
  },

  async addXp(amount) {
    await authedFetch('/me/xp', { method: 'POST', body: JSON.stringify({ amount }) });
  },
};

import type {
  Competition,
  LeaderboardRow,
  Friend,
  ActivityItem,
  Instrument,
  Division,
  Achievement,
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
  getActivity(): Promise<ActivityItem[]>;
  getFriends(): Promise<Friend[]>;
  getSuggestedFriends(): Promise<Friend[]>;
  getInstruments(): Promise<Instrument[]>;
  getDivision(): Promise<Division>;
  getAchievements(): Promise<Achievement[]>;
}

const delay = (ms = 220) => new Promise<void>((r) => setTimeout(r, ms));

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
};

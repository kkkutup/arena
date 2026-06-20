import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import type { CreateInput, OpenPositionInput, RankingMetric } from '@/api/types';

export const useCompetitions = () =>
  useQuery({ queryKey: ['competitions'], queryFn: () => api.getCompetitions() });

// After create/join, refresh every competition view so the new membership +
// participant counts show up immediately.
function useInvalidateCompetitions() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ['competitions'] });
    void qc.invalidateQueries({ queryKey: ['public-competitions'] });
    void qc.invalidateQueries({ queryKey: ['competition'] });
    void qc.invalidateQueries({ queryKey: ['leaderboard'] });
  };
}

export const useCreateCompetition = () => {
  const invalidate = useInvalidateCompetitions();
  return useMutation({
    mutationFn: (input: CreateInput) => api.createCompetition(input),
    onSuccess: invalidate,
  });
};

export const useJoinCompetition = () => {
  const invalidate = useInvalidateCompetitions();
  return useMutation({
    mutationFn: (id: string) => api.joinCompetition(id),
    onSuccess: invalidate,
  });
};

export const useJoinByCode = () => {
  const invalidate = useInvalidateCompetitions();
  return useMutation({
    mutationFn: (code: string) => api.joinByCode(code),
    onSuccess: invalidate,
  });
};

export const usePublicCompetitions = () =>
  useQuery({ queryKey: ['public-competitions'], queryFn: () => api.getPublicCompetitions() });

export const useCompetition = (id: string, enabled = true) =>
  useQuery({
    queryKey: ['competition', id],
    queryFn: () => api.getCompetition(id),
    refetchInterval: 5000,
    enabled,
  });

export const useLeaderboard = (id: string, enabled = true) =>
  useQuery({
    queryKey: ['leaderboard', id],
    queryFn: () => api.getLeaderboard(id),
    refetchInterval: 4000,
    enabled,
  });

export const useActivity = () =>
  useQuery({ queryKey: ['activity'], queryFn: () => api.getActivity() });

export const useFriends = () =>
  useQuery({ queryKey: ['friends'], queryFn: () => api.getFriends() });

export const useSuggested = () =>
  useQuery({ queryKey: ['suggested'], queryFn: () => api.getSuggestedFriends() });

export const useInstruments = () =>
  useQuery({ queryKey: ['instruments'], queryFn: () => api.getInstruments() });

export const useDivision = () =>
  useQuery({ queryKey: ['division'], queryFn: () => api.getDivision() });

export const useAchievements = () =>
  useQuery({ queryKey: ['achievements'], queryFn: () => api.getAchievements() });

// ── Live market + in-competition trading ──────────────────────────────────

export const usePrices = (enabled = true) =>
  useQuery({
    queryKey: ['prices'],
    queryFn: () => api.getPrices(),
    refetchInterval: 1500,
    enabled,
  });

export const useCandles = (symbol: string, interval = '1m', enabled = true) =>
  useQuery({
    queryKey: ['candles', symbol, interval],
    queryFn: () => api.getCandles(symbol, interval, 300),
    refetchInterval: 8000,
    enabled: enabled && !!symbol,
  });

export const useCompetitionAccount = (id: string, enabled = true) =>
  useQuery({
    queryKey: ['account', id],
    queryFn: () => api.getCompetitionAccount(id),
    refetchInterval: 4000,
    enabled: enabled && !!id,
  });

// After a trade, push the fresh account into the cache and refresh the views
// that derive from server equity (the competition header + the shared board).
function useTradeInvalidate(id: string) {
  const qc = useQueryClient();
  return (acct: import('@/api/types').CompetitionAccount) => {
    qc.setQueryData(['account', id], acct);
    void qc.invalidateQueries({ queryKey: ['competition', id] });
    void qc.invalidateQueries({ queryKey: ['leaderboard', id] });
  };
}

export const useOpenPosition = (id: string) => {
  const onDone = useTradeInvalidate(id);
  return useMutation({
    mutationFn: (input: OpenPositionInput) => api.openPosition(id, input),
    onSuccess: onDone,
  });
};

export const useClosePosition = (id: string) => {
  const onDone = useTradeInvalidate(id);
  return useMutation({
    mutationFn: (posId: string) => api.closePosition(id, posId),
    onSuccess: onDone,
  });
};

// ── Social + ranking ──────────────────────────────────────────────────────

export const useSearchFriends = (q: string) =>
  useQuery({
    queryKey: ['friend-search', q],
    queryFn: () => api.searchFriends(q),
    enabled: q.trim().length >= 1,
  });

export const useRanking = (metric: RankingMetric) =>
  useQuery({ queryKey: ['ranking', metric], queryFn: () => api.getRanking(metric) });

function useInvalidateFriends() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ['friends'] });
    void qc.invalidateQueries({ queryKey: ['suggested'] });
    void qc.invalidateQueries({ queryKey: ['friend-search'] });
  };
}

export const useSendRequest = () => {
  const invalidate = useInvalidateFriends();
  return useMutation({ mutationFn: (userId: string) => api.sendFriendRequest(userId), onSuccess: invalidate });
};

export const useAcceptFriend = () => {
  const invalidate = useInvalidateFriends();
  return useMutation({ mutationFn: (userId: string) => api.acceptFriend(userId), onSuccess: invalidate });
};

export const useRemoveFriend = () => {
  const invalidate = useInvalidateFriends();
  return useMutation({ mutationFn: (userId: string) => api.removeFriend(userId), onSuccess: invalidate });
};

export const useSyncXp = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) => api.addXp(amount),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['ranking'] }),
  });
};

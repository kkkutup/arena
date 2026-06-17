import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';

export const useCompetitions = () =>
  useQuery({ queryKey: ['competitions'], queryFn: () => api.getCompetitions() });

export const usePublicCompetitions = () =>
  useQuery({ queryKey: ['public-competitions'], queryFn: () => api.getPublicCompetitions() });

export const useCompetition = (id: string, enabled = true) =>
  useQuery({ queryKey: ['competition', id], queryFn: () => api.getCompetition(id), enabled });

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

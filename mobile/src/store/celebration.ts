import { create } from 'zustand';
import type { IconName } from '@/ui/Icon';

export interface Celebration {
  icon: IconName;
  color: string;
  title: string;
  subtitle: string;
}

interface CelebrationState {
  current: Celebration | null;
  celebrate: (c: Celebration) => void;
  dismiss: () => void;
}

export const useCelebration = create<CelebrationState>((set) => ({
  current: null,
  celebrate: (c) => set({ current: c }),
  dismiss: () => set({ current: null }),
}));

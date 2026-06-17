import { create } from 'zustand';
import { measureTarget, type TargetRect } from '@/features/tour/registry';

export interface TourStep {
  // id of a <TourTarget> to spotlight; omit for a centered, target-less card
  target?: string;
  title: string;
  body: string;
}

interface TourState {
  active: boolean;
  steps: TourStep[];
  index: number;
  rect: TargetRect | null;
  onDone?: () => void;
  start: (steps: TourStep[], onDone?: () => void) => Promise<void>;
  next: () => Promise<void>;
  finish: () => void;
}

// Targets live inside a ScrollView and may not be laid out the instant the
// tour starts — retry a few times before giving up (then show centered).
async function locate(step: TourStep | undefined): Promise<TargetRect | null> {
  if (!step?.target) return null;
  for (let i = 0; i < 6; i++) {
    const r = await measureTarget(step.target);
    if (r) return r;
    await new Promise((res) => setTimeout(res, 60));
  }
  return null;
}

export const useTour = create<TourState>((set, get) => ({
  active: false,
  steps: [],
  index: 0,
  rect: null,
  onDone: undefined,

  start: async (steps, onDone) => {
    if (!steps.length || get().active) return;
    set({ active: true, steps, index: 0, onDone, rect: null });
    set({ rect: await locate(steps[0]) });
  },

  next: async () => {
    const { index, steps } = get();
    const ni = index + 1;
    if (ni >= steps.length) {
      get().finish();
      return;
    }
    set({ index: ni, rect: null });
    set({ rect: await locate(steps[ni]) });
  },

  finish: () => {
    const { onDone } = get();
    set({ active: false, steps: [], index: 0, rect: null, onDone: undefined });
    onDone?.();
  },
}));

import { create } from 'zustand';
import { getTrack } from '@/features/lessons/curriculum';

// Lesson progress (in-memory for now; persist with AsyncStorage at the next
// native rebuild). Completing a lesson awards XP via the session store — see
// the lesson player — which feeds the streak + global ranking.
interface LessonsState {
  completed: Record<string, true>;
  complete: (lessonId: string) => void;
  isDone: (lessonId: string) => boolean;
  trackProgress: (trackId: string) => { done: number; total: number };
  // Sequential unlock: first lesson, or the previous one is done.
  isUnlocked: (trackId: string, lessonId: string) => boolean;
  reset: () => void;
}

export const useLessons = create<LessonsState>((set, get) => ({
  completed: {},

  complete: (lessonId) => set((s) => ({ completed: { ...s.completed, [lessonId]: true } })),

  isDone: (lessonId) => !!get().completed[lessonId],

  trackProgress: (trackId) => {
    const track = getTrack(trackId);
    if (!track) return { done: 0, total: 0 };
    const done = track.lessons.filter((l) => get().completed[l.id]).length;
    return { done, total: track.lessons.length };
  },

  isUnlocked: (trackId, lessonId) => {
    const track = getTrack(trackId);
    if (!track) return false;
    const i = track.lessons.findIndex((l) => l.id === lessonId);
    if (i <= 0) return true;
    return !!get().completed[track.lessons[i - 1].id];
  },

  reset: () => set({ completed: {} }),
}));

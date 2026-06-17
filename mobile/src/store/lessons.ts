import { create } from 'zustand';
import { getTrack, TRACKS } from '@/features/lessons/curriculum';
import type { IconName } from '@/ui/Icon';

export interface NextLesson {
  trackId: string;
  lessonId: string;
  title: string;
  trackTitle: string;
  color: string;
  icon: IconName;
}

// Lesson progress (in-memory for now; persist with AsyncStorage at the next
// native rebuild). Completing a lesson awards XP via the session store — see
// the lesson player — which feeds the streak + global ranking.
interface LessonsState {
  completed: Record<string, true>;
  // Highest XP value already credited for a lesson. Replays only ever pay the
  // *delta* up to the lesson's max — so a perfect redo tops you up, but you can
  // never farm the same lesson twice.
  awarded: Record<string, number>;
  complete: (lessonId: string) => void;
  // Returns the XP to actually grant now (0 if no improvement over before).
  grantXp: (lessonId: string, value: number) => number;
  isDone: (lessonId: string) => boolean;
  trackProgress: (trackId: string) => { done: number; total: number };
  // Sequential unlock: first lesson, or the previous one is done.
  isUnlocked: (trackId: string, lessonId: string) => boolean;
  // The first not-yet-done, unlocked lesson — drives "lesson of the day".
  nextLesson: () => NextLesson | null;
  reset: () => void;
}

export const useLessons = create<LessonsState>((set, get) => ({
  completed: {},
  awarded: {},

  complete: (lessonId) => set((s) => ({ completed: { ...s.completed, [lessonId]: true } })),

  grantXp: (lessonId, value) => {
    const prev = get().awarded[lessonId] ?? 0;
    const next = Math.max(prev, value);
    const delta = next - prev;
    if (delta > 0) set((s) => ({ awarded: { ...s.awarded, [lessonId]: next } }));
    return delta;
  },

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

  nextLesson: () => {
    const completed = get().completed;
    for (const track of TRACKS) {
      for (let i = 0; i < track.lessons.length; i++) {
        const lesson = track.lessons[i];
        const unlocked = i === 0 || !!completed[track.lessons[i - 1].id];
        if (!completed[lesson.id] && unlocked) {
          return {
            trackId: track.id,
            lessonId: lesson.id,
            title: lesson.title,
            trackTitle: track.title,
            color: track.color,
            icon: track.icon,
          };
        }
      }
    }
    return null;
  },

  reset: () => set({ completed: {}, awarded: {} }),
}));

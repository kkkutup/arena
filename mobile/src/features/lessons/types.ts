import type { IconName } from '@/ui/Icon';

// ---- Mini chart spec (hand-crafted so each pattern reads clearly) ----
export interface SimpleCandle {
  o: number;
  h: number;
  l: number;
  c: number;
}
export interface ChartMarker {
  index: number; // candle index the marker band sits on
  label: string; // 'A' | 'B' | 'C' …
}
export interface ChartSpec {
  candles: SimpleCandle[];
  markers?: ChartMarker[];
}

// ---- Teaching cards (shown before the exercises) ----
export interface TeachCard {
  emoji?: string;
  heading: string;
  body: string;
  chart?: ChartSpec; // optional illustration
}

// ---- Exercises (the games / exam) ----
export type Exercise =
  | { kind: 'choice'; prompt: string; options: string[]; answer: number; explain: string }
  // prompt contains a "___" blank; options is the word bank, answer the right word
  | { kind: 'blank'; prompt: string; options: string[]; answer: number; explain: string }
  // items already in the CORRECT order (shuffled at runtime)
  | { kind: 'order'; prompt: string; items: string[]; explain: string }
  | { kind: 'match'; prompt: string; pairs: { a: string; b: string }[]; explain: string }
  // tap the right zone on a chart; options are the marker labels
  | { kind: 'chart'; prompt: string; chart: ChartSpec; options: string[]; answer: number; explain: string };

export interface Lesson {
  id: string;
  title: string;
  teach: TeachCard[];
  exercises: Exercise[];
}

export interface Track {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  color: string;
  premium: boolean;
  lessons: Lesson[];
}

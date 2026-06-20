import type { AudioPlayer } from 'expo-audio';

// Audio is a NATIVE module — absent on builds made before expo-audio was added.
// Load it defensively and no-op everywhere if it (or its native side) isn't
// present: the app stays silent but never crashes, and sound "just works" the
// moment you're on a build that includes expo-audio. (Same pattern as the
// resilient AsyncStorage wrapper.)
type AudioModule = typeof import('expo-audio');
let Audio: AudioModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Audio = require('expo-audio');
} catch {
  Audio = null;
}

// Placeholder SFX (synthesized — swap the .wav files anytime). Bundled via
// require so they ship with the JS; only playback needs the native module.
const SOURCES = {
  tap: require('../../assets/sounds/tap.wav'),
  open: require('../../assets/sounds/open.wav'),
  win: require('../../assets/sounds/win.wav'),
  lose: require('../../assets/sounds/lose.wav'),
  achievement: require('../../assets/sounds/achievement.wav'),
} as const;

export type SoundName = keyof typeof SOURCES;

let enabled = true;
let configured = false;
const players: Partial<Record<SoundName, AudioPlayer>> = {};

function ensureConfigured(): void {
  if (configured || !Audio) return;
  configured = true;
  try {
    // Let SFX play even when the ringer switch is on silent (game convention).
    void Audio.setAudioModeAsync({ playsInSilentMode: true });
  } catch {
    /* native-less build — ignore */
  }
}

export function setSoundEnabled(on: boolean): void {
  enabled = on;
}

export function isSoundEnabled(): boolean {
  return enabled;
}

// Fire-and-forget SFX. One player per sound, created lazily and rewound on replay.
export function playSound(name: SoundName): void {
  if (!enabled || !Audio) return;
  try {
    ensureConfigured();
    let p = players[name];
    if (!p) {
      p = Audio.createAudioPlayer(SOURCES[name]);
      players[name] = p;
    }
    p.seekTo(0);
    p.play();
  } catch {
    /* never let a sound effect crash the UI */
  }
}

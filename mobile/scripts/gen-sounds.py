"""Generate clean placeholder SFX (16-bit mono WAV) for Arena.

These are synthesized, royalty-free, and meant as swap-later placeholders — the
same idea as the mascot slot. Pleasant short chimes/clicks, not harsh.
"""
import math
import os
import wave
import struct
import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "sounds")
os.makedirs(OUT, exist_ok=True)


def note(freq, dur, vol=0.5, decay=0.10, harmonics=(1.0, 0.25, 0.12)):
    t = np.linspace(0, dur, int(SR * dur), False)
    sig = np.zeros_like(t)
    for h, amp in enumerate(harmonics, start=1):
        sig += amp * np.sin(2 * np.pi * freq * h * t)
    env = np.exp(-t / decay)              # plucky exponential decay
    a = max(1, int(SR * 0.004))           # tiny attack to avoid a click
    env[:a] *= np.linspace(0, 1, a)
    return sig * env * vol


def silence(dur):
    return np.zeros(int(SR * dur))


def seq(*parts):
    return np.concatenate(parts)


def save(name, sig):
    # gentle fade-out tail + normalize, then write 16-bit PCM
    tail = max(1, int(SR * 0.006))
    sig = sig.copy()
    sig[-tail:] *= np.linspace(1, 0, tail)
    peak = float(np.max(np.abs(sig))) or 1.0
    sig = (sig / peak) * 0.9
    pcm = (sig * 32767).astype("<i2")
    path = os.path.join(OUT, name)
    with wave.open(path, "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print("  wrote", os.path.basename(path), f"({len(pcm)/SR:.2f}s)")


print("generating SFX ->", os.path.normpath(OUT))

# soft UI click for buttons
save("tap.wav", note(1100, 0.05, vol=0.22, decay=0.02, harmonics=(1.0, 0.3)))

# position opened — quick rising blip
save("open.wav", seq(note(520, 0.05, vol=0.4, decay=0.05), note(780, 0.07, vol=0.4, decay=0.06)))

# profitable close — bright two-note up (cash-y)
save("win.wav", seq(note(784, 0.09, vol=0.45, decay=0.10), note(1175, 0.16, vol=0.45, decay=0.16)))

# losing close — soft two-note down (gentle, not punishing)
save("lose.wav", seq(note(440, 0.11, vol=0.32, decay=0.12, harmonics=(1.0,)),
                     note(330, 0.18, vol=0.32, decay=0.16, harmonics=(1.0,))))

# achievement / celebration — ascending arpeggio chime
save("achievement.wav", seq(
    note(523, 0.09, vol=0.42, decay=0.12),
    note(659, 0.09, vol=0.42, decay=0.12),
    note(784, 0.09, vol=0.42, decay=0.12),
    note(1046, 0.30, vol=0.5, decay=0.28),
))

print("done.")

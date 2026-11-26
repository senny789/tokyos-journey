import { game } from './engine.js';

const DREAM_MUSIC = 'dark-place-melody';
const STEP_SECONDS = 0.48;
const KENNEL_MUSIC = 'kennel-night-theme';
const KENNEL_STEP = 0.28;

// A slow D-minor melody, a low drone, and a breath of filtered wind.
export function prepareDreamMusic(): void {
    game.sound.define(DREAM_MUSIC, [
        { type: 'sine', step: STEP_SECONDS, notes: 'D5:2 - A4:2 C5:2 - F5:3 E5:2 D5:3 -:2 A4:2 C5:2 D5:3 -:2 G4:2 A4:3 -:2',
            volume: 0.21, attack: 0.16, release: 0.32, gate: 0.9,
            vibrato: { freq: 4, depth: 0.004 }, echo: { time: 0.35, feedback: 0.34, mix: 0.3 } },
        { type: 'triangle', step: STEP_SECONDS, notes: 'D3+A3:8 F3+C4:8 Bb2+F3:8 A2+E3:8',
            volume: 0.055, attack: 0.8, release: 0.8, gate: 0.95, filter: { freq: 500 } },
        { type: 'noise', noise: 'pink', step: STEP_SECONDS, notes: 'x:8 x:8 x:8 x:8',
            volume: 0.035, attack: 1.3, release: 1.3, gate: 0.95,
            filter: { type: 'bandpass', freq: 460, freqEnd: 900, sweep: 'linear', q: 0.6 } },
    ]);
    game.sound.define(KENNEL_MUSIC, [
        { type: 'triangle', step: KENNEL_STEP, notes: [
            'E4:2 - B4 A4:2 G4 -', 'F#4:2 - A4 G4:2 E4 -',
            'G4:2 - D5 B4:2 A4 -', 'F#4:2 E4:2 - B3:2 -',
            'E4:2 - B4 D5:2 B4 -', 'A4:2 - C5 B4:2 G4 -',
            'F#4:2 - A4 G4:2 F#4 -', 'E4:3 - B3:2 -:2',
        ].join(' '), volume: 0.12, attack: 0.018, release: 0.27, gate: 0.56,
            filter: { freq: 1850 }, echo: { time: 0.28, feedback: 0.2, mix: 0.22 } },
        { type: 'sine', step: KENNEL_STEP,
            notes: 'E3+B3:8 C3+G3:8 G2+D3:8 B2+F#3:8 E3+B3:8 C3+G3:8 A2+E3:8 B2+F#3:8',
            volume: 0.065, attack: 0.39, release: 0.55, gate: 0.8 },
        { type: 'triangle', step: KENNEL_STEP,
            notes: 'E2:2 -:2 B2 -:3 C3:2 -:2 G2 -:3 G2:2 -:2 D3 -:3 B2:2 -:2 F#3 -:3 E2:2 -:2 B2 -:3 C3:2 -:2 G2 -:3 A2:2 -:2 E3 -:3 B2:2 -:6',
            volume: 0.07, attack: 0.035, release: 0.26, gate: 0.7, filter: { freq: 450 } },
    ]);
}

export function startDreamMusic(): () => void {
    return game.sound.loop(DREAM_MUSIC);
}

export function startKennelMusic(): () => void {
    return game.sound.loop(KENNEL_MUSIC);
}

import { game } from './engine.js';

export const JUMP_SOUND = 'tokyo-jump';
export const WALK_PAW_SOUND = 'tokyo-walk-pawstep';
export const RUN_PAW_SOUND = 'tokyo-run-pawstep';
export const FALL_SOUND = 'tokyo-fall';
export const RESPAWN_SOUND = 'tokyo-respawn';
export const INTERACT_SOUND = 'interact-click';
export const PICKUP_SOUND = 'pickup-chime';
export const RIFT_SOUND = 'rift-chime';
export const KENNEL_LOCK_SOUND = 'kennel-locked-clank';
export const KENNEL_SWITCH_SOUND = 'kennel-switch-throw';
export const KENNEL_FAREWELL_SOUND = 'kennel-sandesh-farewell';

export function prepareActionAudio(): void {
    game.sound.defineAll({
        [JUMP_SOUND]: {
            type: 'triangle', freq: 310, freqEnd: 690, sweep: 'exponential',
            duration: 0.12, attack: 0.008, release: 0.055, volume: 0.34,
        },
        [WALK_PAW_SOUND]: {
            type: 'noise', noise: 'pink',
            filter: { type: 'lowpass', freq: 1280, freqEnd: 510, sweep: 'exponential', decay: 0.045 },
            duration: 0.062, attack: 0.003, decay: 0.022, sustain: 0.12, release: 0.024, volume: 0.22,
        },
        [RUN_PAW_SOUND]: [
            {
                type: 'noise', noise: 'pink',
                filter: { type: 'lowpass', freq: 1450, freqEnd: 450, sweep: 'exponential', decay: 0.05 },
                duration: 0.071, attack: 0.003, decay: 0.026, sustain: 0.12, release: 0.031, volume: 0.28,
            },
            {
                type: 'sine', freq: 137, freqEnd: 91, sweep: 'exponential',
                duration: 0.043, attack: 0.003, release: 0.023, volume: 0.10,
            },
        ],
        [FALL_SOUND]: {
            type: 'triangle', freq: 660, freqEnd: 132, sweep: 'exponential',
            duration: 0.37, attack: 0.018, decay: 0.09, sustain: 0.47, release: 0.12, volume: 0.29,
        },
        [RESPAWN_SOUND]: {
            type: 'sine', notes: 'G4 C5', step: 0.09,
            attack: 0.012, release: 0.048, volume: 0.23,
        },
        [INTERACT_SOUND]: {
            type: 'triangle', freq: 580, freqEnd: 390, sweep: 'exponential',
            duration: 0.08, attack: 0.005, release: 0.04, volume: 0.29,
        },
        [PICKUP_SOUND]: {
            type: 'sine', notes: 'A5 D6', step: 0.075,
            attack: 0.009, release: 0.055, volume: 0.31,
        },
        [RIFT_SOUND]: {
            type: 'triangle', notes: 'D5 A5 D6:2', step: 0.09,
            attack: 0.018, release: 0.09, volume: 0.28,
            echo: { time: 0.13, feedback: 0.24, mix: 0.18 },
        },
        [KENNEL_LOCK_SOUND]: {
            type: 'triangle', freq: 276, freqEnd: 128, duration: 0.10,
            attack: 0.003, release: 0.07, volume: 0.32,
            echo: { time: 0.12, feedback: 0.29, mix: 0.24 },
        },
        [KENNEL_SWITCH_SOUND]: [
            { type: 'noise', noise: 'pink', duration: 0.08, attack: 0.003, release: 0.05, volume: 0.39,
                filter: { type: 'bandpass', freq: 1850, freqEnd: 620, q: 1.8 } },
            { type: 'triangle', freq: 165, freqEnd: 95, duration: 0.13, attack: 0.004, release: 0.08,
                volume: 0.34 },
            { type: 'sine', notes: 'E5 B5', step: 0.09, delay: 0.09, attack: 0.012, release: 0.1,
                volume: 0.19, echo: { time: 0.16, feedback: 0.25, mix: 0.2 } },
        ],
        [KENNEL_FAREWELL_SOUND]: {
            type: 'sine', notes: 'G4 B4 E5:2', step: 0.13, attack: 0.022, release: 0.18,
            volume: 0.25, echo: { time: 0.18, feedback: 0.34, mix: 0.24 },
        },
    });
}

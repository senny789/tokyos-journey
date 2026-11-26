import { game } from './engine.js';

const BASE_BEEPS = 3;
const WORDS_PER_BEEP = 3;
const BEEP_SECONDS = 0.052;
const BEEP_INTERVAL = 0.15;
const PITCH_PATTERN = [0, 1, 0, 2] as const;
const VOICES = {
    dialogue: { pitches: [440, 494, 392], volume: 0.26 },
    dream: { pitches: [330, 392, 294], volume: 0.32 },
    'kennel-voice': { pitches: [246, 294, 220], volume: 0.29 },
} as const;

type Voice = keyof typeof VOICES;

function beepKey(voice: Voice, pitch: number): string {
    return voice + '-beep-' + (pitch + 1);
}

export function prepareDialogueAudio(): void {
    for (const voice of Object.keys(VOICES) as Voice[]) {
        const { pitches, volume } = VOICES[voice];
        for (const [pitch, freq] of pitches.entries()) {
            game.sound.define(beepKey(voice, pitch), {
                type: 'triangle', freq, duration: BEEP_SECONDS,
                attack: 0.008, release: 0.027, volume,
                echo: voice === 'kennel-voice' ? { time: 0.18, feedback: 0.31, mix: 0.27 } : undefined,
            });
        }
    }
}

export function createDialogueVoice(voice: Voice = 'dialogue') {
    let pending: ReturnType<typeof game.after>[] = [];
    function stop(): void {
        for (const timer of pending) timer.cancel();
        pending = [];
    }
    return {
        stop,
        speak(line: string, visibleSeconds: number): void {
            stop();
            const words = line.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)?.length ?? 0;
            if (words === 0) return;
            const count = BASE_BEEPS + Math.ceil(words / WORDS_PER_BEEP);
            const duration = (count - 1) * BEEP_INTERVAL + BEEP_SECONDS;
            const interval = BEEP_INTERVAL * Math.min(1, visibleSeconds / duration);
            for (let index = 0; index < count; index++) {
                const pitch = PITCH_PATTERN[index % PITCH_PATTERN.length]!;
                const play = () => game.sound.play(beepKey(voice, pitch));
                if (index === 0) play();
                else pending.push(game.after(index * interval, play));
            }
        },
    };
}

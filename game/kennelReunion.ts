import { game, type Sprite } from './engine.js';
import { KENNEL_FAREWELL_SOUND } from './actionAudio.js';
import { createDialogueVoice } from './dialogueAudio.js';
import { showDreamDialogue } from './dreamPresentation.js';
import type { spawnTokyo } from './entities/Tokyo.js';

const GREETING = 'Tokyo! You heard me!';
const FAREWELL = 'See you on the other side.';
const GREETING_SECONDS = 1.6;
const FAREWELL_SECONDS = 1.8;
const VANISH_SECONDS = 0.56;
const CAPTION_X_OFFSET = 112;
const CAPTION_Y_OFFSET = 132;
const GREETING_SPACING = 40;

export function playKennelReunion(tokyo: ReturnType<typeof spawnTokyo>, sandesh: Sprite, onReady: () => void): void {
    const { x, feet } = tokyo.data;
    const direction = x < sandesh.x ? 1 : -1;
    const voice = createDialogueVoice('kennel-voice');
    const greetingX = Math.abs(x - sandesh.x) < GREETING_SPACING
        ? sandesh.x - direction * GREETING_SPACING
        : x;
    tokyo.warpTo(greetingX, feet, direction);
    sandesh.sx = -direction * Math.abs(sandesh.sx);
    sandesh.setFrame(4);

    function say(line: string, seconds: number): void {
        showDreamDialogue('kennel-sandesh-dialogue', sandesh.x - CAPTION_X_OFFSET,
            sandesh.y - CAPTION_Y_OFFSET, line, seconds, 'Sandesh');
        voice.speak(line, seconds);
    }

    say(GREETING, GREETING_SECONDS);
    game.after(GREETING_SECONDS, () => {
        sandesh.setFrame(0);
        say(FAREWELL, FAREWELL_SECONDS);
    });
    game.after(GREETING_SECONDS + FAREWELL_SECONDS, () => {
        game.sound.play(KENNEL_FAREWELL_SOUND);
        game.particles.burst({ x: sandesh.x, y: sandesh.y + 8, count: 24, layer: 'front',
            frame: 'particle:spark', blend: 'add', angle: -90, spread: 100,
            color: ['#ffe1a3', '#a9f4ed'], speed: [35, 145], lifespan: [0.3, 0.8] });
        game.tween.to(sandesh, { alpha: 0, y: sandesh.y - 18, tint: '#b8fff1' }, {
            duration: VANISH_SECONDS, ease: 'easeInSine', onComplete: () => {
                sandesh.destroy();
                onReady();
            },
        });
    });
}

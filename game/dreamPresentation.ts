import { game } from './engine.js';
import { HOME_PROMPT_HEIGHT, spawnHomePrompt } from './homePrompt.js';

const TITLE_Y = 124;
const TITLE_RISE = 27;
const TITLE_ENTER = 0.55;
const TITLE_HOLD = 1.25;
const TITLE_EXIT = 0.48;
const PROMPT_EDGE = 16;
const PROMPT_GAP = 12;
const PROMPT_BOB = 5;
const PROMPT_PERIOD = 1.65;
const DIALOGUE_FADE = 0.16;
const DIALOGUE_DEPTH = 16;

export function showDreamDialogue(id: string, x: number, y: number, words: string, seconds: number, speaker?: string): void {
    const bubble = game.spawn({ id, texture: 'home-dialogue-box',
        x, y, sx: -1.12, sy: 1, alpha: 0, layer: 'world', z: DIALOGUE_DEPTH });
    const line = game.text(words, x, y + (speaker ? 8 : 0),
        { size: 17, font: 'sans-bold', color: '#392b26', layer: 'world', z: DIALOGUE_DEPTH + 1 });
    const name = speaker ? game.text(speaker, x, y - 13,
        { size: 12, font: 'sans-bold', color: '#704651', layer: 'world', z: DIALOGUE_DEPTH + 1 }) : null;
    const objects = name ? [bubble, line, name] : [bubble, line];
    for (const object of objects) {
        object.alpha = 0;
        game.tween.to(object, { alpha: 1 }, { duration: DIALOGUE_FADE });
    }
    game.after(seconds - DIALOGUE_FADE, () => {
        for (const object of objects) {
            game.tween.to(object, { alpha: 0 }, { duration: DIALOGUE_FADE, onComplete: () => object.destroy() });
        }
    });
}

export function showDreamTitle(name: string): void {
    const title = game.text(name.toUpperCase(), game.screen.width / 2, TITLE_Y, {
        size: 46, font: 'mono-bold', color: '#fff1d1',
        stroke: { color: '#201b31', width: 2 },
        shadow: { color: '#201b31', x: 1, y: 4 },
    });
    game.tween.from(title, { y: TITLE_Y + TITLE_RISE, alpha: 0, scale: 0.94 },
        { duration: TITLE_ENTER, ease: 'easeOutCubic' });
    game.after(TITLE_ENTER + TITLE_HOLD, () => {
        game.tween.to(title, { y: TITLE_Y - TITLE_RISE / 2, alpha: 0 },
            { duration: TITLE_EXIT, ease: 'easeInSine', onComplete: () => title.destroy() });
    });
}

export function spawnDreamPrompt(onClick: () => void) {
    const biscuit = spawnHomePrompt(onClick, 'dream-interact');
    let elapsed = 0;
    return {
        show(label: string, worldX: number, worldTop: number, dt: number): boolean {
            elapsed += dt;
            const key = game.input.gamepads.some(pad => pad.connected) ? 'Y' : 'F';
            const width = biscuit.measure(label, game.touch.visible ? 'touch' : key);
            const point = game.camera.toScreen(worldX, worldTop);
            const x = Math.max(PROMPT_EDGE,
                Math.min(point.x - width / 2, game.screen.width - width - PROMPT_EDGE));
            const bob = PROMPT_BOB * Math.sin(elapsed * 2 * Math.PI / PROMPT_PERIOD);
            const y = Math.max(PROMPT_EDGE, point.y - HOME_PROMPT_HEIGHT - PROMPT_GAP + bob);
            biscuit.place(x, y, width);
            return game.touch.visible && biscuit.secondaryTouchPressed();
        },
        hide(): void {
            elapsed = 0;
            biscuit.hide();
        },
    };
}

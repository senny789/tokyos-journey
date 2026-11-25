import { game } from './engine.js';
import { FALL_SOUND, RESPAWN_SOUND } from './actionAudio.js';
import type { spawnTokyo } from './entities/Tokyo.js';
import { TOKYO_FALL_FRAMES, TOKYO_FALL_TEXTURE } from './tokyoArt.js';

const FALL_SECONDS = 0.46;
const FALL_OFFSCREEN = 42;
const FALL_DRIFT = 27;
const FALL_ROLL = 1.14;
const SCRAMBLE_FPS = 16;
const SCRAMBLE_SWAY = 5;
const SCRAMBLE_ROLL = 0.18;
const FALL_SCALE = 0.68;
const FALL_FINAL_ALPHA = 0.46;
const FADE_DELAY = 0.18;
const RESPAWN_SECONDS = 0.32;
const FADE_COLOR = '#0d0b25';
const FADE_DEPTH = 1000;

type Tokyo = ReturnType<typeof spawnTokyo>;

function spawnCurtain(alpha: number) {
    const { width, height } = game.screen;
    return game.spawn({
        id: 'dream-fall-curtain', texture: 'white', x: width / 2, y: height / 2, width, height,
        tint: FADE_COLOR, alpha, layer: 'hud', z: FADE_DEPTH,
    });
}

export function playDreamFall(tokyo: Tokyo, restart: () => void): void {
    const { x, y, sx, sy, z } = tokyo;
    const facing = tokyo.data.facing;
    tokyo.visible = false;
    game.rig.follow(null);
    game.sound.play(FALL_SOUND);

    const fall = game.spawn({
        id: 'dream-falling-tokyo', texture: TOKYO_FALL_TEXTURE, x, y, sx, sy, z, layer: 'world',
    });
    const curtain = spawnCurtain(0);
    const drop = game.screen.height + FALL_OFFSCREEN - y;
    game.particles.burst({
        x, y, layer: 'front', frame: 'particle:spark', count: 9, angle: -90, spread: 75,
        color: ['#aa91eb', '#d8c7ff'], alpha: [0.64, 0], speed: [25, 95], lifespan: [0.22, 0.43],
    });
    let elapsed = 0;
    game.step('dream-fall-motion', dt => {
        elapsed = Math.min(FALL_SECONDS, elapsed + dt);
        const progress = elapsed / FALL_SECONDS;
        const depth = progress ** 2;
        const scale = 1 - (1 - FALL_SCALE) * depth;
        const frame = elapsed * SCRAMBLE_FPS;
        const sway = Math.sin(frame / TOKYO_FALL_FRAMES * 2 * Math.PI) * (1 - progress);
        fall.setFrame(Math.floor(frame) % TOKYO_FALL_FRAMES);
        fall.x = x + facing * (FALL_DRIFT * depth + SCRAMBLE_SWAY * sway);
        fall.y = y + drop * depth;
        fall.rot = facing * (FALL_ROLL * progress + SCRAMBLE_ROLL * sway);
        fall.sx = sx * scale;
        fall.sy = sy * scale;
        fall.alpha = 1 - (1 - FALL_FINAL_ALPHA) * depth;
        const fade = Math.max(0, (elapsed - FADE_DELAY) / (FALL_SECONDS - FADE_DELAY));
        curtain.alpha = 1 - Math.cos(fade * Math.PI / 2);
        if (elapsed === FALL_SECONDS) restart();
    });
}

export function playDreamRespawn(tokyo: Tokyo, onReady: () => void): void {
    const curtain = spawnCurtain(1);
    tokyo.data.grounded = true;
    game.sound.play(RESPAWN_SOUND);
    game.particles.burst({
        x: tokyo.x, y: tokyo.y + 16, layer: 'front', frame: 'particle:flare', count: 8,
        color: ['#e2d2ff', '#9d8be3'], blend: 'add', speed: [25, 82], lifespan: [0.28, 0.5],
    });
    let elapsed = 0;
    const reveal = game.step('dream-respawn-motion', dt => {
        elapsed = Math.min(RESPAWN_SECONDS, elapsed + dt);
        curtain.alpha = 1 - Math.sin(elapsed / RESPAWN_SECONDS * Math.PI / 2);
        if (elapsed === RESPAWN_SECONDS) {
            reveal.cancel();
            curtain.destroy();
            onReady();
        }
    });
}

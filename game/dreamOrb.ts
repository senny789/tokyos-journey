import { game } from './engine.js';
import { PICKUP_SOUND } from './actionAudio.js';
import type { spawnTokyo } from './entities/Tokyo.js';

const ORB_HEIGHT = 38;
const PICKUP_RANGE = 30;
const SURFACE_TOLERANCE = 9;
const FLOAT_DISTANCE = 5;
const FLOAT_SECONDS = 0.85;
const TOKYO_HALO_WIDTH = 152;
const TOKYO_HALO_HEIGHT = 116;
const TOKYO_HALO_Y_OFFSET = 6;
const TOKYO_HALO_TINT = '#ffc76c';
const TOKYO_HALO_ALPHA = 0.58;
const TOKYO_HALO_LOW_ALPHA = 0.42;
const TOKYO_HALO_PULSE_SECONDS = 0.8;
const TOKYO_HIGHLIGHT_TINT = '#ffe3ad';
const TOKYO_HIGHLIGHT_ALPHA = 0.23;

type Tokyo = ReturnType<typeof spawnTokyo>;

export function showTokyoOrbLight(tokyo: Tokyo, id: string): void {
    const halo = game.spawn({ id: id + '-tokyo-halo', texture: 'particle:soft',
        x: tokyo.x, y: tokyo.y + TOKYO_HALO_Y_OFFSET, width: TOKYO_HALO_WIDTH, height: TOKYO_HALO_HEIGHT,
        layer: 'world', z: tokyo.z - 1, tint: TOKYO_HALO_TINT, alpha: TOKYO_HALO_ALPHA, blend: 'add' });
    const highlight = game.spawn({ id: id + '-tokyo-highlight', frame: tokyo.frame,
        x: tokyo.x, y: tokyo.y, sx: tokyo.sx, sy: tokyo.sy,
        layer: 'world', z: tokyo.z + 1, tint: TOKYO_HIGHLIGHT_TINT, alpha: TOKYO_HIGHLIGHT_ALPHA, blend: 'add' });
    game.tween.to(halo, { alpha: TOKYO_HALO_LOW_ALPHA },
        { duration: TOKYO_HALO_PULSE_SECONDS, ease: 'easeInOutSine', yoyo: true, loop: true });
    game.step(id + '-tokyo-light', () => {
        halo.x = highlight.x = tokyo.x;
        halo.y = tokyo.y + TOKYO_HALO_Y_OFFSET;
        highlight.y = tokyo.y;
        highlight.frame = tokyo.frame;
        highlight.sx = tokyo.sx;
        highlight.sy = tokyo.sy;
        halo.visible = highlight.visible = tokyo.visible;
    }, { after: 'tokyo-visual' });
}

export function spawnDreamOrb(id: string, x: number, top: number, visible = true) {
    const y = top - ORB_HEIGHT;
    const placement = { x, y, layer: 'world' as const, visible };
    const halo = game.spawn({ ...placement, id: id + '-halo', texture: 'particle:soft',
        width: 105, tint: '#ffbf55', alpha: 0.66, blend: 'add', z: 5 });
    const orb = game.spawn({ ...placement, id, texture: 'particle:disc', width: 25, tint: '#ffc56e', z: 6 });
    const core = game.spawn({ ...placement, id: id + '-core', texture: 'particle:flare',
        width: 25, tint: '#fff1ba', blend: 'add', z: 7 });
    const floating = game.tween.to(orb, { y: y - FLOAT_DISTANCE },
        { duration: FLOAT_SECONDS, ease: 'easeInOutSine', yoyo: true, loop: true });
    const follow = game.step(id + '-glow', () => {
        halo.y = orb.y;
        core.y = orb.y - 2;
    });

    return {
        setVisible(value: boolean): void {
            if (orb.alive) halo.visible = orb.visible = core.visible = value;
        },
        tryCollect(tokyo: Tokyo, lightId = id): boolean {
            const player = tokyo.data;
            if (!orb.alive || !orb.visible || !player.grounded || Math.abs(player.x - x) > PICKUP_RANGE
                || Math.abs(player.feet - top) > SURFACE_TOLERANCE) return false;
            game.sound.play(PICKUP_SOUND);
            game.particles.burst({ x, y: orb.y, count: 14, layer: 'front', frame: 'particle:spark',
                color: ['#fff0ae', '#ffc76c'], blend: 'add', speed: [40, 135], lifespan: [0.25, 0.55] });
            follow.cancel();
            floating.stop();
            halo.destroy();
            core.destroy();
            orb.destroy();
            showTokyoOrbLight(tokyo, lightId);
            return true;
        },
    };
}

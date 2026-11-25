import { game } from '../engine.js';
import { PICKUP_SOUND, RIFT_SOUND } from '../actionAudio.js';
import { run, spawnTokyo } from '../entities/Tokyo.js';
import { getTouchOverride, isMobileView } from '../mobile.js';
import { DREAM_LEVELS, completeDreamStage, prepareDreamStage } from '../journey.js';
import { showDreamTitle, spawnDreamPrompt } from '../dreamPresentation.js';
import { playDreamWake } from '../dreamWake.js';
import { playDreamFall, playDreamRespawn } from '../dreamFall.js';
import { spawnRiftPortal } from '../riftPortal.js';
import {
    DARK_PLACE_EXIT, DARK_PLACE_LIGHT, DARK_PLACE_SECTIONS, DARK_PLACE_WIDTH, LOWEST_DARK_PLACE_LANDING,
    darkPlaceEntry, spawnDarkPlaceTerrain,
} from '../darkPlaceTerrain.js';

const GRAVITY = 1500;
const TOKYO_SCALE = 1.42;
const JUMP = { launchSpeed: 610, releaseSpeed: 440 };
const FALL_BELOW_LANDING = 90;
const EXIT_RANGE = 54;
const SURFACE_TOLERANCE = 8;
const PORTAL_HEIGHT = 132;
const LIGHT_PICKUP_RANGE = 28;
const LIGHT_HEIGHT = 38;
const LIGHT_GLOW_SIZE = 116;
const LIGHT_GLOW_CENTER_OFFSET = 8;
const LIGHT_SIZE = 26;
const TOKYO_HALO_WIDTH = 152;
const TOKYO_HALO_HEIGHT = 116;
const TOKYO_HALO_Y_OFFSET = 6;
const TOKYO_HALO_TINT = '#ffc76c';
const TOKYO_HALO_ALPHA = 0.58;
const TOKYO_HALO_LOW_ALPHA = 0.42;
const TOKYO_HALO_PULSE_SECONDS = 0.8;
const TOKYO_HIGHLIGHT_TINT = '#ffe3ad';
const TOKYO_HIGHLIGHT_ALPHA = 0.23;

let previewSection = 0;
let retryAfterFall = false;

export function openDarkPlaceSection(number: number): string {
    const index = number - 1;
    const section = DARK_PLACE_SECTIONS[index];
    if (!section) return 'Choose section 1, 2, or 3.';
    previewSection = index;
    prepareDreamStage(1);
    return 'Started ' + section.name;
}

function showTokyoLight(tokyo: ReturnType<typeof spawnTokyo>): void {
    const halo = game.spawn({ id: 'dark-place-tokyo-halo', texture: 'particle:soft',
        x: tokyo.x, y: tokyo.y + TOKYO_HALO_Y_OFFSET, width: TOKYO_HALO_WIDTH, height: TOKYO_HALO_HEIGHT,
        layer: 'world', z: tokyo.z - 1, tint: TOKYO_HALO_TINT, alpha: TOKYO_HALO_ALPHA, blend: 'add' });
    const highlight = game.spawn({ id: 'dark-place-tokyo-highlight', frame: tokyo.frame,
        x: tokyo.x, y: tokyo.y, sx: tokyo.sx, sy: tokyo.sy,
        layer: 'world', z: tokyo.z + 1, tint: TOKYO_HIGHLIGHT_TINT, alpha: TOKYO_HIGHLIGHT_ALPHA, blend: 'add' });
    game.tween.to(halo, { alpha: TOKYO_HALO_LOW_ALPHA },
        { duration: TOKYO_HALO_PULSE_SECONDS, ease: 'easeInOutSine', yoyo: true, loop: true });
    game.step('dark-place-tokyo-light', () => {
        halo.x = highlight.x = tokyo.x;
        halo.y = tokyo.y + TOKYO_HALO_Y_OFFSET;
        highlight.y = tokyo.y;
        highlight.frame = tokyo.frame;
        highlight.sx = tokyo.sx;
        highlight.sy = tokyo.sy;
        halo.visible = highlight.visible = tokyo.visible;
    }, { after: 'tokyo-visual' });
}

export const DreamStart = {
    name: 'dream-start',
    enter(): void {
        const { width, height } = game.screen;
        const entry = darkPlaceEntry(previewSection);
        let phase: 'intro' | 'playing' | 'falling' | 'respawning' =
            retryAfterFall ? 'respawning' : previewSection === 0 ? 'intro' : 'playing';
        previewSection = 0;
        retryAfterFall = false;
        run.scene = 'journey';
        const halfWidth = width / 2;
        game.camera.snap(Math.max(halfWidth, Math.min(DARK_PLACE_WIDTH - halfWidth, entry.x)), height / 2, 1);
        game.rig.bounds({ x: 0, y: 0, w: DARK_PLACE_WIDTH, h: height });
        game.background.color('#131037');
        game.physics.gravity(0, GRAVITY);
        game.touch.visible = phase === 'playing' && (getTouchOverride() ?? isMobileView());
        game.ui.pauseButton();
        game.ui.muteButton();

        spawnDarkPlaceTerrain();
        const tokyo = spawnTokyo(entry.x, entry.top, () => phase === 'playing', TOKYO_SCALE, JUMP);
        game.rig.follow(tokyo);
        const portal = spawnRiftPortal('dark-place-portal', DARK_PLACE_EXIT.x, DARK_PLACE_EXIT.top, PORTAL_HEIGHT);
        const lightY = DARK_PLACE_LIGHT.top - LIGHT_HEIGHT;
        const glow = game.spawn({ id: 'dark-place-light-glow', texture: 'dream-light',
            x: DARK_PLACE_LIGHT.x, y: lightY + LIGHT_GLOW_CENTER_OFFSET, width: LIGHT_GLOW_SIZE, layer: 'world', z: 5,
            anims: { pulse: { strip: 'dream-light', fps: 5 } } });
        glow.play('pulse');
        const light = game.spawn({ id: 'dark-place-light', texture: 'dream-star',
            x: DARK_PLACE_LIGHT.x, y: lightY, width: LIGHT_SIZE, layer: 'world', z: 6 });

        function startPlaying(): void {
            phase = 'playing';
            game.touch.visible = getTouchOverride() ?? isMobileView();
            showDreamTitle(DREAM_LEVELS[0].name);
        }
        if (phase === 'intro') {
            playDreamWake(tokyo, startPlaying);
        } else if (phase === 'respawning') {
            playDreamRespawn(tokyo, startPlaying);
        } else {
            showDreamTitle(DREAM_LEVELS[0].name);
        }
        let interactRequested = false;
        const prompt = spawnDreamPrompt(() => { interactRequested = true; });
        let wasInteract = false;
        game.step('dream-start', dt => {
            if (phase !== 'playing') {
                game.touch.visible = false;
                if (game.controls.justPressed('pause')) game.scenes.push('pause');
                return;
            }
            const { x, feet, grounded } = tokyo.data;
            // Touch buttons can set a key after the intent's pressed edge was sampled.
            const interact = game.controls.pressed('interact');
            const interactPressed = interactRequested || game.controls.justPressed('interact') || (interact && !wasInteract);
            interactRequested = false;
            wasInteract = interact;
            if (!grounded && feet > LOWEST_DARK_PLACE_LANDING + FALL_BELOW_LANDING) {
                phase = 'falling';
                prompt.hide();
                game.touch.visible = false;
                playDreamFall(tokyo, () => {
                    retryAfterFall = true;
                    game.scenes.go('dream-start');
                });
                return;
            }

            if (!portal.data.open && grounded
                && Math.abs(feet - DARK_PLACE_LIGHT.top) <= SURFACE_TOLERANCE
                && Math.abs(x - DARK_PLACE_LIGHT.x) <= LIGHT_PICKUP_RANGE) {
                portal.setOpen(true);
                game.sound.play(PICKUP_SOUND);
                glow.destroy();
                light.destroy();
                showTokyoLight(tokyo);
                game.particles.burst({ x: DARK_PLACE_LIGHT.x, y: lightY, count: 14, layer: 'front',
                    frame: 'particle:spark', color: ['#fff0ae', '#ffc76c'], blend: 'add',
                    speed: [40, 135], lifespan: [0.25, 0.55] });
            }

            const atExit = grounded && Math.abs(feet - DARK_PLACE_EXIT.top) <= SURFACE_TOLERANCE
                && Math.abs(x - DARK_PLACE_EXIT.x) <= EXIT_RANGE;
            if (atExit && portal.data.open) {
                const tapped = prompt.show('Enter the rift', portal.x, portal.y - PORTAL_HEIGHT / 2, dt);
                if (interactPressed || tapped) {
                    game.sound.play(RIFT_SOUND);
                    completeDreamStage();
                    return;
                }
            } else {
                prompt.hide();
            }
            if (game.controls.justPressed('pause')) game.scenes.push('pause');
        }, { after: 'rig-follow.camera' });
    },
    exit(): void { game.touch.visible = false; },
};

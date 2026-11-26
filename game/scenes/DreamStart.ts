import { game } from '../engine.js';
import { RIFT_SOUND } from '../actionAudio.js';
import { run, spawnTokyo } from '../entities/Tokyo.js';
import { getTouchOverride, isMobileView } from '../mobile.js';
import { DREAM_LEVELS, completeDreamStage, prepareDreamStage } from '../journey.js';
import { showDreamTitle, spawnDreamPrompt } from '../dreamPresentation.js';
import { playDreamWake } from '../dreamWake.js';
import { playDreamFall, playDreamRespawn } from '../dreamFall.js';
import { spawnRiftPortal } from '../riftPortal.js';
import { startDreamMusic } from '../dreamMusic.js';
import { spawnDreamOrb } from '../dreamOrb.js';
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

let previewSection = 0;
let retryAfterFall = false;
let stopDreamMusic: (() => void) | undefined;

export function openDarkPlaceSection(number: number): string {
    const index = number - 1;
    const section = DARK_PLACE_SECTIONS[index];
    if (!section) return 'Choose section 1, 2, or 3.';
    previewSection = index;
    prepareDreamStage(1);
    return 'Started ' + section.name;
}

export const DreamStart = {
    name: 'dream-start',
    enter(): void {
        stopDreamMusic = startDreamMusic();
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
        const orb = spawnDreamOrb('dark-place-light', DARK_PLACE_LIGHT.x, DARK_PLACE_LIGHT.top);

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

            if (orb.tryCollect(tokyo, 'dark-place')) {
                portal.setOpen(true);
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
    exit(): void { stopDreamMusic?.(); stopDreamMusic = undefined; game.touch.visible = false; },
};

import { game } from '../engine.js';
import { DREAM_SHADOW_WIDTH, DREAM_SHADOW_FOOT_OFFSET } from '../dreamArt.js';
import { run, spawnTokyo } from '../entities/Tokyo.js';
import { isMobileView, getTouchOverride } from '../mobile.js';
import { journey } from '../journey.js';

const WIDTH = 1280;
const FLOOR = 540;
const SAFE_LIGHTS = [204, 467, 730, 993, 1174];
const SAFE_RADIUS = 86;
const BUFFER_RADIUS = 120;
const ENTITY_SPEED = 194;

export const DreamStart = {
    name: 'dream-start',
    enter(): void {
        let stopped = false;
        let caughtAlready = false;
        let elapsed = 0;
        game.camera.snap(WIDTH / 2, 360, 1);
        game.background.picture('dream-dark', 'stretch');
        game.physics.gravity(0, 1500);
        game.touch.visible = getTouchOverride() ?? isMobileView();
        game.touch.button({ code: 'Touch:interact', label: 'ENTER', anchor: 'bottom-right',
            x: 320, y: 152, r: 40, tint: '#eee0ff' });
        game.ui.pauseButton();
        game.ui.muteButton();

        for (const [id, x, y, w, h] of [
            ['dream-floor', WIDTH / 2, FLOOR + 24, WIDTH, 48],
            ['dream-left-edge', 0, 360, 32, 720],
            ['dream-right-edge', WIDTH, 360, 32, 720],
        ] as const) {
            game.spawn({ id, x, y, width: w, height: h, visible: false, layer: 'world',
                body: { type: 'static', friction: 0 } });
        }

        run.scene = 'journey';
        const tokyo = spawnTokyo(120, FLOOR, () => !stopped, 1.42);
        const lights: { x: number; sprite: ReturnType<typeof game.spawn> }[] = [];
        for (let i = 0; i < SAFE_LIGHTS.length; i++) {
            const x = SAFE_LIGHTS[i];
            const sprite = game.spawn({ id: 'dark-place-light-' + (i + 1), texture: 'dream-light',
                x, y: FLOOR - 42, width: 170, height: 170, layer: 'world', z: 2, frame: i % 4 });
            lights.push({ x, sprite });
        }
        const aura = game.spawn({ id: 'dream-light-around-tokyo', texture: 'dream-shield',
            x: 120, y: FLOOR - 34, width: 120, layer: 'world', z: 9, alpha: 0.82 });
        const shadow = game.spawn({ id: 'dream-roaming-shadow', texture: 'dream-entity',
            x: 852, y: FLOOR - DREAM_SHADOW_FOOT_OFFSET, width: DREAM_SHADOW_WIDTH, layer: 'world', z: 8, frame: 0 });
        game.text('THE DARK PLACE', WIDTH / 2, 94,
            { size: 30, font: 'mono-bold', color: '#eee2ff', shadow: { color: '#171323', x: 2, y: 3 } });
        game.text('A voice calls from a little light in the distance…', WIDTH / 2, 132,
            { size: 16, font: 'mono', color: '#d4c6f2' });
        const voice = game.text('“Tokyo? I’m over here…”  —  Senny', 1051, 357,
            { size: 17, font: 'mono-bold', color: '#fff0d1',
                shadow: { color: '#3b2670', x: 2, y: 2 } });
        const objective = game.text('Find the glowing doorway.', WIDTH / 2, 615,
            { size: 18, font: 'mono-bold', color: '#f7eacc', shadow: { color: '#171323', x: 2, y: 2 } });
        const prompt = game.text('', WIDTH / 2, 675,
            { size: 14, font: 'mono-bold', color: '#f0e5ff', shadow: { color: '#171323', x: 1, y: 2 } });

        function caught(): void {
            if (caughtAlready) return;
            stopped = true;
            caughtAlready = true;
            game.ui.panel({ anchor: 'center', w: 608, h: 298, z: 30, safeArea: false, style: 'dark' });
            game.text('THE SHADOW FOUND TOKYO', WIDTH / 2, 237,
                { z: 31, size: 32, font: 'mono-bold', color: '#edbdd6' });
            game.text('The warm light will protect her next time.', WIDTH / 2, 294,
                { z: 31, size: 18, font: 'mono', color: '#f4e8d0' });
            game.ui.button({ id: 'dark-place-retry', anchor: 'center', y: 170, z: 31, h: 58,
                text: 'Try this dream again', icon: 'restart', style: 'good',
                onClick: () => game.scenes.go('dream-start') });
            game.ui.button({ id: 'dark-place-home', anchor: 'center', y: 239, z: 31, h: 50,
                text: 'Wake up at home', icon: 'home', style: 'flat',
                onClick: () => game.scenes.go('home') });
        }

        game.step('dream-start', dt => {
            if (stopped) return;
            elapsed += dt;
            const playerX = tokyo.data.x;
            const nearestLight = lights.reduce((best, light) => Math.min(best, Math.abs(playerX - light.x)), Infinity);
            const protectedNow = nearestLight <= SAFE_RADIUS;
            aura.visible = protectedNow;
            aura.x = playerX;
            aura.y = tokyo.data.feet - 34;
            aura.alpha = 0.65 + Math.sin(elapsed * 3) * 0.12;
            if (nearestLight <= BUFFER_RADIUS && Math.abs(shadow.x - playerX) < BUFFER_RADIUS + 10) {
                shadow.x = playerX < shadow.x
                    ? playerX + BUFFER_RADIUS + 10
                    : playerX - BUFFER_RADIUS - 10;
            } else {
                shadow.x += (playerX < shadow.x ? -1 : 1) * ENTITY_SPEED * dt;
            }
            shadow.x = Math.max(40, Math.min(WIDTH - 40, shadow.x));
            shadow.y = FLOOR - DREAM_SHADOW_FOOT_OFFSET + Math.sin(elapsed * 4) * 5;
            shadow.sx = playerX < shadow.x ? -1 : 1;
            shadow.setFrame(Math.floor(elapsed * 3) % 2);
            const gap = Math.abs(shadow.x - playerX);
            if (gap < 54 && !protectedNow) caught();

            const nearPortal = playerX >= 1116;
            objective.text = protectedNow ? 'The patch of light protects Tokyo.'
                : 'Move from light to light. The shadow is roaming.';
            prompt.text = nearPortal
                ? (game.touch.visible ? 'Enter the light portal' : 'F  ENTER THE LIGHT PORTAL')
                : game.touch.visible ? 'Move with the stick · Jump to dodge · Find Senny’s light'
                : '← → MOVE   ·   SPACE JUMP   ·   SHIFT RUN   ·   F INTERACT';
            if (nearPortal && game.controls.justPressed('interact')) {
                journey.stage = 2;
                journey.visitedCats = [];
                journey.puzzleStep = 0;
                game.scenes.go('journey');
            }
            voice.text = elapsed < 5 ? '“Tokyo? I’m over here…”  —  Senny' : 'SENNY’S VOICE  →';
            if (game.controls.justPressed('pause')) game.scenes.push('pause');
        }, { after: 'tokyo-visual' });
    },
    exit(): void { game.touch.visible = false; },
};

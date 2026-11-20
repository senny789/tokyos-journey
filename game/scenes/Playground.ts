import { game } from '../engine.js';
import { run, spawnTokyo } from '../entities/Tokyo.js';
import { spawnParkActivities } from '../entities/ParkActivities.js';
import { spawnParkMap } from '../parkMap.js';
import { PARK_GROUND, PARK_WIDTH, badges, currentArea, park, startPlayground } from '../playground.js';
import { addFullscreenButton, getTouchOverride, isMobileView } from '../mobile.js';

const GRAVITY = 1500;
export const Playground = {
    name: 'play',
    enter(): void {
        run.scene = 'play';
        game.camera.snap(Math.max(640, Math.min(PARK_WIDTH - 640, run.spawnX + 90)), 360, 1);
        game.touch.visible = getTouchOverride() ?? isMobileView();
        spawnParkMap(); game.physics.gravity(0, GRAVITY);
        const tokyo = spawnTokyo(run.spawnX, PARK_GROUND);
        const activities = spawnParkActivities();
        game.rig.follow(tokyo);
        game.rig.bounds({ x: 0, y: 0, w: PARK_WIDTH, h: 720 });
        game.rig.deadzone = { w: 140, h: 260 }; game.rig.smoothing = 0.12;
        game.rig.offset = { x: 90, y: -80 }; game.rig.lookAhead = 0.2;
        const shadow = game.spawn({ id: 'park-tokyo-shadow', texture: 'shadow', x: tokyo.x,
            y: PARK_GROUND - 2, layer: 'world', z: 1, alpha: 0.25 });
        const hud = game.graphics({ layer: 'hud' });
        hud.draw(ctx => {
            ctx.fillStyle = '#253c36'; ctx.fillRect(0, 0, 1280, 96); ctx.fillRect(0, 618, 1280, 102);
            ctx.fillStyle = '#d6c68b'; ctx.fillRect(0, 94, 1280, 2); ctx.fillRect(0, 618, 1280, 2);
        });
        game.text("TOKYO'S PLAYGROUND", 30, 28, { size: 25, font: 'mono-bold', align: 'left', color: '#f5e2a8' });
        const area = game.text('', 30, 65, { size: 17, font: 'mono', align: 'left', color: '#bfcfae' });
        const tally = game.text('', 640, 30, { size: 18, font: 'mono-bold', color: '#f5e2a8' });
        game.ui.pauseButton(); game.ui.muteButton();
        addFullscreenButton({ anchor: 'top-right', x: -144, y: 16 });
        game.ui.button({ id: 'park-map-button', anchor: 'top-right', x: -210, y: 16, h: 56, icon: 'map', style: 'icon',
            accessibleLabel: 'Park map and activity badges', onClick: () => game.scenes.push('parkmap') });
        game.ui.button({ id: 'day-night-button', anchor: 'top-right', x: -276, y: 16, h: 56, icon: 'moon', style: 'icon',
            accessibleLabel: 'Toggle day and night', onClick: () => { park.night = !park.night; } });
        // A real HUD action button also works on touch devices; no keyboard is required to interact.
        const act = game.ui.button({ id: 'park-interact-button', anchor: 'bottom-right', x: -28, y: -28,
            h: 54, text: 'Interact', icon: 'paw', style: 'good', onClick: () => { interactRequested = true; } });
        let interactRequested = false;
        const prompt = game.text('', 560, 645, { size: 18, font: 'mono-bold', color: '#f5e2a8' });
        const message = game.text('', 560, 678, { size: 15, font: 'mono', color: '#c6d6b6' });
        const controls = game.text('A/D move   SHIFT run   SPACE jump   DOWN crouch   E sit   F interact   M map', 640, 112,
            { size: 15, font: 'mono-bold', color: '#354c42', shadow: { color: '#eff0cb', x: 1, y: 1 } });
        game.step('playground-hud', () => {
            if (game.controls.justPressed('pause')) { game.scenes.push('pause'); return; }
            if (game.input.keyPressed('KeyM')) { game.scenes.push('parkmap'); return; }
            if (game.input.keyPressed('KeyR')) { startPlayground(); return; }
            if (game.input.keyPressed('KeyN')) park.night = !park.night;
            if (getTouchOverride() === null) game.touch.visible = isMobileView();
            area.text = currentArea(tokyo.x);
            tally.text = `TREATS ${park.treats.length}/12  |  BADGES ${badges().filter(Boolean).length}/8`;
            controls.text = game.touch.visible ? 'STICK move / down to crawl    JUMP / RUN / SIT    INTERACT to play    MAP for activities'
                : 'A/D move   SHIFT run   SPACE jump   DOWN crouch   E sit   F interact   M map';
            prompt.text = game.touch.visible ? activities.prompt().replaceAll('F:', 'Interact:').replaceAll('E:', 'Sit:').replaceAll('DOWN +', 'Crouch +') : activities.prompt();
            message.text = park.messageTime > 0 ? park.message : 'No timer. No damage. Just a very good day for a dog.';
            shadow.x = tokyo.x;
            shadow.alpha = Math.max(0, 0.25 - Math.max(0, PARK_GROUND - tokyo.data.feet) / 800);
            if (interactRequested) { interactRequested = false; activities.interact(); }
            act.ui.text = park.carrying >= 0 ? 'Play / fetch' : 'Interact';
        }, { after: 'park-interactions' });
    },
    exit(): void { game.touch.visible = false; },
};

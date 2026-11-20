import { game } from '../engine.js';
import { run, spawnTokyo, type TokyoState } from '../entities/Tokyo.js';
import { GROUND_Y, MEADOW_WIDTH, spawnMeadow } from '../meadow.js';
import { addFullscreenButton, getTouchOverride, isMobileView } from '../mobile.js';

const STATES: TokyoState[] = ['idle', 'walking', 'running', 'jumping', 'crouching', 'sitting'];

export const Play = {
    name: 'play',
    enter(): void {
        game.touch.visible = getTouchOverride() ?? isMobileView();
        spawnMeadow(); game.physics.gravity(0, 1500);
        const tokyo = spawnTokyo(run.spawnX, GROUND_Y);
        game.rig.follow(tokyo);
        game.rig.bounds({ x: 0, y: 0, w: MEADOW_WIDTH, h: 720 });
        game.rig.deadzone = { w: 160, h: 260 }; game.rig.smoothing = 0.12;
        game.rig.offset = { x: 90, y: -100 }; game.rig.lookAhead = 0.2;
        const shadow = game.spawn({ id: 'tokyo-shadow', texture: 'shadow', x: run.spawnX, y: GROUND_Y - 2,
            layer: 'world', z: 1, alpha: 0.25 });
        game.text("TOKYO'S JOURNEY", 40, 40, { size: 30, font: 'mono-bold', color: '#34483e', align: 'left' });
        game.text('01 / THE MOVEMENT MEADOW', 42, 76, { size: 16, font: 'mono', color: '#5c705b', align: 'left' });
        game.text('A golden girl. A little adventure.', 42, 104, { size: 16, font: 'mono', color: '#657760', align: 'left' });
        game.ui.pauseButton(); game.ui.muteButton();
        const fsBtn = addFullscreenButton({ anchor: 'top-right', x: -152, y: 16 });
        const footer = game.graphics({ layer: 'hud' });
        footer.draw(ctx => { ctx.fillStyle = '#253c36'; ctx.fillRect(0, 618, 1280, 102);
            ctx.fillStyle = '#c4d098'; ctx.fillRect(0, 618, 1280, 3); });
        const labels = STATES.map((state, index) => game.text(state.toUpperCase(), 290 + index * 140, 647,
            { size: 17, font: 'mono-bold', color: '#81958b', align: 'center' }));
        const hintsLabel = game.text('', 640, 690, { size: 16, font: 'mono', color: '#c3d1b2', align: 'center' });
        const telemetry = game.text('', 1228, 648, { size: 16, font: 'mono-bold', color: '#e4ca7c', align: 'right' });
        game.step('meadow-hud', () => {
            if (game.controls.justPressed('pause')) { game.scenes.push('pause'); return; }
            if (game.input.keyPressed('KeyR')) { run.spawnX = 220; game.scenes.go('play'); return; }
            if (getTouchOverride() === null) {
                const shouldShow = isMobileView();
                if (game.touch.visible !== shouldShow) game.touch.visible = shouldShow;
            }
            if (fsBtn?.alive) {
                fsBtn.ui.icon = game.commands.isFullscreen ? 'fullscreen-exit' : 'fullscreen';
            }
            labels.forEach((label, index) => { label.color = STATES[index] === tokyo.data.state ? '#f4d888' : '#81958b'; });
            hintsLabel.text = game.touch.visible
                ? 'STICK MOVE / CROUCH   •   JUMP   •   RUN   •   SIT'
                : 'A/D WALK   SHIFT RUN   SPACE JUMP   DOWN/C CROUCH   E SIT / STAND   R RESET';
            telemetry.text = `${Math.round(Math.abs(tokyo.data.vx))} px/s`;
            shadow.x = tokyo.x; shadow.y = GROUND_Y - 2;
            shadow.alpha = Math.max(0, 0.25 - Math.max(0, GROUND_Y - tokyo.data.feet) / 800);
        }, { after: 'tokyo-visual' });
    },
    exit(): void {
        game.touch.visible = false;
    },
};

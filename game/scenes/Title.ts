import { game } from '../engine.js';
import { run } from '../entities/Tokyo.js';
import { spawnScenery } from '../scenery.js';
import { addFullscreenButton, addRotateButton, isMobileView } from '../mobile.js';

export const Title = {
    name: 'title',
    enter(): void {
        game.touch.visible = false;
        spawnScenery(true);
        const fsBtn = addFullscreenButton({ anchor: 'top-right', x: -16, y: 16 });
        game.ui.button({
            id: 'settings-btn',
            anchor: 'top-right',
            x: -80,
            y: 16,
            w: 56,
            h: 56,
            style: 'icon',
            icon: 'settings',
            accessibleLabel: 'Settings',
            onClick: () => game.scenes.push('settings'),
        });
        if (isMobileView()) {
            addRotateButton({ anchor: 'top-right', x: -144, y: 16 });
        }
        game.text('A LITTLE DOG. A WIDE WORLD.', 640, 165, { size: 18, font: 'mono-bold', color: '#566952' });
        game.text("TOKYO'S JOURNEY", 640, 225, { size: 62, font: 'mono-bold', color: '#33483d',
            shadow: { color: '#eff0cb', x: 4, y: 4 } });
        game.text('A 16-bit platformer starring Tokyo, our golden girl.', 640, 285,
            { size: 19, font: 'mono', color: '#566952' });
        const tokyo = game.spawn({ id: 'title-tokyo', texture: 'tokyo', x: 640, y: 388, scale: 2.5, layer: 'world' });
        let elapsed = 0;
        game.ui.button({ anchor: 'center', y: 145, h: 62, text: 'Explore the meadow', style: 'good', icon: 'play',
            onClick: () => { run.spawnX = 220; game.scenes.go('play'); } });
        const startHint = isMobileView() ? 'TAP PLAY TO START' : 'ENTER / SPACE TO START';
        game.text(startHint, 640, 594, { size: 16, font: 'mono-bold', color: '#f7efcf',
            shadow: { color: '#493c36', x: 2, y: 2 } });
        game.text('Walk, run, leap, crouch - or take a moment to sit.', 640, 668,
            { size: 17, font: 'mono', color: '#e7dfb8' });
        game.step('title', dt => {
            elapsed += dt; tokyo.setFrame(Math.floor(elapsed * 5) % 8);
            if (fsBtn?.alive) {
                fsBtn.ui.icon = game.commands.isFullscreen ? 'fullscreen-exit' : 'fullscreen';
            }
            if (game.input.keyPressed('Space') || game.input.keyPressed('Enter')) {
                run.spawnX = 220; game.scenes.go('play');
            }
        });
    },
};

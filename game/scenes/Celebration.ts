import { game } from '../engine.js';
import { startPlayground } from '../playground.js';
import { TOKYO_ART_SCALE } from '../tokyoArt.js';
export const Celebration = {
    name: 'celebration',
    enter(): void {
        game.touch.visible = false;
        game.ui.panel({ anchor: 'center', w: 1280, h: 720, z: 20, safeArea: false, style: 'dark' });
        game.spawn({ id: 'celebration-tokyo', texture: 'tokyo', frame: 42, x: 640, y: 270,
            z: 21, scale: 3 * TOKYO_ART_SCALE, layer: 'hud' });
        game.text('THE BEST KIND OF ADVENTURE', 640, 125, { z: 21, size: 36, font: 'mono-bold', color: '#f5df96' });
        game.text('Eight badges. New friends. One very happy Tokyo.', 640, 385, { z: 21, size: 24, font: 'mono', color: '#e6edda' });
        game.ui.button({ id: 'celebrate-continue', anchor: 'center', y: 110, z: 21, h: 64, text: 'Keep playing', icon: 'paw', style: 'good', onClick: () => game.scenes.pop() });
        game.ui.button({ id: 'celebrate-new', anchor: 'center', y: 195, z: 21, h: 56, text: 'A new park day', icon: 'restart', style: 'flat', onClick: startPlayground });
        game.step('celebration', () => { if (game.input.keyPressed('Escape')) game.scenes.pop(); });
    },
};

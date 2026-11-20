import { game } from '../engine.js';
import { BADGE_NAMES, PARK_AREAS, badges, park, visitArea } from '../playground.js';
import { getTouchOverride, isMobileView } from '../mobile.js';

export const ParkMap = {
    name: 'parkmap',
    enter(): void {
        game.touch.visible = false;
        game.ui.panel({ anchor: 'center', w: 1280, h: 720, z: 20, style: 'dark', safeArea: false });
        game.text('A GOOD DAY AT THE PARK', 640, 58, { z: 21, size: 35, font: 'mono-bold', color: '#f5e2a8' });
        game.text('Choose a neighborhood to stroll there. Your discoveries stay with you.', 640, 102,
            { z: 21, size: 17, font: 'mono', color: '#c6d6b6' });
        PARK_AREAS.forEach((area, i) => {
            const x = i % 3 * 390 - 390, y = Math.floor(i / 3) * 125 - 175;
            game.ui.button({ id: `map-area-${i + 1}`, anchor: 'center', x, y, z: 21, h: 60, text: area.name,
                icon: 'pin', style: i === 0 ? 'good' : 'flat', onClick: () => visitArea(area.x) });
            game.text(area.description, 640 + x, 360 + y + 48, { z: 21, size: 13, font: 'mono', color: '#c6d6b6' });
        });
        const earned = badges();
        const progress = ['rest for 2 seconds', 'return a stick', `${park.treats.length}/12 treats`, 'crouch + F at open box',
            `${park.sniffed.length}/6 bushes`, `${park.snacks.length}/6 snacks`, `${park.friends.length}/4 dogs`, `${park.greeted.length}/4 people`];
        BADGE_NAMES.forEach((name, i) => {
            const x = 170 + i % 4 * 315, y = 470 + Math.floor(i / 4) * 76;
            game.text(`${earned[i] ? '[YES]' : '[   ]'} ${name}`, x, y,
                { z: 21, size: 16, font: 'mono-bold', color: earned[i] ? '#ffe19a' : '#e5edda' });
            game.text(progress[i], x, y + 24, { z: 21, size: 13, font: 'mono', color: '#b8ccb0' });
        });
        game.ui.button({ id: 'map-close', anchor: 'bottom', y: -26, z: 21, h: 54, text: 'Back to Tokyo', icon: 'back', style: 'good', onClick: () => game.scenes.pop() });
        game.step('parkmap', () => {
            if (game.input.keyPressed('Escape') || game.input.keyPressed('KeyM')) game.scenes.pop();
        });
    },
    exit(): void { game.touch.visible = getTouchOverride() ?? isMobileView(); },
};

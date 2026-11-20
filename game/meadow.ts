import { game } from './engine.js';
import { spawnScenery } from './scenery.js';

export const MEADOW_WIDTH = 2400, GROUND_Y = 560;
const LEDGES = [{ x: 620, y: 474, w: 160 }, { x: 850, y: 392, w: 160 },
    { x: 1080, y: 450, w: 176 }, { x: 2030, y: 456, w: 176 }];

export function spawnMeadow(): void {
    spawnScenery();
    game.spawn({ id: 'ground', x: MEADOW_WIDTH / 2, y: GROUND_Y + 80,
        width: MEADOW_WIDTH, height: 160, layer: 'world', visible: false, tags: ['terrain'], body: { type: 'static', friction: 0 } });
    for (const [index, ledge] of LEDGES.entries()) {
        game.spawn({ id: `ledge-${index + 1}`, texture: 'grass-ledge', x: ledge.x, y: ledge.y + 12,
            width: ledge.w, height: 24, layer: 'world', tags: ['terrain'], body: { type: 'static' } });
    }
    game.spawn({ id: 'low-tunnel', texture: 'tunnel', x: 1640, y: 466,
        width: 260, height: 100, layer: 'world', tags: ['terrain'], body: { type: 'static' } });
    game.spawn({ id: 'left-boundary', x: -30, y: 360, width: 60, height: 720, visible: false, body: { type: 'static' } });
    game.spawn({ id: 'right-boundary', x: MEADOW_WIDTH + 30, y: 360, width: 60, height: 720, visible: false, body: { type: 'static' } });
    sign('jump-sign', 'A little leap', 624, 528);
    sign('crouch-sign', 'Stay low / DOWN', 1380, 528);
    sign('rest-sign', 'Take a rest / E', 2180, 528);
}
function sign(id: string, text: string, x: number, y: number): void {
    game.spawn({ id, texture: 'signpost', x, y: y + 10, layer: 'back' });
    game.text(text, x, y - 2, { size: 17, font: 'mono-bold', color: '#fff0c9', layer: 'world',
        shadow: { color: '#493c36', x: 2, y: 2 } });
}

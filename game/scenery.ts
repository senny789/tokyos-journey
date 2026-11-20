import { game } from './engine.js';

const GROUND = 560;
const WORLD_WIDTH = 2400;
const TREE_BASELINE = 120;
const FLOWER_BASELINE = 29;

/** Shared scenery, with distant layers moving more slowly than the meadow. */
export function spawnScenery(title = false): void {
    game.background.color('#c8ded6');
    game.spawn({ id: 'meadow-sky', texture: 'meadow', x: WORLD_WIDTH / 2, y: 360, layer: 'back', z: -5 });
    const mountains = game.spawn({ id: 'distant-mountains', texture: 'mountains',
        x: WORLD_WIDTH / 2, y: title ? 470 : 370, width: 2800, height: 360, layer: 'back', z: -4 });
    const hills = game.spawn({ id: 'rolling-hills', texture: 'hills',
        x: WORLD_WIDTH / 2, y: 474, width: 2800, height: 172, layer: 'back', z: -3 });
    const trees = title
        ? [{ x: 120, frame: 0, scale: 2.5 }, { x: 1160, frame: 3, scale: 2.8 }]
        : [{ x: 40, frame: 0, scale: 2.8 }, { x: 370, frame: 1, scale: 2.6 },
            { x: 1170, frame: 3, scale: 2.9 }, { x: 1860, frame: 2, scale: 2.6 },
            { x: 2320, frame: 1, scale: 2.9 }];
    for (const tree of trees) {
        game.spawn({ id: 'meadow-tree', texture: 'trees', frame: tree.frame, x: tree.x,
            y: GROUND - (TREE_BASELINE - 64) * tree.scale, scale: tree.scale,
            layer: 'back', z: -1 });
    }
    for (let x = 64; x < WORLD_WIDTH; x += 128) {
        game.spawn({ id: 'grassland-tile', texture: 'grassland', x, y: GROUND + 80,
            width: 128, height: 160, layer: 'world', z: -2 });
    }
    for (let i = 0; i < 26; i++) {
        const scale = i % 3 === 0 ? 1.1 : 0.85;
        game.spawn({ id: 'wildflowers', texture: 'flowers', frame: i % 8,
            x: 45 + i * 92, y: GROUND - (FLOWER_BASELINE - 16) * scale,
            scale, layer: 'world', z: 0 });
    }
    game.step('scenery-parallax', () => {
        const scroll = game.camera.x - game.screen.width / 2;
        mountains.x = WORLD_WIDTH / 2 + scroll * 0.75;
        hills.x = WORLD_WIDTH / 2 + scroll * 0.35;
    }, { after: 'rig-follow.camera' });
}

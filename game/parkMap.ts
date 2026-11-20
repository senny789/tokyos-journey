import { game } from './engine.js';
import { spawnScenery } from './scenery.js';
import { PARK_GROUND, PARK_WIDTH, park } from './playground.js';
import artBounds from './park-art.json';

const TREE_SPACING = 620, FLOWER_SPACING = 112;
export function parkProp(id: string, texture: keyof typeof artBounds, frame: number, x: number, height: number, feet = PARK_GROUND, back = false) {
    const [cellWidth, cellHeight, , artHeight] = artBounds[texture][frame];
    const scale = height / artHeight;
    return game.spawn({ id, texture: `park-${texture}`, frame, x, y: feet - (cellHeight / 2 - 2) * scale,
        width: cellWidth * scale, height: cellHeight * scale,
        layer: back ? 'back' : 'world', z: back ? 1 : 4, tags: ['park-prop'] });
}
export function terrain(id: string, x: number, y: number, w: number, h: number, oneWay = false): void {
    game.spawn({ id, x, y: y + h / 2, width: w, height: h, visible: false, tags: ['terrain'],
        body: { type: 'static', friction: 0, ...(oneWay ? { oneWay: 'up' as const } : {}) } });
}
export function spawnParkMap(): void {
    const scenery = spawnScenery(false, PARK_WIDTH, () => park.night);
    terrain('park-ground', PARK_WIDTH / 2, PARK_GROUND, PARK_WIDTH, 180);
    terrain('park-left-wall', -30, 0, 60, 720);
    terrain('park-right-wall', PARK_WIDTH + 30, 0, 60, 720);
    for (let x = 700; x < PARK_WIDTH; x += TREE_SPACING) {
        game.spawn({ id: `park-tree-${x}`, texture: 'trees', frame: Math.floor(x / TREE_SPACING) % 4,
            x, y: 412, scale: 2.6, layer: 'back', z: 0 });
    }
    for (let x = 2400; x < PARK_WIDTH; x += FLOWER_SPACING) {
        game.spawn({ id: `park-flower-${x}`, texture: 'flowers', frame: Math.floor(x / FLOWER_SPACING) % 8,
            x, y: PARK_GROUND - 12, layer: 'world', z: 0 });
    }
    parkProp('home-cottage', 'houses', 0, 260, 228, PARK_GROUND, true);
    parkProp('neighborhood-house', 'houses', 1, 1480, 215, PARK_GROUND, true);
    parkProp('tokyo-doghouse', 'houses', 2, 650, 150, PARK_GROUND, true);
    parkProp('park-cabin', 'houses', 3, 4660, 220, PARK_GROUND, true);
    // Every rock variant appears. The forgiving flat tops are real one-way platforms.
    const rocks = [{ x: 2070, h: 62 }, { x: 2290, h: 92 }, { x: 2500, h: 45 }, { x: 3130, h: 28 },
        { x: 2420, h: 30, feet: 395 }, { x: 3710, h: 58 }, { x: 3890, h: 70 }];
    rocks.forEach((r, i) => {
        const sprite = parkProp(`rock-${i + 1}`, 'rocks', i, r.x, r.h, r.feet ?? PARK_GROUND);
        terrain(`rock-top-${i + 1}`, r.x, (r.feet ?? PARK_GROUND) - r.h + 8, sprite.width * 0.78, 12, true);
    });
    // Crates form an optional upper route; lower ground always stays traversable.
    for (const [i, x] of [1810, 1930, 2180, 2670, 2820, 2980].entries()) {
        const h = i === 4 ? 124 : 76;
        parkProp(`box-${i + 1}`, 'boxes', i, x, h, i === 4 ? 416 : PARK_GROUND);
        if (i !== 1 && i !== 4 && i !== 5) terrain(`box-top-${i + 1}`, x, PARK_GROUND - h + 5, 70, 12, true);
    }
    game.spawn({ id: 'park-low-tunnel', texture: 'tunnel', x: 2850, y: 466,
        layer: 'world', z: 5, tags: ['terrain'], body: { type: 'static' } });
    // The box at x2820 decorates the tunnel roof rather than obstructing its crawl space.
    game.step('park-sky', () => {
        scenery.sky.tint = park.night ? '#526187' : '#ffffff';
        scenery.mountains.tint = park.night ? '#667596' : '#ffffff';
    });
}

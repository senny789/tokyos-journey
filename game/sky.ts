import { game } from './engine.js';

const CELESTIAL_X = 1060, CELESTIAL_Y = 174;
const SUN_WIDTH = 94, MOON_HEIGHT = 90, SUN_BOB = 2, MOON_BOB = 3;
const STAR_MIN_ALPHA = 0.38, STAR_PULSE_ALPHA = 0.56, TWINKLE_SPEED = 1.4;
const CLOUD_WRAP_MARGIN = 180, CLOUD_BASE_SPEED = 4, CLOUD_SPEED_STEP = 0.65;
const CLOUDS = [
    { x: 100, y: 210, width: 164 }, { x: 326, y: 258, width: 124 },
    { x: 565, y: 181, width: 192 }, { x: 791, y: 242, width: 148 },
    { x: 1100, y: 266, width: 176 }, { x: 1320, y: 203, width: 116 },
] as const;
const STARS = [
    [52,155,12], [156,238,17], [263,178,11], [357,291,14], [458,139,19],
    [553,247,12], [656,171,15], [756,285,20], [856,148,12], [939,232,17],
    [1165,156,15], [1233,287,11], [94,310,10], [690,327,12], [1150,329,13],
] as const;

/** Camera-pinned scenery stays behind mountains, trees, characters and menus. */
export function spawnSky(isNight: () => boolean): void {
    const sun = game.spawn({ id: 'park-sun', texture: 'sky-sun', x: CELESTIAL_X,
        y: CELESTIAL_Y, width: SUN_WIDTH, layer: 'back', z: -4.8, visible: !isNight() });
    const moon = game.spawn({ id: 'park-moon', texture: 'sky-moon', x: CELESTIAL_X,
        y: CELESTIAL_Y, height: MOON_HEIGHT, layer: 'back', z: -4.8, visible: isNight() });
    const stars = STARS.map(([x, y, height], i) => game.spawn({ id: `sky-star-${i}`,
        texture: 'sky-star', x, y, height, layer: 'back', z: -4.9, visible: isNight() }));
    const clouds = CLOUDS.map((cloud, i) => game.spawn({ id: `park-cloud-${i}`,
        texture: 'sky-cloud', ...cloud, layer: 'back', z: -4.6 }));
    let elapsed = 0;
    const update = () => {
        const night = isNight();
        const scrollX = game.camera.x - game.screen.width / 2;
        const scrollY = game.camera.y - game.screen.height / 2;
        sun.visible = !night; moon.visible = night;
        sun.x = moon.x = CELESTIAL_X + scrollX;
        sun.y = CELESTIAL_Y + scrollY + Math.sin(elapsed * 0.35) * SUN_BOB;
        moon.y = CELESTIAL_Y + scrollY + Math.sin(elapsed * 0.3) * MOON_BOB;
        stars.forEach((star, i) => {
            star.visible = night;
            star.x = STARS[i][0] + scrollX; star.y = STARS[i][1] + scrollY;
            star.alpha = STAR_MIN_ALPHA + (Math.sin(elapsed * TWINKLE_SPEED + i * 1.7) + 1) / 2 * STAR_PULSE_ALPHA;
        });
        clouds.forEach((cloud, i) => {
            const span = game.screen.width + CLOUD_WRAP_MARGIN * 2;
            cloud.x = ((CLOUDS[i].x + CLOUD_WRAP_MARGIN + elapsed * (CLOUD_BASE_SPEED + i * CLOUD_SPEED_STEP)) % span)
                - CLOUD_WRAP_MARGIN + scrollX;
            cloud.y = CLOUDS[i].y + scrollY;
            cloud.tint = night ? '#8999c3' : '#ffffff';
            cloud.alpha = night ? 0.7 : 0.94;
        });
    };
    update();
    game.step('sky-sprites', dt => { elapsed += dt; update(); }, { after: 'rig-follow.camera' });
}

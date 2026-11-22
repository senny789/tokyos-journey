// The game starts here. Its pictures are painted, the files the title screen shows load under the loading screen,
// the scenes are registered and the title begins; then the rest of the game loads quietly while the title is up.
// The game is READY (`game.ready`) once that has landed too.
// A new screen is a file in scenes/, registered below. The debug controls are added here too, before the first scene.
import { game } from './engine.js';
import assets from './assets.json';
import { paintArt } from './art.js';
import { addDebugControls } from './debug.js';
import { Title } from './scenes/Title.js';
import { Play } from './scenes/Play.js';
import { Pause } from './scenes/Pause.js';
import { Settings } from './scenes/Settings.js';
import { Playground } from './scenes/Playground.js';
import { ParkMap } from './scenes/ParkMap.js';
import { Story } from './scenes/Story.js';
import { Celebration } from './scenes/Celebration.js';
import { Home } from './scenes/Home.js';
import { DreamStart } from './scenes/DreamStart.js';
import { Journey } from './scenes/Journey.js';
import { Ending } from './scenes/Ending.js';
import { loadHomeArt } from './home.js';
import { paintHomeInterior } from './homeInterior.js';
import { loadJourneyArt } from './journey.js';
import { loadTokyoArt } from './tokyoArt.js';

const PIXEL_PARK_STRIPS = new Set(['beds', 'boxes', 'food', 'houses', 'people', 'portal', 'rocks', 'villain-dogs']);

paintArt();
// Load the pixel-friendly menu skin and character art before either scene.
game.ui.theme = 'block';
game.controls.bind('jump', { keys: ['Space', 'ArrowUp', 'KeyW', 'Touch:jump'], pad: ['a'] });
game.controls.bind('run', { keys: ['ShiftLeft', 'ShiftRight', 'Touch:run'], pad: ['x'] });
game.controls.bind('crouch', { keys: ['ArrowDown', 'KeyS', 'KeyC', 'Touch:crouch', 'Touch:down'], pad: ['lb'] });
game.controls.bind('sit', { keys: ['KeyE', 'Touch:sit'], pad: ['b'] });
game.controls.bind('poop', { keys: ['KeyG', 'Touch:poop'], pad: ['rb'] });
game.controls.bind('interact', { keys: ['KeyF', 'Touch:interact'], pad: ['y'] });
game.controls.bind('pause', { keys: ['Escape', 'KeyP', 'Touch:pause'], pad: ['start'] });
// Vertical keyboard actions have their own bindings; they must not normalize
// the horizontal move axis as if this side-view game had diagonal movement.
game.controls.bindMove({ left: ['ArrowLeft', 'KeyA', 'Touch:left'], right: ['ArrowRight', 'KeyD', 'Touch:right'], up: [], down: [] });
await game.typography.prepare(['mono', 'mono-bold', 'sans', 'sans-bold', 'serif-bold']);
await loadTokyoArt();
await game.assets.load([
    { kind: 'image', key: 'title-home-dusk', url: 'assets/title-home-dusk.png' },
    { kind: 'image', key: 'story-living-room', url: 'assets/story-living-room.png' },
    { kind: 'image', key: 'tokyo-poop', url: 'assets/tokyo-poop.png' },
    { kind: 'image', key: 'grassland', url: 'assets/grassland.png' },
    { kind: 'image', key: 'grass-ledge', url: 'assets/grassland.png', w: 128, h: 24, cols: 1, rows: 1 },
    { kind: 'image', key: 'trees', url: 'assets/trees.png', w: 128, h: 128, cols: 2, rows: 2 },
    { kind: 'image', key: 'hills', url: 'assets/hills.png' },
    { kind: 'image', key: 'mountains', url: 'assets/mountains.png' },
    { kind: 'image', key: 'flowers', url: 'assets/flowers.png', w: 32, h: 32, cols: 4, rows: 2 },
    { kind: 'image', key: 'treat-atlas', url: 'assets/treat-atlas.png', w: 48, h: 48, cols: 4, rows: 1 },
]);
await game.assets.load(assets, { pack: 'title' });
// Trimmed atlases preserve every variant from the original, irregular sprite sheets.
for (const [key, w, h, cols] of [
    ['houses', 256, 240, 4], ['people', 96, 160, 4], ['beds', 128, 96, 4],
    ['boxes', 96, 96, 6], ['food', 64, 64, 6], ['insects', 40, 40, 6],
    ['sticks', 64, 64, 6], ['bushes', 128, 112, 6], ['rocks', 160, 112, 7],
    ['portal', 192, 240, 4], ['villain-dogs', 112, 112, 8], ['treats', 48, 48, 4], ['clouds', 192, 128, 6],
] as const) {
    const suffix = PIXEL_PARK_STRIPS.has(key) ? '-pixel' : '';
    await game.assets.load([{ kind: 'image', key: `park-${key}`, url: `assets/park-${key}${suffix}.png`, w, h, cols, rows: 1 }]);
}
await game.assets.load([
    { kind: 'image', key: 'sky-sun', url: 'assets/sky-sun.png' },
    { kind: 'image', key: 'sky-moon', url: 'assets/sky-moon.png' },
    { kind: 'image', key: 'sky-cloud', url: 'assets/sky-cloud.png' },
    { kind: 'image', key: 'sky-star', url: 'assets/sky-star.png' },
]);
await loadHomeArt();
paintHomeInterior();
await loadJourneyArt();

game.scenes.register(Title);
game.scenes.register(Play);
game.scenes.register(Pause);
game.scenes.register(Settings);
game.scenes.register(Playground);
game.scenes.register(ParkMap);
game.scenes.register(Story);
game.scenes.register(Home);
game.scenes.register(DreamStart);
game.scenes.register(Journey);
game.scenes.register(Ending);
game.scenes.register(Celebration);
addDebugControls();

await game.start();
game.scenes.go('title');

game.assets.load(assets, { pack: 'game' });

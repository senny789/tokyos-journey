import { game } from '../engine.js';
import { spawnScenery } from '../scenery.js';
import { startPlayground } from '../playground.js';
import { addFullscreenButton } from '../mobile.js';

export const Title = {
    name: 'title',
    enter(): void {
        game.touch.visible = false; spawnScenery(true);
        addFullscreenButton({ anchor: 'top-right', x: -16, y: 16 });
        game.ui.button({ id: 'settings-btn', anchor: 'top-right', x: -80, y: 16, h: 56,
            style: 'icon', icon: 'settings', accessibleLabel: 'Settings', onClick: () => game.scenes.push('settings') });
        game.text('A LITTLE DOG. A WORLD OF POSSIBILITIES.', 640, 112, { size: 18, font: 'mono-bold', color: '#566952' });
        game.text("TOKYO'S JOURNEY", 640, 173, { size: 62, font: 'mono-bold', color: '#33483d',
            shadow: { color: '#eff0cb', x: 4, y: 4 } });
        game.text('What kind of day shall we have?', 640, 236, { size: 22, font: 'mono', color: '#566952' });
        const tokyo = game.spawn({ id: 'title-tokyo', texture: 'tokyo', x: 640, y: 334, scale: 2.3, layer: 'world' });
        game.spawn({ id: 'title-butterfly', texture: 'park-insects', frame: 0, x: 536, y: 304, width: 38, layer: 'world' });
        game.spawn({ id: 'title-stick', texture: 'park-sticks', frame: 0, x: 751, y: 371, width: 46, layer: 'world' });
        game.ui.button({ id: 'choose-playground', anchor: 'center', x: -260, y: 95, h: 76,
            text: 'Playground', style: 'good', icon: 'paw', onClick: startPlayground });
        game.ui.button({ id: 'choose-story', anchor: 'center', x: 260, y: 95, h: 76,
            text: 'Story Mode', style: 'blue', icon: 'book', onClick: () => game.scenes.go('story') });
        game.text('FREE PLAY / A park full of discoveries', 380, 522, { size: 16, font: 'mono-bold', color: '#33483d' });
        game.text('CHAPTER 01 / The Movement Meadow', 900, 522, { size: 16, font: 'mono-bold', color: '#33483d' });
        game.text('Fetch. Sniff. Make friends. Find your own adventure.', 640, 610,
            { size: 19, font: 'mono', color: '#f7efcf', shadow: { color: '#253c36', x: 2, y: 2 } });
        game.text('ENTER: PLAYGROUND     /     2: STORY MODE', 640, 665, { size: 16, font: 'mono-bold', color: '#e7dfb8' });
        let elapsed = 0;
        game.step('title', dt => {
            elapsed += dt; tokyo.setFrame(Math.floor(elapsed * 5) % 8);
            if (game.input.keyPressed('Enter') || game.input.keyPressed('Space')) startPlayground();
            if (game.input.keyPressed('Digit2')) game.scenes.go('story');
        });
    },
};

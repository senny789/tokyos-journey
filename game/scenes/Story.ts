import { game } from '../engine.js';
import { run } from '../entities/Tokyo.js';
import { spawnScenery } from '../scenery.js';

export const Story = {
    name: 'story',
    enter(): void {
        game.touch.visible = false; spawnScenery(true);
        game.text('STORY MODE', 640, 122, { size: 48, font: 'mono-bold', color: '#33483d' });
        game.text('Every journey begins with a little courage.', 640, 185, { size: 21, font: 'mono', color: '#52674f' });
        game.spawn({ id: 'story-portal', texture: 'park-portal', frame: 1, x: 985, y: 425, height: 240, layer: 'world' });
        game.spawn({ id: 'story-tokyo', texture: 'tokyo', x: 306, y: 480, scale: 2, layer: 'world' });
        game.text('CHAPTER 01 / THE MOVEMENT MEADOW', 640, 282, { size: 24, font: 'mono-bold', color: '#33483d' });
        game.text("Ten treats wait beyond Tokyo's front door.", 640, 335, { size: 18, font: 'mono', color: '#435d49' });
        game.text('Leap, crawl the tunnel, and raise the flag.', 640, 368, { size: 18, font: 'mono', color: '#435d49' });
        game.ui.button({ id: 'story-chapter', anchor: 'center', y: 90, h: 66, text: 'Begin chapter 1', icon: 'play', style: 'good',
            onClick: () => { run.spawnX = 220; game.scenes.go('meadow'); } });
        game.ui.button({ id: 'story-back', anchor: 'center', y: 180, h: 56, text: 'Choose a mode', icon: 'back', style: 'flat', onClick: () => game.scenes.go('title') });
        game.text('More chapters will follow. The playground is open for free play now.', 640, 651,
            { size: 16, font: 'mono', color: '#f7efcf', shadow: { color: '#253c36', x: 2, y: 2 } });
        game.step('story', () => { if (game.input.keyPressed('Escape')) game.scenes.go('title'); });
    },
};

import { game } from '../engine.js';
import { startPlayground } from '../playground.js';
import { MENU_BUTTON_HEIGHT, menuButtonStyles } from '../menuStyles.js';
import { addFullscreenButton, isMobileView } from '../mobile.js';

const MENU_LEFT = 88;
const STORY_BUTTON_Y = 346;
const PLAYGROUND_BUTTON_Y = 466;
const TOKYO_X = 878;
const TOKYO_FEET_Y = 581;
const TOKYO_SCALE = 4;
const SEATED_FOOT_OFFSET = 21 * TOKYO_SCALE;
const SEATED_FIRST_FRAME = 42;
const SEATED_FRAME_COUNT = 4;

function openStory(): void {
    game.scenes.go('story');
}

export const Title = {
    name: 'title',
    enter(): void {
        game.touch.visible = false;
        game.camera.snap(game.screen.width / 2, game.screen.height / 2, 1);
        game.background.picture('title-home-dusk', 'stretch');

        game.text('Tokyo’s', MENU_LEFT, 140, {
            size: 102, font: 'serif-bold', color: '#fff4d9', align: 'left',
            shadow: { color: '#131d1a', x: 3, y: 4 },
        });
        game.text('Journey', MENU_LEFT, 240, {
            size: 112, font: 'serif-bold', color: '#f3c37e', align: 'left',
            shadow: { color: '#131d1a', x: 3, y: 4 },
        });

        game.ui.button({
            id: 'choose-story', anchor: 'top-left', x: MENU_LEFT, y: STORY_BUTTON_Y,
            h: MENU_BUTTON_HEIGHT, text: 'Story Mode', icon: 'book', iconSize: 29, onClick: openStory,
            style: menuButtonStyles.primary,
        });
        game.text('Start at home and follow Tokyo into her dream.', MENU_LEFT, 435,
            { size: 19, font: 'sans', color: '#f2e5cd', align: 'left' });

        game.ui.button({
            id: 'choose-playground', anchor: 'top-left', x: MENU_LEFT, y: PLAYGROUND_BUTTON_Y,
            h: MENU_BUTTON_HEIGHT, text: 'Playground', icon: 'paw', iconSize: 29, onClick: startPlayground,
            style: menuButtonStyles.secondary,
        });
        game.text('Explore the park at your own pace.', MENU_LEFT, 555,
            { size: 19, font: 'sans', color: '#f2e5cd', align: 'left' });
        if (!isMobileView()) {
            game.text('2  Story Mode     Enter  Playground', MENU_LEFT, 637,
                { size: 16, font: 'mono', color: '#d8dac1', align: 'left' });
        }

        game.ui.button({ id: 'settings-btn', anchor: 'top-right', x: -80, y: 16, h: 56,
            style: 'icon', icon: 'settings', accessibleLabel: 'Settings', onClick: () => game.scenes.push('settings') });
        addFullscreenButton({ anchor: 'top-right', x: -16, y: 16 });

        game.spawn({ id: 'title-tokyo-shadow', texture: 'shadow', x: TOKYO_X, y: TOKYO_FEET_Y,
            width: 148, layer: 'world', alpha: 0.52 });
        const tokyo = game.spawn({ id: 'title-tokyo', texture: 'tokyo', frame: SEATED_FIRST_FRAME,
            x: TOKYO_X, y: TOKYO_FEET_Y - SEATED_FOOT_OFFSET, scale: TOKYO_SCALE, layer: 'world', z: 1 });
        let elapsed = 0;
        game.step('title', dt => {
            elapsed += dt;
            tokyo.setFrame(SEATED_FIRST_FRAME + Math.floor(elapsed * 2.5) % SEATED_FRAME_COUNT);
            if (game.touch.visible) game.touch.visible = false;
            if (game.input.keyPressed('Digit2')) {
                openStory();
            } else if (!game.ui.focus && (game.input.keyPressed('Enter') || game.input.keyPressed('Space'))) {
                startPlayground();
            }
        });
    },
};

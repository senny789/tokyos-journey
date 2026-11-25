import { game } from '../engine.js';
import { run } from '../entities/Tokyo.js';
import { MENU_BUTTON_HEIGHT, menuButtonStyles } from '../menuStyles.js';
import { isMobileView } from '../mobile.js';

const MENU_LEFT = 88;
const HOME_BUTTON_Y = 352;
const LEVEL_SELECT_X = 366;
const MEADOW_BUTTON_Y = 467;
const TOKYO_X = 917;
const TOKYO_FEET_Y = 614;
const TOKYO_SCALE = 4;
const CARRY_FOOT_OFFSET = 21 * TOKYO_SCALE;
const IDLE_FRAME_COUNT = 8;

function startHome(): void {
    game.scenes.go('home');
}

function returnToMenu(): void {
    game.scenes.go('title');
}

export const Story = {
    name: 'story',
    enter(): void {
        game.touch.visible = false;
        game.camera.snap(game.screen.width / 2, game.screen.height / 2, 1);
        game.background.picture('story-living-room', 'stretch');

        game.text('Home Before', MENU_LEFT, 165, {
            size: 74, font: 'serif-bold', color: '#fff4d9', align: 'left',
            shadow: { color: '#241b15', x: 3, y: 4 },
        });
        game.text('the Dream', MENU_LEFT, 242, {
            size: 87, font: 'serif-bold', color: '#f3c37e', align: 'left',
            shadow: { color: '#241b15', x: 3, y: 4 },
        });
        game.text('Play with the family, then settle in for bed.', MENU_LEFT, 312,
            { size: 20, font: 'sans', color: '#f2e5cd', align: 'left' });

        game.ui.button({
            id: 'story-home', anchor: 'top-left', x: MENU_LEFT, y: HOME_BUTTON_Y,
            h: MENU_BUTTON_HEIGHT, text: 'Start at Home', icon: 'play', iconSize: 29,
            style: menuButtonStyles.primary, onClick: startHome,
        });
        game.ui.button({
            id: 'story-level-select', anchor: 'top-left', x: LEVEL_SELECT_X, y: HOME_BUTTON_Y,
            h: MENU_BUTTON_HEIGHT, text: 'Level Select', icon: 'levels', iconSize: 29,
            style: menuButtonStyles.secondary, onClick: () => game.scenes.go('level-select'),
        });
        game.ui.button({
            id: 'story-chapter', anchor: 'top-left', x: MENU_LEFT, y: MEADOW_BUTTON_Y,
            h: MENU_BUTTON_HEIGHT, text: 'Movement Meadow', icon: 'paw', iconSize: 29,
            style: menuButtonStyles.secondary,
            onClick: () => { run.spawnX = 220; game.scenes.go('meadow'); },
        });
        game.text('Jump to the ten-treat challenge.', MENU_LEFT, 553,
            { size: 19, font: 'sans', color: '#f2e5cd', align: 'left' });

        game.ui.button({
            id: 'story-back', anchor: 'top-left', x: MENU_LEFT, y: 44, h: 46,
            text: 'Back to Menu', icon: 'back', iconSize: 20, style: menuButtonStyles.secondary,
            onClick: returnToMenu,
        });
        if (!isMobileView()) {
            game.text('Enter  Start at Home     Esc  Back', MENU_LEFT, 637,
                { size: 16, font: 'mono', color: '#e6d7bc', align: 'left' });
        }

        game.spawn({ id: 'story-tokyo-shadow', texture: 'shadow', x: TOKYO_X, y: TOKYO_FEET_Y,
            width: 152, layer: 'world', alpha: 0.48 });
        const tokyo = game.spawn({ id: 'story-tokyo', texture: 'tokyo-carry-plushie',
            x: TOKYO_X, y: TOKYO_FEET_Y - CARRY_FOOT_OFFSET, scale: TOKYO_SCALE, layer: 'world', z: 1 });
        let elapsed = 0;
        game.step('story', dt => {
            elapsed += dt;
            tokyo.setFrame(Math.floor(elapsed * 4) % IDLE_FRAME_COUNT);
            if (game.input.keyPressed('Escape')) {
                returnToMenu();
            } else if (!game.ui.focus && game.input.keyPressed('Enter')) {
                startHome();
            }
        });
    },
};

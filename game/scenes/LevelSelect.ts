import { game } from '../engine.js';
import { DREAM_LEVELS, prepareDreamStage } from '../journey.js';
import { MENU_BUTTON_HEIGHT, menuButtonStyles } from '../menuStyles.js';

const GRID_WIDTH = 832;
const GRID_TOP = 216;
const GRID_PADDING = 24;
const COLUMN_GAP = 20;
const ROW_GAP = 13;
const LEVELS = [{ number: 0, name: 'Home Before the Dream' }, ...DREAM_LEVELS];

function returnToStory(): void {
    game.scenes.go('story');
}

export const LevelSelect = {
    name: 'level-select',
    enter(): void {
        const { width, height } = game.screen;
        game.touch.visible = false;
        game.camera.snap(width / 2, height / 2, 1);
        game.background.picture('story-living-room', 'stretch');
        game.spawn({ id: 'level-select-shade', x: width / 2, y: height / 2,
            width, height, layer: 'hud', z: -1, tint: '#171d19', alpha: 0.71 });

        game.ui.button({
            id: 'level-select-back', anchor: 'top-left', x: 88, y: 44,
            h: 46, text: 'Back to Story', icon: 'back', iconSize: 20,
            style: menuButtonStyles.secondary, onClick: returnToStory,
        });
        game.text('Select a Level', width / 2, 149, {
            size: 64, font: 'serif-bold', color: '#fff4d9',
            shadow: { color: '#241b15', x: 3, y: 4 },
        });

        const rows = Math.ceil(LEVELS.length / 2);
        const gridHeight = GRID_PADDING * 2 + rows * MENU_BUTTON_HEIGHT + (rows - 1) * ROW_GAP;
        const grid = game.ui.panel({
            id: 'story-level-grid', anchor: 'top', y: GRID_TOP, w: GRID_WIDTH, h: gridHeight,
            style: { fill: '#1c2a25', border: 2, borderColor: '#697b68', radius: 8 },
        });
        const columnWidth = (GRID_WIDTH - GRID_PADDING * 2 - COLUMN_GAP) / 2;
        const columns = [0, 1].map(column => game.ui.panel({
            parent: grid, anchor: 'top-left', x: GRID_PADDING + column * (columnWidth + COLUMN_GAP),
            y: GRID_PADDING, w: columnWidth, h: 'auto',
            layout: { padding: 0, gap: ROW_GAP, align: 'stretch' },
            style: { fill: '#00000000', border: 0, shadow: 0, depth: 0 },
        }));
        for (const [index, { number, name }] of LEVELS.entries()) {
            game.ui.button({
                id: `story-level-${number}`, parent: columns[index % columns.length]!,
                h: MENU_BUTTON_HEIGHT, text: `${number} · ${name}`, accessibleLabel: `Level ${number}, ${name}`,
                style: number === 0 ? menuButtonStyles.primary : menuButtonStyles.secondary,
                onClick: () => {
                    if (number === 0) game.scenes.go('home');
                    else prepareDreamStage(number);
                },
            });
        }
        game.step('level-select', () => {
            if (game.input.keyPressed('Escape')) returnToStory();
        });
    },
};

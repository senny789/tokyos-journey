import { game } from '../engine.js';
import { resetTouchLayout, saveTouchLayout, TOUCH_COLORS, touchLayout } from '../touchLayout.js';

const LEFT = 90, SLIDER_X = 375, SLIDER_WIDTH = 380, ROW_HEIGHT = 76;
const TOP = 170;

export const TouchSettings = {
    name: 'touch-settings',
    enter(): void {
        game.touch.visible = false;
        const layout = touchLayout();
        let selected = 0;
        game.ui.panel({ anchor: 'center', w: game.screen.width, h: game.screen.height, z: 60, safeArea: false, style: 'dark' });
        game.ui.label({ anchor: 'top-left', x: LEFT, y: 26, w: 800, h: 54, z: 61,
            text: 'Customize touch buttons', style: 'heading' });
        const name = game.ui.label({ anchor: 'top-left', x: 290, y: 92, w: 400, h: 52, z: 61, text: '' });
        const preview = game.ui.button({ anchor: 'top-left', x: 870, y: 210, h: 90, z: 61, text: 'Preview', style: 'good' });
        const values = [
            { label: 'Horizontal position', key: 'x' as const, min: 40, max: 600, step: 10 },
            { label: 'Distance from bottom', key: 'y' as const, min: 40, max: 600, step: 10 },
            { label: 'Size', key: 'r' as const, min: 26, max: 90, step: 2 },
            { label: 'Opacity', key: 'opacity' as const, min: 0.15, max: 1, step: 0.05 },
        ];
        const sliders = values.map((field, i) => {
            const y = TOP + i * ROW_HEIGHT;
            game.ui.label({ anchor: 'top-left', x: LEFT, y, w: 270, h: 45, z: 61, text: field.label });
            return game.ui.slider({ id: `touch-${field.key}`, anchor: 'top-left', x: SLIDER_X, y: y + 8,
                w: SLIDER_WIDTH, h: 32, z: 61, min: field.min, max: field.max, step: field.step,
                value: layout[0][field.key], onChange: value => { layout[selected][field.key] = value; saveTouchLayout(); refresh(); } });
        });
        const side = game.ui.button({ anchor: 'top-left', x: 870, y: 340, h: 55, z: 61, text: '',
            onClick: () => { const b = layout[selected]; b.anchor = b.anchor === 'bottom-left' ? 'bottom-right' : 'bottom-left'; saveTouchLayout(); refresh(); } });
        const color = game.ui.button({ anchor: 'top-left', x: 870, y: 410, h: 55, z: 61, text: 'Change color',
            onClick: () => { const b = layout[selected]; b.tint = TOUCH_COLORS[(TOUCH_COLORS.indexOf(b.tint as typeof TOUCH_COLORS[number]) + 1) % TOUCH_COLORS.length]; saveTouchLayout(); refresh(); } });
        function refresh(): void {
            const b = layout[selected];
            name.ui.text = `${selected + 1}/${layout.length}: ${b.code.slice(6).toUpperCase()}`;
            side.ui.text = b.anchor === 'bottom-left' ? 'Side: LEFT' : 'Side: RIGHT';
            preview.ui.text = b.label;
            preview.ui.style = { fill: b.tint, radius: 24, textColor: '#263b30' };
            preview.ui.restyle();
            preview.alpha = b.opacity;
            color.ui.text = `Color: ${b.tint}`;
            values.forEach((field, i) => { sliders[i].ui.value = b[field.key]; });
        }
        game.ui.button({ anchor: 'top-left', x: LEFT, y: 94, h: 48, z: 61, text: 'Previous',
            onClick: () => { selected = (selected + layout.length - 1) % layout.length; refresh(); } });
        game.ui.button({ anchor: 'top-left', x: 655, y: 94, h: 48, z: 61, text: 'Next',
            onClick: () => { selected = (selected + 1) % layout.length; refresh(); } });
        game.ui.button({ anchor: 'top-left', x: LEFT, y: 540, h: 56, z: 61, text: 'Reset all',
            onClick: () => { resetTouchLayout(); refresh(); } });
        game.ui.button({ anchor: 'top-left', x: 450, y: 540, h: 56, z: 61, text: 'Done', style: 'good',
            onClick: () => game.scenes.pop() });
        game.text('Positions measure inward from the chosen side.', LEFT, 640,
            { size: 18, font: 'sans', align: 'left', color: '#fff4d9' });
        game.step('touch-settings', () => { if (game.input.keyPressed('Escape')) game.scenes.pop(); });
        refresh();
    },
};

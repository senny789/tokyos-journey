import { game } from './engine.js';

export const HOME_PROMPT_HEIGHT = 48;
const BISCUIT_TEXTURE_WIDTH = 320;
const BISCUIT_SHADOW_DEPTH = 4;
const BISCUIT_END = [
    [25, 11], [22, 5], [17, 2], [10, 2], [5, 6], [2, 11], [2, 18], [7, 24],
    [2, 29], [2, 36], [5, 41], [10, 45], [17, 45], [22, 42], [25, 36],
] as const;
const KEY_GLYPHS = {
    F: ['####', '#...', '###.', '#...', '#...'],
    Y: ['#..#', '#..#', '.##.', '.#..', '.#..'],
} as const;

type PromptInput = keyof typeof KEY_GLYPHS | 'touch';

export function paintHomePromptKeys(): void {
    for (const [key, glyph] of Object.entries(KEY_GLYPHS)) {
        game.paint(`home-prompt-key-${key}`, 12, 12, ctx => {
            ctx.fillStyle = '#593822';
            ctx.fillRect(1, 2, 10, 8);
            ctx.fillRect(2, 1, 8, 10);
            ctx.fillStyle = '#825431';
            ctx.fillRect(2, 2, 8, 1);
            ctx.fillStyle = '#fff1ce';
            for (const [y, row] of glyph.entries()) {
                for (const [x, pixel] of [...row].entries()) {
                    if (pixel === '#') ctx.fillRect(4 + x, 4 + y, 1, 1);
                }
            }
        }, { res: 1 });
    }
}

export function spawnHomePrompt(onClick: () => void) {
    const biscuit = game.graphics({ id: 'home-interact-biscuit', width: BISCUIT_TEXTURE_WIDTH,
        height: HOME_PROMPT_HEIGHT + BISCUIT_SHADOW_DEPTH, layer: 'hud' });
    biscuit.handle.visible = false;
    const button = game.ui.button({
        id: 'home-interact-button', h: HOME_PROMPT_HEIGHT, iconSize: 24, z: 3,
        hidden: true, safeArea: false, tabIndex: -1, bounce: false, onClick,
        style: {
            designHeight: HOME_PROMPT_HEIGHT, font: 'bold 18px sans', textColor: '#382415',
            fill: '#00000000', fillTo: '#00000000', border: 0, depth: 0, shadow: 0,
            gloss: 0, bevel: 0, textStroke: 0, textOutline: 0, textShadowX: 0, textShadowY: 0,
        },
    });
    let paintedWidth = 0;
    let paintedState = '';

    return {
        measure(label: string, input: PromptInput): number {
            const icon = input === 'touch' ? 'paw' : `home-prompt-key-${input}`;
            if (button.ui.icon !== icon) button.ui.icon = icon;
            if (button.ui.text !== label) button.ui.text = label;
            button.ui.hidden = false;
            return button.ui.rect.w;
        },
        place(x: number, y: number, width: number): void {
            button.ui.x = x;
            button.ui.y = y;
            biscuit.handle.x = x + biscuit.width / 2;
            biscuit.handle.y = y + biscuit.height / 2;
            biscuit.handle.visible = width > 0;
            const state = button.ui.pressed ? 'pressed' : button.ui.hover ? 'hover' : 'normal';
            if (width === paintedWidth && state === paintedState) return;
            paintedWidth = width;
            paintedState = state;

            biscuit.clear().draw(ctx => {
                ctx.beginPath();
                ctx.moveTo(...BISCUIT_END[0]);
                for (const [endX, endY] of BISCUIT_END.slice(1)) ctx.lineTo(endX, endY);
                for (let i = BISCUIT_END.length - 1; i >= 0; i--) {
                    const [endX, endY] = BISCUIT_END[i];
                    ctx.lineTo(width - endX, endY);
                }
                ctx.closePath();
                const bakedColor = ctx.createLinearGradient(0, 2, 0, 45);
                bakedColor.addColorStop(0, state === 'hover' ? '#ffe6b4' : '#f7d7a1');
                bakedColor.addColorStop(1, state === 'pressed' ? '#cf9256' : '#e2ab70');
                ctx.fillStyle = bakedColor;
                ctx.shadowColor = '#30201866';
                ctx.shadowOffsetY = 3;
                ctx.fill();
                ctx.shadowColor = 'transparent';
                ctx.strokeStyle = '#65402a';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = '#a96f4199';
                for (const lobe of [13, width - 13]) {
                    ctx.fillRect(lobe - 3, 11, 3, 2);
                    ctx.fillRect(lobe + 2, 8, 2, 2);
                    ctx.fillRect(lobe, 36, 3, 2);
                    ctx.fillRect(lobe - 5, 34, 2, 2);
                }
            });
        },
        hide(): void {
            button.ui.hidden = true;
            biscuit.handle.visible = false;
        },
    };
}

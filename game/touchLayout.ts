import { game } from './engine.js';

const MIN_X = 40, MAX_X = 600, MIN_Y = 40, MAX_Y = 600;
const MIN_RADIUS = 26, MAX_RADIUS = 90, MIN_OPACITY = 0.15, MAX_OPACITY = 1;
export const TOUCH_COLORS = ['#f4d888', '#ffffff', '#a8c0a0', '#8fd7ed', '#ef9eae', '#b6a7e9'] as const;

type TouchButton = {
    code: string; label: string; anchor: 'bottom-left' | 'bottom-right';
    x: number; y: number; r: number; tint: string; opacity: number;
};

const defaults: TouchButton[] = [
    { code: 'Touch:left', label: '<', anchor: 'bottom-left', x: 55, y: 180, r: 38, tint: '#f4d888', opacity: 0.45 },
    { code: 'Touch:right', label: '>', anchor: 'bottom-left', x: 175, y: 180, r: 38, tint: '#f4d888', opacity: 0.45 },
    { code: 'Touch:up', label: '^', anchor: 'bottom-left', x: 115, y: 240, r: 38, tint: '#f4d888', opacity: 0.45 },
    { code: 'Touch:down', label: 'v', anchor: 'bottom-left', x: 115, y: 120, r: 38, tint: '#f4d888', opacity: 0.45 },
    { code: 'Touch:interact', label: 'INTERACT', anchor: 'bottom-right', x: 320, y: 152, r: 40, tint: '#f4d888', opacity: 0.45 },
    { code: 'Touch:jump', label: 'JUMP', anchor: 'bottom-right', x: 110, y: 160, r: 46, tint: '#f4d888', opacity: 0.45 },
    { code: 'Touch:run', label: 'RUN', anchor: 'bottom-right', x: 215, y: 160, r: 36, tint: '#ffffff', opacity: 0.45 },
    { code: 'Touch:sit', label: 'SIT', anchor: 'bottom-right', x: 215, y: 265, r: 36, tint: '#a8c0a0', opacity: 0.45 },
    { code: 'Touch:poop', label: 'POOP', anchor: 'bottom-right', x: 315, y: 265, r: 36, tint: '#ffffff', opacity: 0.45 },
];
const clamp = (value: unknown, fallback: number, min: number, max: number): number =>
    typeof value === 'number' && Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
let layout: TouchButton[] | null = null;

export function touchLayout(): TouchButton[] {
    if (layout) return layout;
    const saved = game.save.read<Partial<TouchButton>[]>('touch-layout', []);
    layout = defaults.map((base, i) => {
        const item = Array.isArray(saved) ? saved.find(entry => entry && entry.code === base.code) : undefined;
        return { ...base, x: clamp(item?.x, base.x, MIN_X, MAX_X), y: clamp(item?.y, base.y, MIN_Y, MAX_Y),
            r: clamp(item?.r, base.r, MIN_RADIUS, MAX_RADIUS), opacity: clamp(item?.opacity, base.opacity, MIN_OPACITY, MAX_OPACITY),
            tint: TOUCH_COLORS.find(color => color === item?.tint) ?? base.tint,
            anchor: item?.anchor === 'bottom-left' || item?.anchor === 'bottom-right' ? item.anchor : base.anchor };
    });
    return layout;
}

export function saveTouchLayout(): void { game.save.write('touch-layout', touchLayout()); }
export function resetTouchLayout(): void {
    touchLayout().forEach((button, i) => Object.assign(button, defaults[i]));
    saveTouchLayout();
}

/** Scene-owned buttons retain their specs, so edits apply when a paused scene resumes. */
export function spawnTouchLayout(): void {
    const buttons = touchLayout().map(spec => {
        game.touch.button(spec);
        return { spec, handle: [...game.roster.tagged('touch-control')].at(-1)! };
    });
    game.step('touch-opacity', () => {
        for (const { spec, handle } of buttons) if (handle.alive) {
            handle.alpha = Math.min(1, spec.opacity * (game.touch.held.includes(spec.code) ? 2.2 : 1));
            handle.tint = spec.tint;
        }
    }, { after: 'controls-touch' });
}

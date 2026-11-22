import { game } from './engine.js';

const FRAME = 52;
const ORIGINAL_FRAME = 64;
const COLUMNS = 8;
const MOTION_ROWS = 7;
const CROUCH_ROWS = 2;
const CARRY_WIDTH = 92;
const CARRY_HEIGHT = 68;

export type TokyoToy = 'plushie' | 'ball';
export const TOKYO_ART_SCALE = ORIGINAL_FRAME / FRAME;
export const TOKYO_CARRY_CROUCH_START = COLUMNS * MOTION_ROWS;

export async function loadTokyoArt(): Promise<void> {
    await game.assets.load([
        { kind: 'image', key: 'tokyo', url: 'assets/tokyo-family.png', w: FRAME, h: FRAME, cols: COLUMNS, rows: MOTION_ROWS },
        { kind: 'image', key: 'tokyo-crouch', url: 'assets/tokyo-family-crouch.png', w: FRAME, h: FRAME, cols: COLUMNS, rows: CROUCH_ROWS },
        ...(['plushie', 'ball'] as const).map(toy => ({
            kind: 'image' as const, key: `tokyo-carry-${toy}`, url: `assets/tokyo-carry-${toy}.png`,
            w: CARRY_WIDTH, h: CARRY_HEIGHT, cols: COLUMNS, rows: MOTION_ROWS + CROUCH_ROWS,
        })),
    ]);
}

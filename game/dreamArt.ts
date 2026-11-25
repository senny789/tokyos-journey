import { game } from './engine.js';

export const DREAM_GATE_SCALE = 4;
export const DREAM_CLIFF_ART = {
    key: 'dream-cliff',
    width: 160,
    height: 144,
    surfaceY: 5,
    variants: {
        needle: { frame: 0, rimWidth: 57 },
        shoulder: { frame: 1, rimWidth: 71 },
        bank: { frame: 2, rimWidth: 125 },
        outcrop: { frame: 3, rimWidth: 78 },
    },
} as const;
export const DREAM_LEDGE_ART = {
    key: 'dream-floating-ledge',
    width: 48,
    height: 24,
    surfaceY: 3,
    variants: {
        taper: { frame: 0, rimWidth: 36 },
        shelf: { frame: 1, rimWidth: 42 },
        split: { frame: 2, rimWidth: 38 },
        ridge: { frame: 3, rimWidth: 40 },
    },
} as const;
const LIGHT_GRID = 42;
const RUNE_COLORS = { O: '#694d56', S: '#c69a62', G: '#e6bf7c', L: '#fff0ae' };

export async function loadDreamSprites(): Promise<void> {
    await game.assets.load([
        { kind: 'image', key: 'dream-owl', url: 'assets/dream/owl-sprites.png', w: 27, h: 27, cols: 2, rows: 1 },
        { kind: 'image', key: 'dream-cat', url: 'assets/dream/cats-sprites.png', w: 27, h: 24, cols: 4, rows: 1 },
        { kind: 'image', key: DREAM_CLIFF_ART.key, url: 'assets/dream/cliffs.png',
            w: DREAM_CLIFF_ART.width, h: DREAM_CLIFF_ART.height, cols: 4, rows: 1 },
        { kind: 'image', key: DREAM_LEDGE_ART.key, url: 'assets/dream/floating-ledges.png',
            w: DREAM_LEDGE_ART.width, h: DREAM_LEDGE_ART.height, cols: 4, rows: 1 },
    ]);

    paintDreamLight();
    paintKennelGate();
    paintPuzzleStones();
}

function paintDreamLight(): void {
    game.paint('dream-light', LIGHT_GRID, LIGHT_GRID, (ctx, frame) => {
        for (let y = 0; y < LIGHT_GRID; y++) {
            for (let x = 0; x < LIGHT_GRID; x++) {
                const dx = x + 0.5 - LIGHT_GRID / 2;
                const glow = Math.hypot(dx, (y - 18) * 1.15);
                const pool = Math.hypot(dx, (y - 30) * 2.45);
                if (pool < 11) ctx.fillStyle = '#ffe19b55';
                else if (pool < 16) ctx.fillStyle = '#edb96030';
                else if (pool < 19) ctx.fillStyle = '#d89c4520';
                else if (glow < 5 + frame) ctx.fillStyle = '#ffe19b40';
                else if (glow < 10 + frame) ctx.fillStyle = '#edb96020';
                else if (glow < 13 + frame) ctx.fillStyle = '#edb96012';
                else continue;
                ctx.fillRect(x, y, 1, 1);
            }
        }
        ctx.fillStyle = '#ffc76c';
        ctx.fillRect(20, 15, 2, 5);
        ctx.fillRect(19, 16, 4, 3);
        ctx.fillStyle = '#fff2c4';
        ctx.fillRect(20, 16, 2, 2);
        ctx.fillRect(26, 13 + frame % 2, 1, 1);
        ctx.fillRect(15, 20 - frame % 2, 1, 1);
    }, { frames: 4, res: 1 });
}

function paintKennelGate(): void {
    game.paint('dream-gate', 27, 42, (ctx, frame) => {
        ctx.fillStyle = '#2d2225';
        ctx.fillRect(1, 1, 5, 41);
        ctx.fillRect(21, 1, 5, 41);
        ctx.fillRect(4, 1, 19, 4);
        ctx.fillStyle = '#995e3c';
        ctx.fillRect(2, 2, 3, 39);
        ctx.fillRect(22, 2, 3, 39);
        ctx.fillRect(5, 2, 17, 2);
        ctx.fillStyle = '#c28652';
        ctx.fillRect(2, 3, 1, 35);
        ctx.fillRect(22, 3, 1, 35);
        ctx.fillRect(5, 2, 17, 1);
        ctx.fillStyle = '#653e31';
        ctx.fillRect(4, 6, 1, 10);
        ctx.fillRect(24, 13, 1, 14);

        const panelX = frame === 0 ? 5 : 19;
        const panelWidth = frame === 0 ? 17 : 5;
        ctx.fillStyle = '#2d272a';
        ctx.fillRect(panelX, 6, panelWidth, 34);
        ctx.clearRect(panelX + 1, 8, panelWidth - 2, 23);
        ctx.fillStyle = '#685549';
        for (let x = panelX + 1; x < panelX + panelWidth - 1; x += 3) ctx.fillRect(x, 8, 1, 23);
        ctx.fillRect(panelX + 1, 14, panelWidth - 2, 1);
        ctx.fillRect(panelX + 1, 23, panelWidth - 2, 1);
        ctx.fillStyle = '#794d36';
        ctx.fillRect(panelX + 1, 7, panelWidth - 2, 1);
        ctx.fillRect(panelX + 1, 31, panelWidth - 2, 8);
        ctx.fillStyle = '#a77145';
        ctx.fillRect(panelX + 1, 32, panelWidth - 2, 1);
        ctx.fillRect(panelX + 1, 36, panelWidth - 2, 1);
        ctx.fillStyle = '#c69851';
        ctx.fillRect(panelX + panelWidth - 4, 24, 3, 2);
    }, { frames: 2, res: 1 });

    game.pixels('dream-latch', [
        '............', '.....OOO....', '....OGGO....', '....OGO.....', '....OGO.....',
        '..OOOOOOOO..', '.OSGGGGGSO..', '.OGGLOOGSO..', '.OGGLOOGSO..', '.OGGGGGSSO..',
        '..OOOOOOOO..', '............', '............',
    ], RUNE_COLORS, 1);
}

function paintPuzzleStones(): void {
    game.paint('dream-puzzle-pad', 17, 17, (ctx, frame) => {
        ctx.fillStyle = '#463749';
        ctx.fillRect(2, 3, 13, 12);
        ctx.fillRect(4, 2, 9, 14);
        ctx.fillStyle = frame ? '#9a653e' : '#635477';
        ctx.fillRect(3, 4, 11, 10);
        ctx.fillRect(5, 3, 7, 12);
        ctx.fillStyle = frame ? '#ddb476' : '#a398b5';
        ctx.fillRect(5, 4, 7, 9);
        ctx.fillRect(4, 5, 9, 7);
        ctx.fillStyle = frame ? '#efd394' : '#c0b6d0';
        ctx.fillRect(5, 4, 7, 1);
        ctx.fillRect(4, 5, 1, 3);
    }, { frames: 2, res: 1 });
    game.pixels('dream-moon', [
        '............', '....OOO.....', '...OLGO.....', '..OLGO......', '..OLGO......', '..OLGO......',
        '..OLGGO.....', '...OGGGO.O..', '...OGGGGOO..', '....OSSSO...', '.....OOO....', '............',
    ], RUNE_COLORS, 1);
    game.pixels('dream-star', [
        '............', '.....O......', '....OGO.....', '....OLO.....', '.OOOOGOOOO..', '.OSLLLLGSO..',
        '..OOGLGOO...', '...OGGGO....', '...OGOSO....', '..OOOOOOO...', '..OO...OO...', '............',
    ], RUNE_COLORS, 1);
}

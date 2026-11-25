import { game } from './engine.js';
import { UPWARD_PLATFORM_TAG } from './entities/Tokyo.js';
import { DREAM_CLIFF_ART, DREAM_LEDGE_ART } from './dreamArt.js';

type CliffShape = keyof typeof DREAM_CLIFF_ART.variants;
type LedgeShape = keyof typeof DREAM_LEDGE_ART.variants;
type Landing = { id: string; left: number; right: number; top: number }
    & ({ cliff: CliffShape } | { ledge: LedgeShape });
type Section = {
    name: string;
    entry: { x: number; top: number };
    stoneTint: string;
    landings: readonly Landing[];
};

const SECTION_WIDTH = 1280;
const START_BANK: Landing = { id: 'start', left: 0, right: 144, top: 440, cliff: 'bank' };
const DESCENT_BANK: Landing = { id: 'descent-bank', left: -108, right: 102, top: 388, cliff: 'bank' };
const FAR_BANK: Landing = { id: 'far-bank', left: -50, right: 96, top: 360, cliff: 'outcrop' };
const EXIT_BANK: Landing = { id: 'exit', left: 1192, right: SECTION_WIDTH, top: 388, cliff: 'shoulder' };
const LIGHT_LEDGE: Landing = { id: 'light', left: 512, right: 572, top: 200, ledge: 'split' };
export const DARK_PLACE_SECTIONS: readonly Section[] = [
    {
        name: 'The Ledges',
        entry: { x: 72, top: START_BANK.top },
        stoneTint: '#cfb9ff',
        landings: [
            START_BANK,
            { id: 'first-step', left: 230, right: 314, top: 391, cliff: 'needle' },
            { id: 'first-stone', left: 410, right: 480, top: 331, ledge: 'taper' },
            { id: 'middle-bank', left: 571, right: 737, top: 417, cliff: 'outcrop' },
            { id: 'second-stone', left: 836, right: 907, top: 350, ledge: 'split' },
            { id: 'third-stone', left: 1005, right: 1081, top: 315, ledge: 'ridge' },
        ],
    },
    {
        name: 'The Descent',
        entry: { x: 32, top: DESCENT_BANK.top },
        stoneTint: '#bce9ff',
        landings: [
            DESCENT_BANK,
            { id: 'descent-upper', left: 200, right: 290, top: 349, ledge: 'shelf' },
            { id: 'descent-middle', left: 386, right: 480, top: 394, ledge: 'ridge' },
            { id: 'descent-low', left: 588, right: 718, top: 438, cliff: 'shoulder' },
            { id: 'descent-rise', left: 829, right: 925, top: 377, ledge: 'split' },
            { id: 'descent-high', left: 1023, right: 1119, top: 322, ledge: 'shelf' },
        ],
    },
    {
        name: 'The Far Side',
        entry: { x: 30, top: FAR_BANK.top },
        stoneTint: '#ffdeb8',
        landings: [
            FAR_BANK,
            { id: 'far-low', left: 204, right: 314, top: 408, cliff: 'shoulder' },
            { id: 'far-rise', left: 430, right: 522, top: 352, ledge: 'shelf' },
            { id: 'far-high', left: 639, right: 720, top: 297, ledge: 'ridge' },
            LIGHT_LEDGE,
            { id: 'far-landing', left: 835, right: 914, top: 370, cliff: 'needle' },
            { id: 'far-last-stone', left: 1023, right: 1096, top: 326, ledge: 'taper' },
            EXIT_BANK,
        ],
    },
];

const LEDGE_COLLISION_DEPTH = 30;
const CLIFF_COLLISION_DEPTH = 38;
const CLIFF_BELOW_SCREEN = 48;
const PIT_FADE_HEIGHT = 72;
const EDGE_THICKNESS = 32;

export const DARK_PLACE_WIDTH = SECTION_WIDTH * DARK_PLACE_SECTIONS.length;
export const LOWEST_DARK_PLACE_LANDING = Math.max(...DARK_PLACE_SECTIONS.flatMap(section =>
    section.landings.map(landing => landing.top)));
export const DARK_PLACE_EXIT = { x: DARK_PLACE_WIDTH - 48, top: EXIT_BANK.top };
export const DARK_PLACE_LIGHT = {
    x: 2 * SECTION_WIDTH + (LIGHT_LEDGE.left + LIGHT_LEDGE.right) / 2,
    top: LIGHT_LEDGE.top,
};

export function darkPlaceEntry(index: number): { x: number; top: number } {
    const { entry } = DARK_PLACE_SECTIONS[index]!;
    return { x: index * SECTION_WIDTH + entry.x, top: entry.top };
}

export function spawnDarkPlaceTerrain(): void {
    const { height } = game.screen;
    const skyHeight = game.assets.frame('dream-dark').height;
    const landings = DARK_PLACE_SECTIONS.flatMap(({ landings, stoneTint }, index) => landings.map(landing => ({
        ...landing, left: landing.left + index * SECTION_WIDTH, right: landing.right + index * SECTION_WIDTH,
        stoneTint,
    })));

    for (const [index] of DARK_PLACE_SECTIONS.entries()) {
        const leftEdge = index * SECTION_WIDTH;
        const x = leftEdge + SECTION_WIDTH / 2;
        game.spawn({ id: 'dark-place-sky-' + index, texture: 'dream-dark', x, y: skyHeight / 2,
            sx: index % 2 === 0 ? 1 : -1, layer: 'back' });
        game.graphics({ id: 'dark-place-mist-' + index, x, y: height / 2,
            width: SECTION_WIDTH, height, layer: 'back' }).draw(ctx => {
            const mistTop = skyHeight - PIT_FADE_HEIGHT;
            const fog = ctx.createLinearGradient(0, mistTop, 0, height);
            fog.addColorStop(0, '#15134000');
            fog.addColorStop(PIT_FADE_HEIGHT / (height - mistTop), '#131037');
            fog.addColorStop(1, '#09081d');
            ctx.fillStyle = fog;
            ctx.fillRect(0, mistTop, SECTION_WIDTH, height - mistTop);
        });
    }

    for (const landing of landings) {
        const { id, left, right, top, stoneTint } = landing;
        const x = (left + right) / 2;
        const span = right - left;
        const isCliff = 'cliff' in landing;
        // Only the visible rim is solid. The weathered face below drops into the pit.
        const depth = isCliff ? CLIFF_COLLISION_DEPTH : LEDGE_COLLISION_DEPTH;
        game.spawn({ id: 'dark-place-platform-' + id, x, y: top + depth / 2,
            width: span, height: depth, visible: false, layer: 'world',
            tags: isCliff ? ['terrain'] : ['terrain', UPWARD_PLATFORM_TAG],
            body: { type: 'static', friction: 0, oneWay: isCliff ? undefined : 'up' } });

        const art = isCliff ? DREAM_CLIFF_ART : DREAM_LEDGE_ART;
        const variant = isCliff ? DREAM_CLIFF_ART.variants[landing.cliff] : DREAM_LEDGE_ART.variants[landing.ledge];
        const scale = span / variant.rimWidth;
        const artHeight = isCliff
            ? (height + CLIFF_BELOW_SCREEN - top) * art.height / (art.height - art.surfaceY)
            : art.height * scale;
        const rimOffset = art.surfaceY / art.height * artHeight;
        game.spawn({ id: 'dark-place-' + (isCliff ? 'cliff-' : 'ledge-') + id, texture: art.key, frame: variant.frame,
            x, y: top - rimOffset + artHeight / 2, width: art.width * scale,
            height: artHeight, layer: 'world', z: isCliff ? -1 : 0, tint: stoneTint });
    }

    for (const [side, x] of [['left', -EDGE_THICKNESS / 2], ['right', DARK_PLACE_WIDTH + EDGE_THICKNESS / 2]] as const) {
        game.spawn({ id: 'dark-place-edge-' + side, x,
            y: height / 2, width: EDGE_THICKNESS, height, visible: false, layer: 'world',
            body: { type: 'static', friction: 0 } });
    }
}

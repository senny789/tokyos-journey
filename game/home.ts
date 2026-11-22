import { game } from './engine.js';
import type { TokyoToy } from './tokyoArt.js';
import type { HomeRoom } from './homeRooms.js';

export const HOME_FLOOR = 593;
export const HOME_START = 224;
export const HOME_LAMP = 72;
export const HOME_BASKET = 401;
export const HOME_BOWL = 1039;
export const HOME_BED = 1165;
export const FAMILY_FRAME_SIZE = 112;
export const FAMILY_GROUND_OFFSET = 48;
const FAMILY_BASE_FRAMES = 8;
const FAMILY_HOME_FRAMES = 22;
const FAMILY_ROOM_FRAMES = 7;

export const HOME_FAMILY = [
    { id: 'sandesh', name: 'Sandesh', x: 157, line: 'Come here, Tokyo!' },
    { id: 'sushil', name: 'Sushil', x: 308, line: 'There you are, Tokyo!' },
    { id: 'reshika', name: 'Reshika', x: 467, line: 'Good girl, Tokyo!' },
    { id: 'senny', name: 'Senny', x: 625, line: 'Go fetch, Tokyo!' },
    { id: 'dad', name: 'Dad', x: 783, line: 'Tokyo, over here!' },
    { id: 'mom', name: 'Mom', x: 948, line: 'Here’s a treat, Tokyo.' },
] as const;

type FamilyId = typeof HOME_FAMILY[number]['id'];
type HomePhase = 'play' | 'treats' | 'eating' | 'bedtime' | 'sleeping';
export const homePreview: { sofa: FamilyId | null; room: HomeRoom; phase: 'play' | 'treats' | 'bedtime' } =
    { sofa: null, room: 'living', phase: 'play' };

export const home: {
    phase: HomePhase;
    room: HomeRoom;
    lightOn: boolean;
    holding: TokyoToy | null;
    ball: 'ready' | 'windup' | 'flying' | 'floor' | 'carried';
    playedWith: FamilyId[];
} = { phase: 'play', room: 'living', lightOn: true, holding: null, ball: 'ready', playedWith: [] };

const HOME_PROPS = ['plushie', 'ball', 'bowl-full', 'bowl-empty', 'light-switch'] as const;
const HOME_PIXEL_IMAGES = [
    'sofa', 'armchair', 'coffee-table', 'lamp-off', 'lamp-on', 'sideboard', 'bed', 'rug', 'basket',
    'laptop-desk', 'pc-desk', 'vanity', 'wardrobe', 'bed-sandesh', 'bed-sushil', 'bed-parents', 'bed-shared',
    'music-keyboard', 'sushil-pc-desk',
] as const;

const FURNITURE = [
    { key: 'rug', x: 634, bottom: 631, width: 526 },
    { key: 'sofa', x: 420, bottom: 568, width: 336 },
    { key: 'armchair', x: 828, bottom: 569, width: 164 },
    { key: 'coffee-table', x: 595, bottom: 585, width: 198 },
    { key: 'sideboard', x: 1072, bottom: 557, width: 211 },
    { key: 'bed', x: HOME_BED, bottom: 607, width: 145 },
    { key: 'basket', x: HOME_BASKET, bottom: 599, width: 61 },
] as const;

export async function loadHomeArt(): Promise<void> {
    await game.assets.load([
        { kind: 'image', key: 'home-room', url: 'assets/home/room.png' },
        ...HOME_PROPS.map(key => ({ kind: 'image' as const, key: `home-${key}`, url: `assets/home/pixel-${key}.png` })),
        ...HOME_PIXEL_IMAGES.map(key => ({
            kind: 'image' as const, key: `home-pixel-${key}`, url: `assets/home/pixel-${key}.png`,
        })),
        ...HOME_FAMILY.map(({ id }) => ({
            kind: 'image' as const, key: `family-${id}`, url: `assets/family/${id}.png`,
            w: FAMILY_FRAME_SIZE, h: FAMILY_FRAME_SIZE, cols: FAMILY_BASE_FRAMES, rows: 1,
        })),
        ...HOME_FAMILY.map(({ id }) => ({
            kind: 'image' as const, key: `family-home-${id}`, url: `assets/family/${id}-home-motion.png`,
            w: FAMILY_FRAME_SIZE, h: FAMILY_FRAME_SIZE, cols: FAMILY_HOME_FRAMES, rows: 1,
        })),
        ...HOME_FAMILY.map(({ id }) => ({
            kind: 'image' as const, key: `family-room-${id}`, url: `assets/family/${id}-room.png`,
            w: FAMILY_FRAME_SIZE, h: FAMILY_FRAME_SIZE, cols: FAMILY_ROOM_FRAMES, rows: 1,
        })),
    ]);
}

export function spawnHomeRoom() {
    game.background.picture('home-room', 'stretch');
    for (const { key, x, bottom, width } of FURNITURE) {
        const spec = { id: `home-${key}`, texture: `home-pixel-${key}`, x, y: bottom, width, layer: 'world' as const, z: 1 };
        const item = game.spawn(spec);
        item.y -= item.height / 2;
    }
    const lamp = game.spawn({ id: 'home-lamp', texture: 'home-pixel-lamp-on', x: HOME_LAMP + 36, y: 439, height: 250, layer: 'world', z: 2 });
    game.spawn({ id: 'home-light-switch', texture: 'home-light-switch', x: HOME_LAMP, y: 387, width: 24, layer: 'world', z: 2 });
    const shade = game.spawn({ id: 'home-shade', texture: 'white', x: 640, y: 360, width: 1280, height: 720,
        tint: '#1d213e', alpha: 0, layer: 'front', z: 100 });
    return { lamp, shade };
}

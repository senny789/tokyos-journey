export const HOME_ROOM_WIDTH = 1408;
export const HOME_WALK_Y = 624;

export const HOME_ROOMS = [
    { id: 'living', name: 'Living room', wall: '#edbb8f', accent: '#b77e59' },
    { id: 'sandesh', name: 'Sandesh’s room', wall: '#d9b68d', accent: '#9b774e' },
    { id: 'sushil', name: 'Sushil’s room', wall: '#c1b892', accent: '#788166' },
    { id: 'parents', name: 'Mom and Dad’s room', wall: '#deb29e', accent: '#ac776f' },
    { id: 'senny-reshu', name: 'Senny and Reshu’s room', wall: '#d8b09e', accent: '#a8797b' },
] as const;

export type HomeRoom = typeof HOME_ROOMS[number]['id'];
export const HOME_WIDTH = HOME_ROOM_WIDTH * HOME_ROOMS.length;

export function roomX(id: HomeRoom, localX: number): number {
    return HOME_ROOMS.findIndex(room => room.id === id) * HOME_ROOM_WIDTH + localX;
}

export const HOME_ENTRY = 310;
export const HOME_LIGHT_SWITCH = 62;
export const HOME_TOY_BASKET = 432;
export const HOME_SOFA_SEAT_X = 826;
export const HOME_SOFA_FEET = HOME_WALK_Y - 6;
export const HOME_TREATS = roomX('senny-reshu', 1120);
export const HOME_DOG_BED = roomX('senny-reshu', 1248);
export const HOME_DOG_BED_TOP = HOME_WALK_Y - 40;

export const HOME_STATIONS = {
    sandesh: { x: roomX('sandesh', 516), scale: 2.55, name: 'Sandesh', activity: 'On a client call',
        line: 'I’ll send the update this afternoon. Hi, Tokyo!', prompt: 'Say hello',
        pace: 0.5, labelHeight: 215 },
    sushil: { x: roomX('sushil', 555), scale: 2.45, name: 'Sushil', activity: 'Playing guitar',
        line: 'That song’s for you, Tokyo.', prompt: 'Say hello',
        pace: 0.24, labelHeight: 218 },
    mom: { x: roomX('parents', 331), scale: 2.29, name: 'Mom', activity: 'Doing yoga',
        line: 'Breathe in, breathe out. Your treats are by your bed.', prompt: 'Say hello',
        pace: 0.68, labelHeight: 250 },
    dad: { x: roomX('parents', 1041), scale: 2.47, name: 'Dad', activity: 'Doing push-ups',
        line: 'One more rep, then a pat for you.', prompt: 'Say hello',
        pace: 0.25, labelHeight: 176 },
    reshika: { x: roomX('senny-reshu', 230), scale: 2.36, name: 'Reshu', activity: 'Doing makeup',
        line: 'Just a little blush. Good girl, Tokyo!', prompt: 'Say hello',
        pace: 0.48, labelHeight: 201 },
    senny: { x: roomX('senny-reshu', 567), scale: 2.5, name: 'Senny', activity: 'Creating on the PC',
        line: 'I’m making a game! Want to play fetch?', prompt: 'Play fetch',
        pace: 0.32, labelHeight: 212 },
} as const;

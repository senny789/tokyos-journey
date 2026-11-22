import { game } from './engine.js';
import { UPWARD_PLATFORM_TAG } from './entities/Tokyo.js';
import { paintHomeDoors } from './homeDoors.js';
import { paintHomePromptKeys } from './homePrompt.js';
import {
    HOME_DOG_BED, HOME_DOG_BED_TOP, HOME_LIGHT_SWITCH, HOME_ROOMS, HOME_ROOM_WIDTH, HOME_SOFA_SEAT_X,
    HOME_STATIONS, HOME_TOY_BASKET, HOME_WALK_Y, roomX,
} from './homeRooms.js';

const HEIGHT = 720;
const ROOM_PIXEL = 4;
const WALL_BOTTOM = HOME_WALK_Y - 24;
const FLOOR_BOARD_HEIGHT = 24;
const NIGHTSTAND_TOP = HOME_WALK_Y - 56;
const LAMP_HEIGHT = 218;
const BED_TOP_THICKNESS = 12;
const DOG_BED_CUSHION_WIDTH = 102;
const WOOD = '#603e35';
const TRIM = '#a56c4c';
const LAMP_X = 92;
const FLOOR_BOARDS = ['#a56e52', '#b27b59', '#aa7253', '#b57e5c'];
export const HOME_DIALOGUE_WIDTH = 220;
export const HOME_DIALOGUE_HEIGHT = 64;
const DIALOGUE_TAIL = 14;

const FURNITURE = [
    { key: 'armchair', x: 158, width: 154 },
    { key: 'coffee-table', x: 302, width: 136 },
    { key: 'basket', x: HOME_TOY_BASKET, width: 75, bottom: HOME_WALK_Y + 4 },
    { key: 'rug', x: 784, width: 458, height: 44, bottom: HOME_WALK_Y + 43 },
    { key: 'sofa', x: HOME_SOFA_SEAT_X + 16, width: 324 },
    { key: 'sideboard', x: 1128, width: 192 },
    { key: 'sideboard', x: roomX('parents', 196), width: 156 },
    { key: 'bed', x: HOME_DOG_BED, width: 168, bottom: HOME_WALK_Y + 12 },
] as const;

const ROOM_FIXTURES = [
    { key: 'wardrobe', room: 'sandesh', x: 274 },
    { key: 'laptop-desk', room: 'sandesh', x: 749 },
    { key: 'bed-sandesh', room: 'sandesh', x: 1080, mattress: { left: -60, right: 132, lift: 128 } },
    { key: 'music-keyboard', room: 'sushil', x: 250 },
    { key: 'sushil-pc-desk', room: 'sushil', x: 714 },
    { key: 'bed-sushil', room: 'sushil', x: 1008, mattress: { left: -58, right: 138, lift: 120 } },
    { key: 'bed-parents', room: 'parents', x: 674, mattress: { left: -20, right: 152, lift: 156 } },
    { key: 'vanity', room: 'senny-reshu', x: 309 },
    { key: 'pc-desk', room: 'senny-reshu', x: 657 },
    { key: 'bed-shared', room: 'senny-reshu', x: 1056, mattress: { left: -58, right: 132, lift: 132 } },
] as const;

export function paintHomeInterior(): void {
    paintHomeDoors();
    paintHomePromptKeys();
    for (const room of HOME_ROOMS) {
        game.paint(`home-room-${room.id}`, HOME_ROOM_WIDTH / ROOM_PIXEL, HEIGHT / ROOM_PIXEL, ctx => {
            function rect(color: string, x: number, y: number, w: number, h: number): void {
                const left = Math.round(x / ROOM_PIXEL);
                const top = Math.round(y / ROOM_PIXEL);
                ctx.fillStyle = color;
                ctx.fillRect(left, top, Math.max(1, Math.round((x + w) / ROOM_PIXEL) - left),
                    Math.max(1, Math.round((y + h) / ROOM_PIXEL) - top));
            }

            function frame(x: number, y: number, w: number, h: number): void {
                rect('#70473344', x + 8, y + 8, w, h);
                rect(WOOD, x, y, w, h);
                rect(TRIM, x + 4, y + 4, w - 8, h - 8);
                rect('#d39a6a', x + 8, y + 8, w - 16, 4);
                rect('#493531', x + 8, y + 12, w - 16, h - 20);
            }

            function shelf(x: number, y: number, colors: string[]): void {
                for (const [i, color] of colors.entries()) {
                    const h = 24 + i * 9 % 24;
                    const left = x + 12 + i * 16;
                    rect(WOOD, left, y - h, 16, h);
                    rect(color, left + 4, y - h + 4, 8, h - 4);
                    rect('#eed5a48a', left + 4, y - h + 8, 8, 4);
                }
                const width = colors.length * 16 + 28;
                rect('#9e623f55', x + 4, y + 8, width, 8);
                rect(WOOD, x, y, width, 12);
                rect(TRIM, x, y, width, 4);
                for (const support of [x + 16, x + width - 28]) rect('#95654b', support, y + 12, 12, 16);
            }

            function print(x: number, y: number, color: string): void {
                frame(x, y, 112, 100);
                rect('#efd8b2', x + 12, y + 16, 88, 72);
                rect(color, x + 24, y + 28, 64, 48);
                rect('#f3c484', x + 64, y + 32, 12, 12);
                rect('#6a7d68', x + 24, y + 60, 64, 16);
                rect('#8f9b74', x + 28, y + 52, 28, 12);
                rect('#526755', x + 52, y + 64, 36, 12);
            }

            function window(x: number, y: number, w: number, curtain: string): void {
                const h = 184;
                frame(x, y, w, h);
                const sky = ['#546e79', '#708b91', '#a2a097', '#d1aa8c', '#e7b888', '#efc494'];
                for (const [i, color] of sky.entries()) rect(color, x + 12, y + 12 + i * 26, w - 24, 26);
                rect('#f9d99f', x + w - 78, y + 85, 20, 20);
                rect('#f9d99f', x + w - 74, y + 81, 12, 28);
                const hills = [24, 20, 28, 34, 40, 28, 20, 20, 32, 40, 44, 48];
                for (const [i, rise] of hills.entries()) {
                    const span = (w - 24) / hills.length;
                    rect('#617d72', x + 12 + i * span, y + h - 12 - rise, span, rise);
                    rect('#49685b', x + 12 + i * span, y + h - 12 - rise / 2, span, rise / 2);
                }
                rect(WOOD, x + w / 2 - 4, y + 8, 8, h - 12);
                rect(WOOD, x + 8, y + 80, w - 16, 8);
                rect(WOOD, x - 8, y + h - 4, w + 16, 12);
                rect('#bd8159', x - 8, y + h - 4, w + 16, 4);
                rect(WOOD, x - 16, y - 12, w + 32, 8);
                for (const edge of [x - 8, x + w - 24]) {
                    rect(curtain, edge, y - 4, 32, h - 10);
                    rect('#27202e29', edge + 20, y - 4, 8, h - 10);
                    rect('#f4d3ba39', edge + 4, y - 4, 8, h - 10);
                    rect('#dfad75', edge, y + 110, 32, 8);
                }
            }

            function corkboard(x: number, y: number): void {
                frame(x, y, 184, 106);
                rect('#aa8056', x + 12, y + 16, 160, 78);
                for (const [dx, dy, w, h, color] of [
                    [20, 24, 44, 48, '#e9d6af'], [72, 36, 35, 50, '#d7a07d'], [119, 24, 36, 42, '#a2b09a'],
                ] as const) {
                    rect('#855a4399', x + dx + 4, y + dy + 4, w, h);
                    rect(color, x + dx, y + dy, w, h);
                    rect('#825d4d', x + dx + 8, y + dy + 12, w - 16, 4);
                    rect('#825d4d', x + dx + 8, y + dy + 20, w - 20, 4);
                    rect('#9a5445', x + dx + 16, y + dy + 4, 4, 4);
                }
            }

            function nightstand(x: number, y: number, color: string): void {
                rect(WOOD, x, y, 68, 52);
                rect(color, x + 4, y + 4, 60, 36);
                rect('#c39469', x + 4, y + 4, 60, 4);
                rect('#e6b87f', x + 26, y + 19, 16, 4);
                rect('#6a4437', x + 4, y + 49, 8, 8);
                rect('#6a4437', x + 56, y + 49, 8, 8);
                rect(WOOD, x + 31, y - 36, 6, 34);
                rect(WOOD, x + 21, y - 6, 26, 6);
                rect('#9d6c51', x + 16, y - 38, 37, 14);
                rect('#d7a16d', x + 20, y - 50, 29, 23);
                rect('#f4cf93', x + 24, y - 54, 21, 22);
                rect('#aa764c', x + 16, y - 30, 37, 4);
            }

            function seat(x: number, y: number, color: string, back = false): void {
                rect(WOOD, x - 28, y + 4, 12, HOME_WALK_Y - y - 4);
                rect(WOOD, x + 20, y + 4, 12, HOME_WALK_Y - y - 4);
                if (back) {
                    rect(WOOD, x - 40, y - 88, 24, 92);
                    rect(color, x - 36, y - 84, 16, 68);
                }
                rect(WOOD, x - 36, y, 76, 12);
                rect(color, x - 32, y - 4, 68, 8);
            }

            function mat(x: number, y: number, w: number, color: string): void {
                rect('#66473570', x - 4, y + 4, w + 8, 36);
                rect(WOOD, x, y, w, 32);
                rect(color, x + 4, y + 4, w - 8, 24);
                rect('#f2cdb660', x + 16, y + 8, w - 32, 4);
                rect('#392d4338', x + 4, y + 24, w - 8, 4);
            }

            function plant(x: number, y: number): void {
                rect('#576949', x - 4, y - 76, 8, 56);
                rect('#657953', x - 24, y - 64, 24, 12);
                rect('#829067', x - 32, y - 72, 28, 12);
                rect('#617954', x + 4, y - 56, 24, 12);
                rect('#82926c', x + 12, y - 64, 24, 12);
                rect('#49634d', x - 24, y - 44, 20, 8);
                rect('#98604a', x - 16, y - 28, 32, 28);
                rect('#b97254', x - 20, y - 32, 40, 8);
                rect('#c58864', x - 12, y - 24, 8, 20);
            }

            rect(room.wall, 0, 0, HOME_ROOM_WIDTH, WALL_BOTTOM);
            for (let row = 21; row < WALL_BOTTOM / ROOM_PIXEL; row++) {
                for (let col = 0; col < HOME_ROOM_WIDTH / ROOM_PIXEL; col++) {
                    const mixed = Math.imul(col + 47, 0x45d9f3b) ^ Math.imul(row + 19, 0x27d4eb2d);
                    const speck = ((mixed ^ (mixed >>> 16)) >>> 0) % 97;
                    if (speck < 4) rect('#a0624534', col * ROOM_PIXEL, row * ROOM_PIXEL, ROOM_PIXEL, ROOM_PIXEL);
                    else if (speck < 10) rect('#fff0b850', col * ROOM_PIXEL, row * ROOM_PIXEL, ROOM_PIXEL, ROOM_PIXEL);
                }
            }
            rect(room.accent, 0, 0, HOME_ROOM_WIDTH, 78);
            rect('#593d3733', 0, 70, HOME_ROOM_WIDTH, 8);
            rect('#ffe0ac80', 0, 78, HOME_ROOM_WIDTH, 4);
            rect('#855a4633', 0, WALL_BOTTOM - 36, HOME_ROOM_WIDTH, 36);
            rect(WOOD, 0, WALL_BOTTOM, HOME_ROOM_WIDTH, HOME_WALK_Y - WALL_BOTTOM);
            rect(TRIM, 0, WALL_BOTTOM + 4, HOME_ROOM_WIDTH, 4);
            for (const x of [0, HOME_ROOM_WIDTH - 20]) {
                rect('#755141', x, 82, 20, HOME_WALK_Y - 82);
                rect('#bc8a66', x + 4, 82, 8, HOME_WALK_Y - 82);
            }
            for (const [row, color] of FLOOR_BOARDS.entries()) {
                const y = HOME_WALK_Y + row * FLOOR_BOARD_HEIGHT;
                rect(color, 0, y, HOME_ROOM_WIDTH, FLOOR_BOARD_HEIGHT);
                rect('#88553d', 0, y + FLOOR_BOARD_HEIGHT - 4, HOME_ROOM_WIDTH, 4);
                rect('#ca936744', 0, y + 4, HOME_ROOM_WIDTH, 4);
                for (let x = -128 + row * 83 % 256; x < HOME_ROOM_WIDTH; x += 256) {
                    rect('#83523a', x, y, 4, FLOOR_BOARD_HEIGHT - 4);
                    rect('#d398685b', x + 28, y + 8, 92, 4);
                    rect('#79463430', x + 128, y + 18, 78, 4);
                }
            }
            switch (room.id) {
                case 'living':
                    shelf(116, 262, ['#9a5746', '#627e70', '#d49a5f', '#a66b66', '#536a67', '#ca965f', '#956355']);
                    shelf(172, 332, ['#a66b66', '#d49a5f', '#536a67', '#9a5746', '#627e70']);
                    print(469, 202, '#89a19a');
                    window(687, 161, 285, '#9e5348');
                    print(1136, 203, '#8eaa91');
                    plant(1010, HOME_WALK_Y);
                    break;
                case 'sandesh': {
                    const x = HOME_STATIONS.sandesh.x - roomX(room.id, 0);
                    window(959, 153, 262, '#8b7662');
                    shelf(192, 256, ['#626d7b', '#a37655', '#85655c', '#556c66', '#bc9258', '#7d8670']);
                    corkboard(664, 232);
                    print(449, 197, '#8b9681');
                    mat(401, HOME_WALK_Y, 471, '#8e7774');
                    seat(x - 16, HOME_WALK_Y - 49, '#86665b', true);
                    break;
                }
                case 'sushil': {
                    const x = HOME_STATIONS.sushil.x - roomX(room.id, 0);
                    window(920, 146, 269, '#64776c');
                    frame(305, 179, 145, 120);
                    rect('#b27855', 320, 195, 114, 88);
                    rect('#432f31', 340, 200, 74, 72);
                    rect('#604449', 348, 208, 58, 56);
                    rect('#dbac68', 365, 225, 24, 24);
                    rect('#fff0bc', 373, 233, 8, 8);
                    shelf(611, 264, ['#b97b61', '#627e70', '#d49a5f', '#a66b66', '#536a67', '#d29d76']);
                    shelf(167, 328, ['#817371', '#b66f54', '#718471', '#c29c6e', '#aa8868']);
                    mat(273, HOME_WALK_Y, 480, '#9a845a');
                    seat(x - 26, HOME_WALK_Y - 47, '#9a6a4d');
                    const ampX = 344;
                    const ampY = HOME_WALK_Y - 110;
                    frame(ampX, ampY, 128, 102);
                    rect('#61565a', ampX + 12, ampY + 19, 104, 74);
                    rect('#3a3537', ampX + 29, ampY + 29, 70, 55);
                    for (let grille = 33; grille < 82; grille += 8) rect('#544b50', ampX + 32, ampY + grille, 64, 4);
                    rect('#daad70', ampX + 16, ampY + 19, 12, 4);
                    rect('#2a2327', ampX + 45, ampY - 4, 30, 8);
                    nightstand(1180, NIGHTSTAND_TOP, '#bb865e');
                    plant(805, HOME_WALK_Y);
                    break;
                }
                case 'parents':
                    window(532, 145, 297, '#926779');
                    print(152, 220, '#9d927b');
                    print(288, 175, '#a2aa85');
                    print(960, 197, '#bca17c');
                    nightstand(891, NIGHTSTAND_TOP, '#ad755d');
                    mat(209, HOME_WALK_Y, 244, '#688a81');
                    mat(893, HOME_WALK_Y, 306, '#8c667a');
                    plant(1216, HOME_WALK_Y);
                    break;
                case 'senny-reshu': {
                    const reshu = HOME_STATIONS.reshika.x - roomX(room.id, 0);
                    const senny = HOME_STATIONS.senny.x - roomX(room.id, 0);
                    window(968, 137, 272, '#966e86');
                    print(166, 190, '#aeb3a1');
                    shelf(306, 223, ['#bb805a', '#936f76', '#977b66', '#a99179', '#b67376']);
                    seat(reshu - 20, HOME_WALK_Y - 45, '#a76b79');
                    corkboard(700, 222);
                    shelf(527, 246, ['#6b7d7a', '#b8805c', '#965f66', '#e0ad68', '#697282']);
                    seat(senny - 30, HOME_WALK_Y - 44, '#687b73', true);
                    mat(892, HOME_WALK_Y, 407, '#8f7483');
                    break;
                }
            }
        }, { res: 1 });
    }

    game.paint('home-foot-shadow', 100, 20, ctx => {
        ctx.fillStyle = '#57383155';
        ctx.beginPath();
        ctx.ellipse(50, 10, 49, 8, 0, 0, Math.PI * 2);
        ctx.fill();
    });
    game.paint('home-dialogue-box', HOME_DIALOGUE_WIDTH + DIALOGUE_TAIL * 2, HOME_DIALOGUE_HEIGHT, ctx => {
        const left = DIALOGUE_TAIL + 1;
        const right = left + HOME_DIALOGUE_WIDTH - 2;
        const bottom = HOME_DIALOGUE_HEIGHT - 5;
        ctx.beginPath();
        ctx.moveTo(left + 5, 2);
        ctx.lineTo(right - 5, 2);
        ctx.lineTo(right, 7);
        ctx.lineTo(right, bottom - 5);
        ctx.lineTo(right - 5, bottom);
        ctx.lineTo(left + 5, bottom);
        ctx.lineTo(left, bottom - 5);
        ctx.lineTo(left, bottom - 9);
        ctx.lineTo(2, bottom - 5);
        ctx.lineTo(left, bottom - 23);
        ctx.lineTo(left, 7);
        ctx.closePath();
        ctx.fillStyle = '#fff1d6';
        ctx.shadowColor = '#4d322b55';
        ctx.shadowOffsetY = 3;
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#634638';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.stroke();
    }, { res: 1 });
}

function spawnBedTop(id: string, x: number, y: number, width: number): void {
    game.spawn({ id: `home-bed-top-${id}`, x, y: y + BED_TOP_THICKNESS / 2,
        width, height: BED_TOP_THICKNESS, layer: 'world', visible: false, tags: [UPWARD_PLATFORM_TAG],
        body: { type: 'static', friction: 0, oneWay: 'up' } });
}

export function spawnHomeInterior() {
    for (const room of HOME_ROOMS) {
        const texture = `home-room-${room.id}`;
        game.spawn({ id: texture, texture, x: roomX(room.id, HOME_ROOM_WIDTH / 2), y: HEIGHT / 2,
            scale: ROOM_PIXEL, layer: 'back' });
    }
    for (const fixture of ROOM_FIXTURES) {
        const x = roomX(fixture.room, fixture.x);
        const item = game.spawn({ id: `home-${fixture.key}`, texture: `home-pixel-${fixture.key}`,
            x, y: HOME_WALK_Y, scale: ROOM_PIXEL, layer: 'world', z: 2 });
        item.y -= item.height * ROOM_PIXEL / 2;
        if ('mattress' in fixture) {
            const { left, right, lift } = fixture.mattress;
            spawnBedTop(fixture.room, x + (left + right) / 2, HOME_WALK_Y - lift, right - left);
        }
    }
    for (const piece of FURNITURE) {
        const item = game.spawn({ id: `home-${piece.key === 'sideboard' ? `sideboard-${piece.x}` : piece.key}`, texture: `home-pixel-${piece.key}`,
            x: piece.x, y: 'bottom' in piece ? piece.bottom : HOME_WALK_Y,
            width: piece.width, height: 'height' in piece ? piece.height : undefined,
            layer: 'world', z: piece.key === 'bed' ? 3 : 1 });
        item.y -= item.height / 2;
    }
    spawnBedTop('tokyo', HOME_DOG_BED, HOME_DOG_BED_TOP, DOG_BED_CUSHION_WIDTH);
    const lamp = game.spawn({ id: 'home-lamp', texture: 'home-pixel-lamp-on', x: LAMP_X,
        y: HOME_WALK_Y - LAMP_HEIGHT / 2, height: LAMP_HEIGHT, layer: 'world', z: 2 });
    game.spawn({ id: 'home-light-switch', texture: 'home-light-switch', x: HOME_LIGHT_SWITCH, y: 420,
        width: 22, layer: 'world', z: 2 });
    const shade = game.spawn({ id: 'home-shade', texture: 'white', x: game.screen.width / 2, y: HEIGHT / 2,
        width: game.screen.width, height: HEIGHT, tint: '#24203e', alpha: 0, layer: 'hud' });
    return { lamp, shade };
}

export function spawnHomeFootShadow(x: number, width: number) {
    return game.spawn({ id: 'home-foot-shadow', texture: 'home-foot-shadow', x,
        y: HOME_WALK_Y + 2, width, layer: 'world', z: 3 });
}

import { game } from './engine.js';
import { UPWARD_PLATFORM_TAG } from './entities/Tokyo.js';
import { KENNEL_FLOOR, KENNEL_HEIGHT, KENNEL_ROOMS, KENNEL_ROOM_WIDTH } from './kennelRooms.js';

const ART_SCALE = 2;
const PLATFORM_DEPTH = 18;
const BANK_DEPTH = 76;
const EDGE_WIDTH = 32;
const LEDGE_W = 128, LEDGE_H = 34, LEDGE_SURFACE = 3;
const UNDERFLOOR = KENNEL_HEIGHT - KENNEL_FLOOR;

export function paintKennelFloors(): void {
    game.paint('kennel-door-frame', 65, 275, ctx => {
        ctx.fillStyle = '#17121b';
        ctx.fillRect(17, 0, 31, 179);
        ctx.fillRect(7, 177, 51, 98);
        ctx.fillStyle = '#463139';
        ctx.fillRect(18, 0, 7, 179);
        ctx.fillRect(40, 0, 7, 179);
        ctx.fillStyle = '#634839';
        ctx.fillRect(18, 0, 2, 179);
        ctx.fillStyle = '#2d232a';
        for (let y = 18; y < 170; y += 41) ctx.fillRect(19, y, 27, 5);
    }, { res: 1 });
    for (const [index, room] of KENNEL_ROOMS.entries()) {
        game.paint('kennel-floor-art-' + index, KENNEL_ROOM_WIDTH / ART_SCALE, UNDERFLOOR / ART_SCALE, ctx => {
            const h = UNDERFLOOR / ART_SCALE;
            const w = KENNEL_ROOM_WIDTH / ART_SCALE;
            const [rim, face, seam] = room.stone;
            ctx.fillStyle = index === 2 ? '#172b34' : '#231923';
            ctx.fillRect(0, 0, w, h);
            // The shafts recede behind the cut faces of the walkable banks.
            for (let row = 0; row < h; row += 14) {
                ctx.fillStyle = row < h / 2 ? '#121119' : '#100e16';
                ctx.fillRect(0, row, w, 3);
                for (let x = row % 4 ? 22 : 0; x < w; x += 44) ctx.fillRect(x, row, 2, 14);
            }
            for (const [left, right] of room.banks) {
                const x = Math.floor(left / ART_SCALE);
                const width = Math.ceil(right / ART_SCALE) - x;
                ctx.save();
                ctx.beginPath();
                ctx.rect(x, 0, width, h);
                ctx.clip();
                ctx.fillStyle = face;
                ctx.fillRect(x, 0, width, h);
                for (let row = 13; row < h; row += 13) {
                    ctx.fillStyle = seam;
                    ctx.fillRect(x, row, width, 2);
                    for (let joint = x + (row % 2 ? 14 : 30); joint < x + width; joint += 37) {
                        ctx.fillRect(joint, row, 2, 13);
                    }
                }
                ctx.fillStyle = seam;
                ctx.fillRect(x + 3, 11, 3, h);
                ctx.fillRect(x + width - 6, 11, 3, h);
                ctx.fillStyle = rim;
                ctx.fillRect(x, 0, width, 3);
                ctx.fillRect(x, 3, 4, 11);
                ctx.fillRect(x + width - 4, 3, 4, 11);
                ctx.fillStyle = seam;
                ctx.fillRect(x, 7, width, 4);
                ctx.restore();
            }
            const depth = ctx.createLinearGradient(0, 14, 0, h);
            depth.addColorStop(0, '#0b0d1700');
            depth.addColorStop(1, '#0b0d17dd');
            ctx.fillStyle = depth;
            ctx.fillRect(0, 14, w, h - 14);
            if (index === 2) {
                room.banks.slice(0, -1).forEach(([, right], gap) => {
                    const left = Math.ceil(right / ART_SCALE), end = Math.floor(room.banks[gap + 1]![0] / ART_SCALE);
                    ctx.fillStyle = '#17303d';
                    ctx.fillRect(left, h - 13, end - left, 13);
                    ctx.fillStyle = '#345663';
                    for (let x = left + 6; x + 16 < end; x += 27) ctx.fillRect(x, h - 12, 16, 1);
                });
            }
        }, { res: 1 });
    }
}

export function spawnKennelTerrain(index: number): void {
    const room = KENNEL_ROOMS[index]!;
    game.background.color('#100e16');
    game.spawn({ id: 'kennel-background', texture: 'kennel-room-' + index, x: KENNEL_ROOM_WIDTH / 2,
        y: KENNEL_FLOOR / 2, width: KENNEL_ROOM_WIDTH, height: KENNEL_FLOOR, layer: 'back' });
    game.spawn({ id: 'kennel-floor-art', texture: 'kennel-floor-art-' + index, x: KENNEL_ROOM_WIDTH / 2,
        y: KENNEL_FLOOR + UNDERFLOOR / 2, width: KENNEL_ROOM_WIDTH, height: UNDERFLOOR, layer: 'world' });
    for (const [i, [left, right]] of room.banks.entries()) {
        game.spawn({ id: 'kennel-bank-' + (i + 1), x: (left + right) / 2, y: KENNEL_FLOOR + BANK_DEPTH / 2,
            width: right - left, height: BANK_DEPTH, visible: false, layer: 'world',
            body: { type: 'static', friction: 0 } });
    }
    const ledges = [...room.ledges];
    if (room.longJumpLedge) ledges.push(room.longJumpLedge);
    if (room.orbLedge) ledges.push(room.orbLedge);
    ledges.push(room.switchLedge);
    for (const [index, [x, top, width]] of ledges.entries()) {
        const id = index === ledges.length - 1 ? 'switch' : String(index + 1);
        game.spawn({ id: 'kennel-platform-' + id, x, y: top + PLATFORM_DEPTH / 2,
            width, height: PLATFORM_DEPTH, visible: false, layer: 'world', tags: [UPWARD_PLATFORM_TAG],
            body: { type: 'static', friction: 0, oneWay: 'up' } });
        const scale = width / (LEDGE_W - 8);
        game.spawn({ id: 'kennel-ledge-' + id, texture: 'kennel-timber-ledge',
            x, y: top + (LEDGE_H / 2 - LEDGE_SURFACE) * scale,
            width: LEDGE_W * scale, height: LEDGE_H * scale, layer: 'world', z: 3 });
    }
    for (const x of [-EDGE_WIDTH / 2, KENNEL_ROOM_WIDTH + EDGE_WIDTH / 2]) {
        game.spawn({ x, y: KENNEL_HEIGHT / 2, width: EDGE_WIDTH, height: KENNEL_HEIGHT, visible: false,
            layer: 'world', body: { type: 'static', friction: 0 } });
    }
}

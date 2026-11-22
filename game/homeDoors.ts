import { game } from './engine.js';
import { HOME_ROOMS, HOME_ROOM_WIDTH, HOME_WALK_Y, roomX, type HomeRoom } from './homeRooms.js';

const PIXEL = 4;
const DOOR_WIDTH = 144;
const DOOR_HEIGHT = 340;
const DOOR_INSET = 88;
const BARRIER_WIDTH = 32;
export const HOME_DOOR_RANGE = 108;
export const HOME_DOOR_PROMPT_Y = HOME_WALK_Y - 128;
export const HOME_DOOR_ENTER_RANGE = 24;
export const HOME_DOOR_CLOSE_RANGE = 148;
export const HOME_DOOR_ARRIVAL_OFFSET = 68;

export function paintHomeDoors(): void {
    game.paint('home-doorway', DOOR_WIDTH / PIXEL, DOOR_HEIGHT / PIXEL, (ctx, frame) => {
        const sill = DOOR_HEIGHT / PIXEL;
        function rect(color: string, x: number, y: number, w: number, h: number): void {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, w, h);
        }
        rect('#493227', 0, 0, 36, sill);
        rect('#ad7851', 1, 1, 34, sill - 2);
        rect('#d5a578', 2, 2, 32, 2);
        rect('#ce9667', 2, 4, 2, sill - 6);
        rect('#865939', 32, 4, 2, sill - 6);
        rect('#372821', 5, 6, 26, sill - 8);
        if (frame === 0) {
            rect('#8e5c3d', 6, 7, 24, sill - 9);
            rect('#ac764d', 7, 7, 22, sill - 10);
            for (const [y, h] of [[12, 29], [48, 28]]) {
                rect('#704732', 10, y, 16, h);
                rect('#996640', 11, y + 1, 14, h - 2);
                rect('#c58c5a', 12, y + 2, 12, 1);
                rect('#825438', 23, y + 3, 1, h - 6);
            }
            rect('#5b3d2e', 25, 43, 4, 5);
            rect('#f0ca77', 25, 44, 3, 2);
        } else {
            rect('#674a3d', 12, 10, 17, sill - 14);
            rect('#4f392e', 12, sill - 17, 17, 3);
            rect('#9b6f50', 10, sill - 14, 19, 5);
            rect('#b78c64', 8, sill - 9, 22, 6);
            rect('#704a34', 6, 7, 6, sill - 10);
            rect('#b58155', 7, 7, 2, sill - 10);
            rect('#dec27f', 9, 44, 2, 2);
        }
        rect('#694732', 4, sill - 2, 28, 1);
        rect('#d0a370', 4, sill - 1, 28, 1);
    }, { res: 1, frames: 2 });
}

function spawnDoorFace(room: HomeRoom, next: HomeRoom, localX: number, facing: -1 | 1) {
    const x = roomX(room, localX);
    const id = `home-door-${room}-to-${next}`;
    const door = game.spawn({ id, texture: 'home-doorway', x, y: HOME_WALK_Y - DOOR_HEIGHT / 2,
        sx: PIXEL * facing, sy: PIXEL, layer: 'world', z: 1, data: { open: false, next } });
    function spawnBarrier() {
        return game.spawn({ id: `${id}-barrier`, x, y: HOME_WALK_Y / 2, width: BARRIER_WIDTH,
            height: HOME_WALK_Y, visible: false, layer: 'world', body: { type: 'static', friction: 0 } });
    }
    let barrier = spawnBarrier();
    return {
        room,
        x,
        get open() { return door.data.open; },
        setOpen(open: boolean) {
            if (door.data.open === open) return;
            if (open) barrier.destroy();
            else barrier = spawnBarrier();
            door.data.open = open;
            door.setFrame(open ? 1 : 0);
        },
    };
}

export function spawnHomeDoors() {
    return HOME_ROOMS.slice(1).flatMap((room, index) => {
        const previous = HOME_ROOMS[index];
        const left = spawnDoorFace(previous.id, room.id, HOME_ROOM_WIDTH - DOOR_INSET, 1);
        const right = spawnDoorFace(room.id, previous.id, DOOR_INSET, -1);
        return [
            { from: left, to: right, facing: 1 as const },
            { from: right, to: left, facing: -1 as const },
        ];
    });
}

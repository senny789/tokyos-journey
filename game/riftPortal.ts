import { game } from './engine.js';

export const RIFT_PORTAL_ART = {
    kind: 'image', key: 'rift-portal', url: 'assets/rift-portal.png',
    w: 64, h: 80, cols: 4, rows: 1,
} as const;

const ART_HEIGHT = 74;
const BASELINE = 76;
const PULSE_FPS = 5;
const PORTAL_DEPTH = 4;
const TURN = Math.PI * 2;
const HOVER_PERIOD = 2.65;
const HOVER_CLEARANCE = 0.05;
const HOVER_TRAVEL = 0.10;
const HOVER_TILT = 0.035;
const HALO_SIZE = 1.32;
const HALO_TINT = '#74eccf';
const HALO_ALPHA = 0.36;
const HALO_PULSE = 0.18;
const FLOW_PERIOD = 1.55;
const FLOW_TRAVEL_X = 0.16;
const FLOW_TRAVEL_Y = 0.45;
const FLOW_BEND = 0.054;
const FLOWS = [
    { phase: 0, offset: -0.055, width: 0.29, height: 0.065, angle: -0.65, tint: '#b6fff1' },
    { phase: 0.49, offset: 0.055, width: 0.21, height: 0.042, angle: -0.85, tint: '#fff0b3' },
];
const MOTES = [
    { period: 3.5, phase: 0.10, rx: 0.34, ry: 0.42, size: 0.063, tint: '#ffdf96' },
    { period: 3.9, phase: 0.63, rx: 0.33, ry: 0.39, size: 0.05, tint: '#abfff0' },
];

export function spawnRiftPortal(id: string, x: number, groundY: number, artHeight: number) {
    const scale = artHeight / ART_HEIGHT;
    const restY = groundY - (BASELINE - RIFT_PORTAL_ART.h / 2) * scale;
    const y = restY - artHeight * HOVER_CLEARANCE;
    const first = game.assets.frames(RIFT_PORTAL_ART.key);
    const halo = game.spawn({
        id: id + '-halo', texture: 'particle:soft', x, y, width: artHeight * HALO_SIZE,
        layer: 'world', z: PORTAL_DEPTH - 1, tint: HALO_TINT, alpha: HALO_ALPHA, blend: 'add', visible: false,
    });
    const portal = game.spawn({
        id, texture: RIFT_PORTAL_ART.key, x, y,
        scale, layer: 'world', z: PORTAL_DEPTH, data: { open: false },
        anims: {
            sealed: { frames: [first], fps: PULSE_FPS, hold: true },
            open: { frames: [first + 1, first + 2, first + 3, first + 2], fps: PULSE_FPS },
        },
    });
    const effects = { x, y, layer: 'world', z: PORTAL_DEPTH + 1, alpha: 0, blend: 'add', visible: false } as const;
    const flows = FLOWS.map((flow, index) => ({
        ...flow,
        sprite: game.spawn({
            ...effects, id: id + '-flow-' + index, texture: 'particle:soft', tint: flow.tint,
            width: artHeight * flow.width, height: artHeight * flow.height, rot: flow.angle,
        }),
    }));
    const motes = MOTES.map((mote, index) => ({
        ...mote,
        sprite: game.spawn({
            ...effects, id: id + '-mote-' + index, texture: 'particle:flare', tint: mote.tint,
            width: artHeight * mote.size,
        }),
    }));

    let elapsed = 0;
    game.step(id + '-hover', dt => {
        elapsed += dt;
        const hoverAngle = elapsed * TURN / HOVER_PERIOD;
        const rise = (1 - Math.cos(hoverAngle)) / 2;
        portal.y = restY - artHeight * (HOVER_CLEARANCE + HOVER_TRAVEL * rise);
        portal.rot = HOVER_TILT * Math.sin(hoverAngle);
        if (!portal.data.open) return;

        halo.y = portal.y;
        halo.alpha = HALO_ALPHA + HALO_PULSE * rise;
        for (const { sprite, phase, offset, angle } of flows) {
            const progress = (elapsed / FLOW_PERIOD + phase) % 1;
            const bend = Math.sin(progress * TURN);
            sprite.x = portal.x + artHeight * (offset + (progress - 0.5) * FLOW_TRAVEL_X + bend * FLOW_BEND);
            sprite.y = portal.y + artHeight * (0.5 - progress) * FLOW_TRAVEL_Y;
            sprite.rot = angle + 0.17 * bend + portal.rot;
            sprite.alpha = 0.74 * Math.sin(progress * Math.PI) ** 2;
        }
        for (const { sprite, period, phase, rx, ry } of motes) {
            const angle = (elapsed / period + phase) * TURN;
            sprite.x = portal.x + artHeight * rx * Math.cos(angle);
            sprite.y = portal.y + artHeight * ry * Math.sin(angle);
            sprite.rot = angle / 2;
            sprite.alpha = 0.24 + 0.50 * Math.sin(angle * 2) ** 2;
        }
    });

    return Object.assign(portal, {
        setOpen(open: boolean): void {
            if (portal.data.open === open) return;
            portal.data.open = open;
            halo.y = portal.y;
            halo.visible = open;
            for (const { sprite } of flows) sprite.visible = open;
            for (const { sprite } of motes) sprite.visible = open;
            portal.play(open ? 'open' : 'sealed');
        },
    });
}

import { game } from '../engine.js';
import { INTERACT_SOUND, KENNEL_SWITCH_SOUND, RIFT_SOUND } from '../actionAudio.js';
import { playDreamFall, playDreamRespawn } from '../dreamFall.js';
import { startKennelMusic } from '../dreamMusic.js';
import { showTokyoOrbLight, spawnDreamOrb } from '../dreamOrb.js';
import { showDreamTitle, spawnDreamPrompt } from '../dreamPresentation.js';
import { run, spawnTokyo } from '../entities/Tokyo.js';
import { FAMILY_GROUND_OFFSET } from '../home.js';
import { completeDreamStage, journey, prepareDreamStage } from '../journey.js';
import { playKennelOpening } from '../kennelOpening.js';
import { playKennelReunion } from '../kennelReunion.js';
import { KENNEL_ENTRY_X, KENNEL_FLOOR, KENNEL_HEIGHT, KENNEL_ROOMS, KENNEL_ROOM_WIDTH } from '../kennelRooms.js';
import { spawnKennelTerrain } from '../kennelTerrain.js';
import { getTouchOverride, isMobileView } from '../mobile.js';
import { spawnRiftPortal } from '../riftPortal.js';

const GRAVITY = 1500;
const FALL_Y = 621;
const RANGE = 55;
const DOOR_RANGE = 88;
const SURFACE_TOLERANCE = 10;
const TOKYO_SCALE = 1.3;
const FAMILY_SCALE = 1.4;
const GATE_SCALE = 4.6;
const GATE_HEIGHT = 42 * GATE_SCALE;
const GATE_POST_HEIGHT = KENNEL_FLOOR - GATE_HEIGHT;
const LOCKED = '#ffbb64';
const OPEN = '#99f4cf';
const JUMP = { launchSpeed: 610, releaseSpeed: 440 };
const FAMILY_X = KENNEL_ROOM_WIDTH - 128;
const EXIT_X = KENNEL_ROOM_WIDTH - 57;
const PORTAL_HEIGHT = 122;
const SWITCH_SCALE = 2;
const ORB_ID = 'kennel-orb';

type Entry = { index: number; switchOn: boolean; orbCollected: boolean; afterFall: boolean };
const FIRST_ROOM: Entry = { index: 0, switchOn: false, orbCollected: false, afterFall: false };
let nextEntry = FIRST_ROOM;
let carryMusic = false;
let stopMusic: (() => void) | undefined;
export const kennelProgress = { room: 1, switchOn: false, orbCollected: false, phase: 'playing' };

function returnToKennel(entry: Entry): void {
    nextEntry = entry;
    carryMusic = true;
    game.scenes.go('kennel');
}

export function openKennelSection(section: number): string {
    const room = KENNEL_ROOMS[section - 1];
    if (!room) return 'Choose room 1, 2, or 3.';
    nextEntry = { ...FIRST_ROOM, index: section - 1 };
    prepareDreamStage(2);
    return 'Started ' + room.name;
}

function spawnKennelDoor(x: number, open: boolean) {
    game.spawn({ id: 'kennel-door-frame', texture: 'kennel-door-frame', x,
        y: KENNEL_FLOOR / 2, width: 130, height: KENNEL_FLOOR, layer: 'world', z: 5 });
    const gate = game.spawn({ id: 'kennel-door', texture: 'dream-gate', x,
        y: KENNEL_FLOOR - GATE_HEIGHT / 2, scale: GATE_SCALE, layer: 'world', z: 6, frame: open ? 1 : 0 });
    const wall = open ? null : game.spawn({ id: 'kennel-door-collision', x,
        y: KENNEL_FLOOR - GATE_HEIGHT / 2, width: 32, height: GATE_HEIGHT,
        visible: false, layer: 'world', body: { type: 'static', friction: 0 } });
    game.spawn({ id: 'kennel-door-header', x, y: GATE_POST_HEIGHT / 2,
        width: 32, height: GATE_POST_HEIGHT, visible: false, layer: 'world',
        body: { type: 'static', friction: 0 } });
    const lamp = game.spawn({ id: 'kennel-door-lamp', texture: 'particle:disc', x,
        y: KENNEL_FLOOR - GATE_HEIGHT - 10, width: 13, height: 13, layer: 'world', z: 7,
        tint: open ? OPEN : LOCKED });

    return {
        x,
        unlock(): void {
            gate.setFrame(1);
            wall?.destroy();
            lamp.tint = OPEN;
        },
    };
}

export const Kennel = {
    name: 'kennel',
    enter(): void {
        stopMusic ??= startKennelMusic();
        const { index, switchOn, orbCollected, afterFall } = nextEntry;
        nextEntry = FIRST_ROOM;
        const room = KENNEL_ROOMS[index]!;
        const opening = index === 0 && !afterFall;
        Object.assign(kennelProgress, { room: index + 1, switchOn, orbCollected,
            phase: opening ? 'opening' : afterFall ? 'respawning' : 'playing' });
        const [switchX, switchTop] = room.switchLedge;
        const finalRoom = room.gateX === undefined;
        let interactRequested = false;
        let wasInteract = false;
        let showLongJumpHint = false;
        run.scene = 'journey';
        game.camera.snap(game.screen.width / 2, KENNEL_HEIGHT / 2, 1);
        game.rig.bounds({ x: 0, y: 0, w: KENNEL_ROOM_WIDTH, h: KENNEL_HEIGHT });
        game.physics.gravity(0, GRAVITY);
        game.ui.pauseButton();
        game.ui.muteButton();
        spawnKennelTerrain(index);

        const tokyo = spawnTokyo(KENNEL_ENTRY_X, KENNEL_FLOOR,
            () => kennelProgress.phase === 'playing', TOKYO_SCALE, JUMP);
        if (orbCollected) showTokyoOrbLight(tokyo, ORB_ID);
        const status = game.text('', 34, 68, {
            size: 17, font: 'mono-bold', align: 'left', color: LOCKED,
            stroke: { color: '#18121f', width: 3 },
        });
        const roomName = game.text(room.name.toUpperCase(), 34, 38, {
            size: 26, font: 'mono-bold', align: 'left', color: '#fff0cd',
            stroke: { color: '#18121f', width: 3 },
        });

        const door = room.gateX === undefined ? null : spawnKennelDoor(room.gateX, switchOn);
        const switchGlow = game.spawn({ id: 'kennel-switch-glow', texture: 'particle:soft', x: switchX,
            y: switchTop - 33, width: 128, height: 111, alpha: 0.48, blend: 'add', layer: 'world', z: 7 });
        const lever = game.spawn({ id: 'kennel-switch', texture: 'kennel-lever', x: switchX,
            y: switchTop - 34, scale: SWITCH_SCALE, layer: 'world', z: 8 });
        const rescued = () => journey.rescued.includes('sandesh');
        const sandesh = finalRoom && !rescued() ? game.spawn({ id: 'dream-family-sandesh', texture: 'family-sandesh', x: FAMILY_X,
            y: KENNEL_FLOOR - FAMILY_GROUND_OFFSET * FAMILY_SCALE,
            layer: 'world', z: 7, sx: -FAMILY_SCALE, sy: FAMILY_SCALE }) : null;
        const portal = finalRoom ? spawnRiftPortal('journey-exit-portal', EXIT_X, KENNEL_FLOOR, PORTAL_HEIGHT) : null;
        const orbLedge = room.orbLedge;
        const orb = orbLedge && !orbCollected ? spawnDreamOrb(ORB_ID, orbLedge[0], orbLedge[1]) : null;
        const orbCage = orbLedge && !orbCollected ? game.spawn({
            id: 'kennel-orb-cage', texture: 'dream-gate', x: orbLedge[0], y: orbLedge[1] - 35,
            width: 62, height: 70, layer: 'world', z: 8, frame: switchOn ? 1 : 0,
        }) : null;
        const prompt = spawnDreamPrompt(() => { interactRequested = true; });

        function updateGoal(): void {
            const on = kennelProgress.switchOn;
            const color = on ? OPEN : LOCKED;
            switchGlow.tint = color;
            lever.setFrame(on ? 1 : 0);
            status.color = color;
            status.text = !on ? finalRoom ? 'Flip the switch to release the orb' : 'Climb to the switch'
                : !finalRoom ? 'Door unlocked'
                : !kennelProgress.orbCollected ? 'Run + Jump to the glowing orb'
                : showLongJumpHint ? 'Hold Run + Jump to clear the drain'
                : rescued() ? 'Enter the rift' : 'Rift open · Find Sandesh';
        }
        function flipSwitch(): void {
            game.sound.play(KENNEL_SWITCH_SOUND);
            kennelProgress.switchOn = true;
            door?.unlock();
            orbCage?.setFrame(1);
            updateGoal();
            game.particles.burst({ x: switchX, y: lever.y, count: 16, layer: 'front',
                frame: 'particle:spark', color: [LOCKED, OPEN], speed: [40, 120], lifespan: [0.3, 0.7] });
        }
        function advance(): void {
            returnToKennel({ ...FIRST_ROOM, index: index + 1 });
        }

        portal?.setOpen(orbCollected);
        updateGoal();
        if (opening && door) {
            status.visible = roomName.visible = false;
            playKennelOpening(tokyo, door.x, GATE_POST_HEIGHT, () => {
                game.rig.follow(tokyo);
                status.visible = roomName.visible = true;
                showDreamTitle('The Kennel');
                kennelProgress.phase = 'playing';
            });
        } else {
            game.rig.follow(tokyo);
        }
        if (afterFall) playDreamRespawn(tokyo, () => { kennelProgress.phase = 'playing'; });
        game.step('kennel-world', dt => {
            game.touch.visible = kennelProgress.phase === 'playing' && (getTouchOverride() ?? isMobileView());
            if (game.controls.justPressed('pause')) {
                game.scenes.push('pause');
                return;
            }
            if (kennelProgress.phase !== 'playing') return;
            const { x, feet, grounded } = tokyo.data;
            if (feet > FALL_Y) {
                kennelProgress.phase = 'falling';
                prompt.hide();
                game.touch.visible = false;
                playDreamFall(tokyo, () => {
                    returnToKennel({ index, switchOn: kennelProgress.switchOn,
                        orbCollected: kennelProgress.orbCollected, afterFall: true });
                });
                return;
            }
            const pressed = game.controls.pressed('interact');
            const interact = interactRequested || game.controls.justPressed('interact') || (pressed && !wasInteract);
            wasInteract = pressed;
            interactRequested = false;
            const near = (target: number, surface: number, range = RANGE) =>
                grounded && Math.abs(x - target) <= range && Math.abs(feet - surface) <= SURFACE_TOLERANCE;
            const on = kennelProgress.switchOn;
            if (on && orb?.tryCollect(tokyo)) {
                kennelProgress.orbCollected = true;
                orbCage?.destroy();
                portal?.setOpen(true);
                updateGoal();
            }
            const longJump = room.longJumpLedge;
            const atLongJump = Boolean(longJump && near(longJump[0], longJump[1]));
            if (atLongJump !== showLongJumpHint) {
                showLongJumpHint = atLongJump;
                updateGoal();
            }
            if (!on && near(switchX, switchTop)) {
                if (prompt.show('Flip switch', switchX, switchTop - 62, dt) || interact) {
                    flipSwitch();
                }
            } else if (door && near(door.x, KENNEL_FLOOR, DOOR_RANGE)) {
                const tapped = prompt.show(on ? 'Enter door' : 'Find the switch',
                    door.x, KENNEL_FLOOR - GATE_HEIGHT, dt);
                if (on && (tapped || interact)) {
                    game.sound.play(INTERACT_SOUND);
                    advance();
                }
            } else if (sandesh && !rescued() && near(FAMILY_X, KENNEL_FLOOR)) {
                if (prompt.show('Greet Sandesh', FAMILY_X, KENNEL_FLOOR - 135, dt) || interact) {
                    kennelProgress.phase = 'reunion';
                    prompt.hide();
                    status.text = 'Reunited with Sandesh';
                    playKennelReunion(tokyo, sandesh, () => {
                        journey.rescued.push('sandesh');
                        kennelProgress.phase = 'playing';
                        updateGoal();
                    });
                }
            } else if (portal && near(EXIT_X, KENNEL_FLOOR)) {
                const ready = kennelProgress.orbCollected && rescued();
                const tapped = prompt.show(ready ? 'Enter the rift' : kennelProgress.orbCollected ? 'Greet Sandesh first' : 'Find the glowing orb',
                    EXIT_X, KENNEL_FLOOR - PORTAL_HEIGHT, dt);
                if (ready && (tapped || interact)) {
                    game.sound.play(RIFT_SOUND);
                    completeDreamStage();
                }
            } else {
                prompt.hide();
            }
        }, { after: 'rig-follow.camera' });
    },
    exit(): void {
        if (!carryMusic) {
            stopMusic?.();
            stopMusic = undefined;
        }
        carryMusic = false;
        game.touch.visible = false;
    },
};

import { game } from '../engine.js';
import { getSettings } from '../settings.js';
import { TOKYO_ART_SCALE, TOKYO_CARRY_CROUCH_START, type TokyoToy } from '../tokyoArt.js';
import { spawnDroppings } from './Droppings.js';

const WALK_SPEED = 160, RUN_SPEED = 300, CROUCH_SPEED = 70;
const ACCELERATION = 1500, BRAKING = 2200;
const DEFAULT_JUMP = { launchSpeed: 570, releaseSpeed: 220 };
const RISING_FRAME_SPEED = 220;
const COYOTE_TIME = 0.10, JUMP_BUFFER = 0.12;
const STAND_HEIGHT = 60, CROUCH_HEIGHT = 41, BODY_WIDTH = 76;
const SPRITE_SCALE = 1.5, FOOT_OFFSET = 39, SIT_TRANSITION = 0.20;
const CROUCH_TRANSITION = 0.24;
const WALK_STRIDE = 144, RUN_STRIDE = 172, CRAWL_STRIDE = 80;
const MOTION_EPSILON = 0.01;
const POOP_DURATION = 0.85, POOP_DROP_TIME = 0.42, POOP_COOLDOWN = 1.15;
const FOOT_PROBE_OFFSET = BODY_WIDTH / 2 - 4;
const POOP_TOUCH_X = 315, POOP_TOUCH_Y = 265, POOP_TOUCH_RADIUS = 36;
export const UPWARD_PLATFORM_TAG = 'one-way-up';

export type TokyoState = 'idle' | 'walking' | 'running' | 'jumping' | 'crouching' | 'sitting' | 'pooping';
export type TokyoData = {
    state: TokyoState; elapsed: number; facing: number; grounded: boolean; crouched: boolean;
    seated: boolean; sitPhase: 'down' | 'hold' | 'up'; sitTime: number;
    poopTime: number; poopCooldown: number;
    coyote: number; jumpBuffer: number; jumpLock: number; landing: number; postureGrace: number;
    crouchAmount: number; crouchMotion: 'none' | 'lowering' | 'idle' | 'crawling' | 'rising'; gait: number;
    x: number; feet: number; vx: number; vy: number; frame: number; carrying: TokyoToy | null;
    runToggled: boolean; crouchToggled: boolean; sprinting: boolean;
};
export const run: { spawnX: number; tokyo: TokyoData | null; scene: 'play' | 'meadow' | 'home' | 'journey' } = { spawnX: 220, tokyo: null, scene: 'play' };

function makeBody(x: number, feet: number, height: number, vx = 0, vy = 0) {
    // Terrain only: a replaced posture body can survive until the step ends.
    // Letting the old and new player bodies collide creates an upward impulse.
    return game.spawn({ id: 'tokyo-body', x, y: feet - height / 2, width: BODY_WIDTH, height,
        visible: false, layer: 'world', tags: ['tokyo-body'],
        body: { fixedRotation: true, friction: 0, restitution: 0, mass: 1, vx, vy, bullet: true,
            category: 2, mask: 1 } });
}
function initialData(x: number, feet: number): TokyoData {
    return { state: 'idle', elapsed: 0, facing: 1, grounded: false, crouched: false, seated: false,
        poopTime: 0, poopCooldown: 0,
        sitPhase: 'hold', sitTime: 0, coyote: 0, jumpBuffer: 0, jumpLock: 0, landing: 0, postureGrace: 0,
        crouchAmount: 0, crouchMotion: 'none', gait: 0,
        x, feet, vx: 0, vy: 0, frame: 0, carrying: null,
        runToggled: false, crouchToggled: false, sprinting: false };
}
function approach(value: number, target: number, amount: number): number {
    return value < target ? Math.min(value + amount, target) : Math.max(value - amount, target);
}
function animationFrame(d: TokyoData): number {
    switch (d.state) {
        case 'walking': return 8 + Math.floor(d.gait * 8);
        case 'running': return 16 + Math.floor(d.gait * 8);
        case 'jumping':
            if (d.landing > 0) return 31;
            if (d.jumpLock > 0.083) return 24;
            if (d.jumpLock > 0.05) return 25;
            if (d.vy < -RISING_FRAME_SPEED) return 26;
            if (d.vy < -50) return 27;
            if (d.vy < 90) return 28;
            return d.vy < 300 ? 29 : 30;
        case 'crouching':
            if (d.crouchMotion === 'lowering' || d.crouchMotion === 'rising') return Math.min(7, Math.floor(d.crouchAmount * 8));
            return d.crouchMotion === 'crawling' ? 8 + Math.floor(d.gait * 8) : 7;
        case 'sitting':
            if (d.sitPhase === 'down') return 40 + Math.min(1, Math.floor(d.sitTime / SIT_TRANSITION * 2));
            if (d.sitPhase === 'up') return 46 + Math.min(1, Math.floor(d.sitTime / SIT_TRANSITION * 2));
            return 42 + Math.floor(d.elapsed * 3) % 4;
        case 'pooping':
            if (d.poopTime < SIT_TRANSITION) return 46 + Math.min(1, Math.floor((1 - d.poopTime / SIT_TRANSITION) * 2));
            if (d.poopTime > POOP_DURATION - SIT_TRANSITION) return 40 + Math.floor((POOP_DURATION - d.poopTime) / SIT_TRANSITION * 2);
            return 42;
        default: return Math.floor(d.elapsed * 5) % 8;
    }
}
export function spawnTokyo(
    x: number, feet: number, canControl?: () => boolean, visualScale = SPRITE_SCALE, jumpProfile = DEFAULT_JUMP,
) {
    const scaleRatio = visualScale / SPRITE_SCALE;
    const artScale = visualScale * TOKYO_ART_SCALE;
    const sprite = game.spawn({ id: 'tokyo', texture: 'tokyo', x, y: feet - FOOT_OFFSET * scaleRatio,
        layer: 'world', z: 10, scale: artScale, tags: ['tokyo'], data: initialData(x, feet) });
    let body = makeBody(x, feet, STAND_HEIGHT);
    let height = STAND_HEIGHT;
    let wasJump = false, wasSit = false, wasRun = false, wasCrouch = false, wasPoop = false;
    const d = sprite.data;
    run.tokyo = d;
    function showPose(): void {
        const crouching = d.state === 'crouching';
        if (d.carrying) {
            sprite.setTexture(`tokyo-carry-${d.carrying}`, d.frame + (crouching ? TOKYO_CARRY_CROUCH_START : 0));
        } else {
            sprite.setTexture(crouching ? 'tokyo-crouch' : 'tokyo', d.frame);
        }
    }
    game.touch.button({ code: 'Touch:poop', label: 'POOP', anchor: 'bottom-right',
        x: POOP_TOUCH_X, y: POOP_TOUCH_Y, r: POOP_TOUCH_RADIUS, tint: '#e7dfb8' });
    const floorAt = (x: number) => {
        const feetY = body.y + height / 2;
        const hit = game.physics.raycast(x, feetY - 4, 0, 1, 8, h => h.id !== body.id);
        return hit && hit.ny < -0.5 ? hit : null;
    };
    // A short foot probe also covers the frame when a resized or sleeping body
    // has no fresh contact manifold. It never grants support while ascending.
    const hasSupport = (): boolean => {
        if (body.body.vy < -1) return false;
        return Boolean(floorAt(body.x - FOOT_PROBE_OFFSET) || floorAt(body.x) || floorAt(body.x + FOOT_PROBE_OFFSET));
    };
    const canStand = (): boolean => {
        const feetY = body.y + height / 2;
        for (const offset of [-BODY_WIDTH / 2 + 2, 0, BODY_WIDTH / 2 - 2]) {
            if (game.physics.raycast(body.x + offset, feetY - height + 1, 0, -1,
                STAND_HEIGHT - height + 2, h => h.id !== body.id && !h.tags.has(UPWARD_PLATFORM_TAG))) return false;
        }
        return true;
    };
    const resizeBody = (nextHeight: number): void => {
        if (height === nextHeight) return;
        const x = body.x, feetY = body.y + height / 2;
        const vx = body.body.vx, vy = body.body.vy;
        body.destroy();
        body = makeBody(x, feetY, nextHeight, vx, vy);
        height = nextHeight; d.postureGrace = 0.05;
    };
    game.step('tokyo-controls', dt => {
        if (canControl && !canControl()) {
            body.body.vx = 0;
            return;
        }
        const settings = getSettings();
        const move = game.controls.axis('move').x;
        const runRaw = game.controls.pressed('run');
        const runJustPressed = game.controls.justPressed('run') || (runRaw && !wasRun);
        wasRun = runRaw;

        if (settings.runBehavior === 'toggle') {
            if (runJustPressed) {
                d.runToggled = !d.runToggled;
            }
        } else {
            d.runToggled = false;
        }

        const sprint = settings.runBehavior === 'toggle'
            ? (d.runToggled || runRaw)
            : runRaw;
        d.sprinting = sprint;

        const jump = game.controls.pressed('jump'), jumpPressed = game.controls.justPressed('jump') || (jump && !wasJump);
        wasJump = jump;

        const crouchRaw = game.controls.pressed('crouch');
        const crouchJustPressed = game.controls.justPressed('crouch') || (crouchRaw && !wasCrouch);
        wasCrouch = crouchRaw;

        if (settings.crouchBehavior === 'toggle') {
            if (crouchJustPressed) {
                if (d.crouchToggled) {
                    if (canStand()) d.crouchToggled = false;
                } else {
                    d.crouchToggled = true;
                }
            }
            if (jumpPressed && canStand() && d.crouchToggled) {
                d.crouchToggled = false;
            }
        } else {
            d.crouchToggled = false;
        }

        const crouch = settings.crouchBehavior === 'toggle'
            ? (d.crouchToggled || crouchRaw)
            : crouchRaw;

        const sit = game.controls.pressed('sit'), sitPressed = game.controls.justPressed('sit') || (sit && !wasSit);
        wasSit = sit;
        const poop = game.controls.pressed('poop');
        const poopPressed = game.controls.justPressed('poop') || (poop && !wasPoop);
        wasPoop = poop;
        const wasGrounded = d.grounded;
        d.jumpLock = Math.max(0, d.jumpLock - dt);
        d.postureGrace = Math.max(0, d.postureGrace - dt);
        d.grounded = (body.body.grounded || hasSupport() || d.postureGrace > 0 && Math.abs(body.body.vy) < 80) && d.jumpLock === 0;
        d.landing = !wasGrounded && d.grounded ? 0.09 : Math.max(0, d.landing - dt);
        d.coyote = d.grounded ? COYOTE_TIME : Math.max(0, d.coyote - dt);
        d.poopCooldown = Math.max(0, d.poopCooldown - dt);
        if (d.poopTime > 0 && !d.grounded) d.poopTime = 0;
        if (d.poopTime > 0) {
            const previousTime = d.poopTime;
            d.poopTime = Math.max(0, previousTime - dt);
            const dropAt = POOP_DURATION - POOP_DROP_TIME;
            if (previousTime > dropAt && d.poopTime <= dropAt) {
                const rearOffset = d.facing * FOOT_PROBE_OFFSET;
                const floor = floorAt(body.x - rearOffset) ?? floorAt(body.x) ?? floorAt(body.x + rearOffset);
                if (floor) spawnDroppings(floor.x, floor.y);
            }
            if (d.poopTime === 0) d.poopCooldown = POOP_COOLDOWN;
            return;
        }
        if (poopPressed && d.poopCooldown === 0 && d.grounded && !jumpPressed && !crouch && d.crouchAmount === 0) {
            d.poopTime = POOP_DURATION;
            d.jumpBuffer = 0;
            d.seated = false;
            d.sitPhase = 'hold';
            body.body.vx = 0;
            return;
        }
        d.jumpBuffer = jumpPressed ? JUMP_BUFFER : Math.max(0, d.jumpBuffer - dt);
        if (sitPressed && d.grounded && d.crouchAmount === 0 && !crouch) {
            d.seated = !d.seated; d.sitPhase = d.seated ? 'down' : 'up'; d.sitTime = 0;
        }
        if (d.seated && (Math.abs(move) > 0.1 || jumpPressed || crouch || !d.grounded)) {
            d.seated = false; d.sitPhase = 'up'; d.sitTime = 0;
            if (jumpPressed) d.jumpBuffer = SIT_TRANSITION + JUMP_BUFFER;
        }
        d.sitTime += dt;
        if (d.sitPhase === 'down' && d.sitTime >= SIT_TRANSITION) d.sitPhase = 'hold';
        const wasLow = d.crouched || d.crouchAmount > 0;
        const ceilingBlocksStanding = wasLow && !canStand();
        d.crouched = !d.seated && (crouch && (d.grounded || wasLow) || ceilingBlocksStanding);
        if (jumpPressed && wasLow && !crouch && !ceilingBlocksStanding) d.jumpBuffer = CROUCH_TRANSITION + JUMP_BUFFER;
        d.crouchAmount = approach(d.crouchAmount, d.crouched ? 1 : 0, dt / CROUCH_TRANSITION);
        // Shrink before lowering, and restore full collision height only after
        // the standing animation finishes and the ceiling remains clear.
        resizeBody(d.crouchAmount > 0 ? CROUCH_HEIGHT : STAND_HEIGHT);
        const standingUp = !d.seated && d.sitPhase === 'up' && d.sitTime < SIT_TRANSITION;
        const uprightSpeed = sprint ? RUN_SPEED : WALK_SPEED;
        const speed = uprightSpeed + (CROUCH_SPEED - uprightSpeed) * d.crouchAmount;
        const target = d.seated || standingUp ? 0 : move * speed;
        body.body.vx = approach(body.body.vx, target, (Math.abs(move) > 0.1 ? ACCELERATION : BRAKING) * dt);
        if (Math.abs(move) > 0.1 && !d.seated) d.facing = move < 0 ? -1 : 1;
        if (d.jumpBuffer > 0 && d.coyote > 0 && d.crouchAmount === 0 && !d.seated && !standingUp) {
            body.body.vy = -jumpProfile.launchSpeed; d.coyote = 0; d.jumpBuffer = 0; d.jumpLock = 0.1;
            d.grounded = false; d.landing = 0;
        }
        if (!jump && body.body.vy < -jumpProfile.releaseSpeed) body.body.vy = -jumpProfile.releaseSpeed;
    }, { before: 'physics-2d' });
    game.step('tokyo-visual', dt => {
        const distance = Math.abs(body.x - d.x);
        d.x = body.x; d.feet = body.y + height / 2; d.vx = body.body.vx; d.vy = body.body.vy;
        const moving = distance > MOTION_EPSILON && Math.abs(d.vx) > 5;
        const stride = d.crouchAmount > 0 ? CRAWL_STRIDE : d.sprinting ? RUN_STRIDE : WALK_STRIDE;
        if (d.grounded && moving && !d.seated) d.gait = (d.gait + distance / stride) % 1;
        d.crouchMotion = d.crouchAmount === 0 ? 'none'
            : !d.crouched ? 'rising'
            : d.crouchAmount < 1 ? 'lowering'
            : moving ? 'crawling' : 'idle';
        const standingUp = !d.seated && d.sitPhase === 'up' && d.sitTime < SIT_TRANSITION;
        let next: TokyoState = 'idle';
        if (d.poopTime > 0) next = 'pooping';
        else if (!d.grounded || d.landing > 0) next = 'jumping';
        else if (d.seated || standingUp) next = 'sitting';
        else if (d.crouchAmount > 0) next = 'crouching';
        else if (Math.abs(d.vx) > 12) next = d.sprinting ? 'running' : 'walking';
        d.elapsed = next === d.state ? d.elapsed + dt : 0; d.state = next;
        d.frame = animationFrame(d);
        sprite.x = Math.round(d.x); sprite.y = Math.round(d.feet - FOOT_OFFSET * scaleRatio);
        sprite.sx = d.facing * artScale;
        sprite.sy = artScale;
        showPose();
    }, { after: 'physics-2d', before: 'rig-follow.camera' });
    return Object.assign(sprite, {
        carry(toy: TokyoToy | null): void {
            d.carrying = toy;
            showPose();
        },
        warpTo(x: number, feet: number, facing: -1 | 1): void {
            body.x = x;
            body.y = feet - height / 2;
            body.body.vx = 0;
            body.body.vy = 0;
            d.x = x;
            d.feet = feet;
            d.vx = 0;
            d.vy = 0;
            d.facing = facing;
            sprite.x = x;
            sprite.y = feet - FOOT_OFFSET * scaleRatio;
            sprite.sx = facing * artScale;
        },
    });
}

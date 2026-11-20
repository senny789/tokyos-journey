import { game } from '../engine.js';

const WALK_SPEED = 160, RUN_SPEED = 300, CROUCH_SPEED = 70;
const ACCELERATION = 1500, BRAKING = 2200, JUMP_SPEED = 570;
const COYOTE_TIME = 0.10, JUMP_BUFFER = 0.12;
const STAND_HEIGHT = 60, CROUCH_HEIGHT = 28, BODY_WIDTH = 76;
const SPRITE_SCALE = 1.5, FOOT_OFFSET = 39, SIT_TRANSITION = 0.20;
const CROUCH_TRANSITION = 0.24;
const WALK_STRIDE = 144, RUN_STRIDE = 172, CRAWL_STRIDE = 80;
const MOTION_EPSILON = 0.01;

export type TokyoState = 'idle' | 'walking' | 'running' | 'jumping' | 'crouching' | 'sitting';
export type TokyoData = {
    state: TokyoState; elapsed: number; facing: number; grounded: boolean; crouched: boolean;
    seated: boolean; sitPhase: 'down' | 'hold' | 'up'; sitTime: number;
    coyote: number; jumpBuffer: number; jumpLock: number; landing: number; postureGrace: number;
    crouchAmount: number; crouchMotion: 'none' | 'lowering' | 'idle' | 'crawling' | 'rising'; gait: number;
    x: number; feet: number; vx: number; vy: number; frame: number;
};
export const run: { spawnX: number; tokyo: TokyoData | null } = { spawnX: 220, tokyo: null };

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
        sitPhase: 'hold', sitTime: 0, coyote: 0, jumpBuffer: 0, jumpLock: 0, landing: 0, postureGrace: 0,
        crouchAmount: 0, crouchMotion: 'none', gait: 0,
        x, feet, vx: 0, vy: 0, frame: 0 };
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
            if (d.vy < -220) return 26;
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
        default: return Math.floor(d.elapsed * 5) % 8;
    }
}
export function spawnTokyo(x: number, feet: number) {
    const sprite = game.spawn({ id: 'tokyo', texture: 'tokyo', x, y: feet - FOOT_OFFSET,
        layer: 'world', z: 10, scale: SPRITE_SCALE, tags: ['tokyo'], data: initialData(x, feet) });
    let body = makeBody(x, feet, STAND_HEIGHT);
    let height = STAND_HEIGHT;
    let wasJump = false, wasSit = false;
    const d = sprite.data;
    run.tokyo = d;
    // A short foot probe also covers the frame when a resized or sleeping body
    // has no fresh contact manifold. It never grants support while ascending.
    const hasSupport = (): boolean => {
        if (body.body.vy < -1) return false;
        const feetY = body.y + height / 2;
        for (const offset of [-BODY_WIDTH / 2 + 4, 0, BODY_WIDTH / 2 - 4]) {
            const hit = game.physics.raycast(body.x + offset, feetY - 4, 0, 1, 8, h => h.id !== body.id);
            if (hit && hit.ny < -0.5) return true;
        }
        return false;
    };
    const canStand = (): boolean => {
        const feetY = body.y + height / 2;
        for (const offset of [-BODY_WIDTH / 2 + 2, 0, BODY_WIDTH / 2 - 2]) {
            if (game.physics.raycast(body.x + offset, feetY - height + 1, 0, -1,
                STAND_HEIGHT - height + 2, h => h.id !== body.id)) return false;
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
        const move = game.controls.axis('move').x;
        const sprint = game.controls.pressed('run');
        const jump = game.controls.pressed('jump'), jumpPressed = game.controls.justPressed('jump') || (jump && !wasJump);
        wasJump = jump;
        const crouch = game.controls.pressed('crouch');
        const sit = game.controls.pressed('sit'), sitPressed = game.controls.justPressed('sit') || (sit && !wasSit);
        wasSit = sit;
        const wasGrounded = d.grounded;
        d.jumpLock = Math.max(0, d.jumpLock - dt);
        d.postureGrace = Math.max(0, d.postureGrace - dt);
        d.grounded = (body.body.grounded || hasSupport() || d.postureGrace > 0 && Math.abs(body.body.vy) < 80) && d.jumpLock === 0;
        d.landing = !wasGrounded && d.grounded ? 0.09 : Math.max(0, d.landing - dt);
        d.coyote = d.grounded ? COYOTE_TIME : Math.max(0, d.coyote - dt);
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
            body.body.vy = -JUMP_SPEED; d.coyote = 0; d.jumpBuffer = 0; d.jumpLock = 0.1;
            d.grounded = false; d.landing = 0;
        }
        // A short press makes a small hop; holding Jump gives the full arc.
        if (!jump && body.body.vy < -220) body.body.vy = -220;
    }, { before: 'physics-2d' });
    game.step('tokyo-visual', dt => {
        const distance = Math.abs(body.x - d.x);
        d.x = body.x; d.feet = body.y + height / 2; d.vx = body.body.vx; d.vy = body.body.vy;
        const moving = distance > MOTION_EPSILON && Math.abs(d.vx) > 5;
        const stride = d.crouchAmount > 0 ? CRAWL_STRIDE : game.controls.pressed('run') ? RUN_STRIDE : WALK_STRIDE;
        if (d.grounded && moving && !d.seated) d.gait = (d.gait + distance / stride) % 1;
        d.crouchMotion = d.crouchAmount === 0 ? 'none'
            : !d.crouched ? 'rising'
            : d.crouchAmount < 1 ? 'lowering'
            : moving ? 'crawling' : 'idle';
        const standingUp = !d.seated && d.sitPhase === 'up' && d.sitTime < SIT_TRANSITION;
        let next: TokyoState = 'idle';
        if (!d.grounded || d.landing > 0) next = 'jumping';
        else if (d.seated || standingUp) next = 'sitting';
        else if (d.crouchAmount > 0) next = 'crouching';
        else if (Math.abs(d.vx) > 12) next = game.controls.pressed('run') ? 'running' : 'walking';
        d.elapsed = next === d.state ? d.elapsed + dt : 0; d.state = next;
        d.frame = animationFrame(d);
        sprite.x = Math.round(d.x); sprite.y = Math.round(d.feet - FOOT_OFFSET);
        sprite.sx = d.facing * SPRITE_SCALE;
        sprite.setTexture(d.state === 'crouching' ? 'tokyo-crouch' : 'tokyo', d.frame);
    }, { after: 'physics-2d', before: 'rig-follow.camera' });
    return sprite;
}

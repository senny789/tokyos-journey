import { game } from './engine.js';
import { KENNEL_LOCK_SOUND, RIFT_SOUND } from './actionAudio.js';
import { createDialogueVoice } from './dialogueAudio.js';
import { showDreamDialogue } from './dreamPresentation.js';
import type { spawnTokyo } from './entities/Tokyo.js';
import { KENNEL_FLOOR, KENNEL_HEIGHT, KENNEL_ROOM_WIDTH } from './kennelRooms.js';
import { RIFT_PORTAL_ART } from './riftPortal.js';

const ARRIVAL_ZOOM = 1.2;
const DOOR_ZOOM = 1.28;
const ARRIVE_AT = 0.28;
const PAN_AT = 0.9;
const PAN_SECONDS = 1.25;
const LOCK_AT = PAN_AT + PAN_SECONDS;
const LOCK_SECONDS = 1.18;
const CALL_AT = LOCK_AT + LOCK_SECONDS;
const CALL_SECONDS = 1.8;
const RETURN_AT = CALL_AT + CALL_SECONDS;
const RETURN_SECONDS = 0.95;
const CAPTION_ID = 'kennel-opening-caption';
const CALL = 'Tokyo! Can you hear me?';

function showCallWave(x: number, y: number): void {
    const wave = game.spawn({ id: 'kennel-call-echo', texture: 'particle:ring', x, y, width: 20,
        tint: '#b7dcff', alpha: 0.64, blend: 'add', layer: 'front' });
    game.tween.to(wave, { x: x - 29, sx: wave.sx * 2.3, sy: wave.sy * 2.3, alpha: 0 },
        { duration: 0.48, ease: 'easeOutSine', onComplete: () => wave.destroy() });
}

export function playKennelOpening(tokyo: ReturnType<typeof spawnTokyo>, doorX: number, doorTop: number,
    onReady: () => void): void {
    const { width, height } = game.screen;
    const doorCameraX = KENNEL_ROOM_WIDTH - width / (2 * DOOR_ZOOM);
    const restCamera = { x: width / 2, y: KENNEL_HEIGHT / 2, zoom: 1 };
    const firstFrame = game.assets.frames(RIFT_PORTAL_ART.key);
    const voice = createDialogueVoice('kennel-voice');
    tokyo.data.grounded = true;
    tokyo.alpha = 0;
    game.camera.snap(width / (2 * ARRIVAL_ZOOM), 406, ARRIVAL_ZOOM);

    const rift = game.spawn({ id: 'kennel-arrival-rift', x: tokyo.x, y: KENNEL_FLOOR - 59,
        texture: RIFT_PORTAL_ART.key, frame: 1, scale: 1.55, alpha: 0, layer: 'world', z: tokyo.z - 1,
        anims: { swirl: { frames: [firstFrame + 1, firstFrame + 2, firstFrame + 3, firstFrame + 2], fps: 9 } } });
    rift.play('swirl');
    const veil = game.spawn({ id: 'kennel-opening-veil', texture: 'white', x: width / 2, y: height / 2,
        width, height, layer: 'hud', z: 1000, tint: '#121626' });
    game.tween.to(veil, { alpha: 0 }, { duration: 0.42, onComplete: () => veil.destroy() });
    game.tween.to(rift, { alpha: 1 }, { duration: ARRIVE_AT });

    game.after(ARRIVE_AT, () => {
        game.sound.play(RIFT_SOUND);
        game.tween.to(tokyo, { alpha: 1 }, { duration: 0.21 });
        game.particles.burst({ x: tokyo.x, y: tokyo.y, count: 18, layer: 'front',
            frame: 'particle:spark', blend: 'add', color: ['#9cf7e5', '#ffe6aa'],
            speed: [45, 155], lifespan: [0.25, 0.61] });
        game.tween.to(rift, { alpha: 0, sx: rift.sx * 0.2, sy: rift.sy * 0.88 },
            { delay: 0.16, duration: 0.33, ease: 'easeInOutSine', onComplete: () => rift.destroy() });
    });
    game.after(PAN_AT, () => {
        game.tween.to(game.camera, { x: doorCameraX, y: 365, zoom: DOOR_ZOOM },
            { duration: PAN_SECONDS, ease: 'easeInOutSine' });
    });
    game.after(LOCK_AT, () => {
        game.sound.play(KENNEL_LOCK_SOUND);
        showDreamDialogue(CAPTION_ID, doorX - 118, doorTop - 38, 'The door is locked.', LOCK_SECONDS);
    });
    game.after(CALL_AT, () => {
        showDreamDialogue(CAPTION_ID, doorX - 118, doorTop - 38, CALL, CALL_SECONDS, 'Voice beyond the door');
        voice.speak(CALL, CALL_SECONDS);
        showCallWave(doorX - 9, doorTop + 71);
        game.after(0.31, () => showCallWave(doorX - 9, doorTop + 71));
    });
    game.after(RETURN_AT, () => {
        game.tween.to(game.camera, restCamera, {
            duration: RETURN_SECONDS, ease: 'easeInOutSine', onComplete: onReady,
        });
    });
}

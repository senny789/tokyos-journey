import { game } from './engine.js';
import { createDialogueVoice } from './dialogueAudio.js';
import type { spawnTokyo } from './entities/Tokyo.js';
import { TOKYO_SLEEP_TEXTURE } from './tokyoArt.js';

const SLEEP_POSE = 0;
const LISTEN_POSE = 1;
const FIRST_RISE_POSE = 6;
const RISE_FPS = 15;
const FOOT_ANCHOR = 21;
const BREATH_PERIOD = 0.94;
const BREATH_SCALE = 0.053;
const INTRO_ZOOM = 1.36;
const FADE_SECONDS = 0.43;
const CALL_AT = 0.96;
const LISTEN_AT = CALL_AT + 0.17;
const RISE_AT = CALL_AT + 1.06;
const STAND_AT = RISE_AT + 0.63;
const FOLLOW_AT = STAND_AT + 0.12;
const FOLLOW_SECONDS = 1.8;
const RELEASE_AT = FOLLOW_AT + FOLLOW_SECONDS;
const CALL_ECHO_AT = CALL_AT + 0.39;
const WAVE_SECONDS = 0.46;
const DIALOGUE_X_OFFSET = 187;
const DIALOGUE_Y_OFFSET = 103;
const FOLLOW_DIALOGUE_RIGHT_MARGIN = 24;
const FOLLOW_DIALOGUE_Y_OFFSET = 140;
const WAKE_WAVE = { x: 58, y: 2 };
const FOLLOW_WAVES = [
    { delay: 0.16, x: 146, y: -25 },
    { delay: 0.44, x: 199, y: -59 },
    { delay: 0.72, x: 366, y: -109 },
];
const DIALOGUE_DEPTH = 15;
const DIALOGUE_TEXTURE = 'home-dialogue-box';
const DIALOGUE_FADE_IN = 0.18;
const DIALOGUE_FADE_OUT = 0.24;
const DIALOGUE_BOB = 3;
const DIALOGUE_BOB_PERIOD = 2.6;
const SPEAKER_OFFSET = -13;
const LINE_OFFSET = 8;
const WAKE_LINE = 'Tokyo… wake up.';
const FOLLOW_LINE = 'Follow my voice.';
type WakePhase = 'sleeping' | 'listening' | 'rising';

function showSennyDialogue(x: number, y: number, caption: string, duration: number, layer: 'world' | 'hud' = 'world'): void {
    const bubble = game.spawn({
        id: 'dream-senny-dialogue', texture: DIALOGUE_TEXTURE, x, y, sx: -1,
        alpha: 0, layer, z: DIALOGUE_DEPTH,
    });
    const speaker = game.text('Senny', x, y + SPEAKER_OFFSET, {
        size: 13, font: 'sans-bold', color: '#704651', layer, z: DIALOGUE_DEPTH + 1,
    });
    const line = game.text(caption, x, y + LINE_OFFSET, {
        size: 18, font: 'sans-bold', color: '#392b26', layer, z: DIALOGUE_DEPTH + 1,
    });
    speaker.alpha = line.alpha = 0;
    let elapsed = 0;
    const motion = game.step('dream-senny-dialogue-motion', dt => {
        elapsed += dt;
        const alpha = Math.max(0, Math.min(1, elapsed / DIALOGUE_FADE_IN, (duration - elapsed) / DIALOGUE_FADE_OUT));
        bubble.y = y + DIALOGUE_BOB * Math.sin(elapsed * 2 * Math.PI / DIALOGUE_BOB_PERIOD);
        speaker.y = bubble.y + SPEAKER_OFFSET;
        line.y = bubble.y + LINE_OFFSET;
        bubble.alpha = speaker.alpha = line.alpha = alpha;
    });
    game.after(duration, () => {
        motion.cancel();
        bubble.destroy();
        speaker.destroy();
        line.destroy();
    });
}

function showCallWave(x: number, y: number): void {
    const wave = game.spawn({
        id: 'dream-call-wave', texture: 'particle:ring', x, y, width: 16,
        tint: '#c9b5ff', alpha: 0.64, layer: 'front', blend: 'add',
    });
    game.tween.to(wave, { x: x - 14, sx: wave.sx * 2.1, sy: wave.sy * 2.1, alpha: 0 }, {
        duration: WAVE_SECONDS, ease: 'easeOutSine', onComplete: () => wave.destroy(),
    });
}

export function playDreamWake(tokyo: ReturnType<typeof spawnTokyo>, onReady: () => void): void {
    const { width, height } = game.screen;
    const { x, y, sx, sy } = tokyo;
    const voice = createDialogueVoice('dream');
    tokyo.visible = false;
    game.camera.snap(width / (2 * INTRO_ZOOM), y, INTRO_ZOOM);
    const pose = game.spawn({
        id: 'dream-wake-tokyo', texture: TOKYO_SLEEP_TEXTURE, frame: SLEEP_POSE, x, y, sx, sy,
        layer: 'world', z: tokyo.z, data: { phase: 'sleeping' as WakePhase },
    });
    const fade = game.spawn({
        id: 'dream-wake-fade', texture: 'white', x: width / 2, y: height / 2, width, height,
        tint: '#10111e', alpha: 1, layer: 'hud', z: 1000,
    });
    game.tween.to(fade, { alpha: 0 }, { duration: FADE_SECONDS, ease: 'easeOutSine', onComplete: () => fade.destroy() });

    let breathing = 0;
    let rising = 0;
    const animation = game.step('dream-wake-pose', dt => {
        if (pose.data.phase === 'sleeping') {
            breathing += dt;
            pose.sy = sy * (1 + BREATH_SCALE * Math.sin(breathing * 2 * Math.PI / BREATH_PERIOD));
            pose.y = y - (pose.sy - sy) * FOOT_ANCHOR;
        } else if (pose.data.phase === 'rising') {
            rising += dt;
            pose.setFrame(Math.max(0, FIRST_RISE_POSE - Math.floor(rising * RISE_FPS)));
        }
    });
    game.after(CALL_AT, () => {
        const duration = STAND_AT - CALL_AT;
        showSennyDialogue(x + DIALOGUE_X_OFFSET, y - DIALOGUE_Y_OFFSET, WAKE_LINE, duration);
        voice.speak(WAKE_LINE, duration);
        showCallWave(x + WAKE_WAVE.x, y + WAKE_WAVE.y);
    });
    game.after(CALL_ECHO_AT, () => showCallWave(x + WAKE_WAVE.x, y + WAKE_WAVE.y));
    game.after(LISTEN_AT, () => {
        pose.data.phase = 'listening';
        pose.y = y;
        pose.sy = sy;
        pose.setFrame(LISTEN_POSE);
    });
    game.after(RISE_AT, () => {
        pose.data.phase = 'rising';
        pose.setTexture('tokyo-crouch', FIRST_RISE_POSE);
        game.tween.to(game.camera, { zoom: 1 }, { duration: STAND_AT - RISE_AT, ease: 'easeInOutSine' });
    });
    game.after(STAND_AT, () => {
        animation.cancel();
        pose.destroy();
        tokyo.data.grounded = true;
        tokyo.setTexture('tokyo', 0);
        tokyo.visible = true;
    });
    game.after(FOLLOW_AT, () => {
        const bubbleX = width - FOLLOW_DIALOGUE_RIGHT_MARGIN - game.assets.frame(DIALOGUE_TEXTURE).width / 2;
        const bubbleY = game.camera.toScreen(x, y - FOLLOW_DIALOGUE_Y_OFFSET).y;
        showSennyDialogue(bubbleX, bubbleY, FOLLOW_LINE, FOLLOW_SECONDS, 'hud');
        voice.speak(FOLLOW_LINE, FOLLOW_SECONDS);
    });
    for (const wave of FOLLOW_WAVES) {
        game.after(FOLLOW_AT + wave.delay, () => showCallWave(x + wave.x, y + wave.y));
    }
    game.after(RELEASE_AT, onReady);
}

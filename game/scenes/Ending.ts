import { game } from '../engine.js';
import { INTERACT_SOUND, PICKUP_SOUND } from '../actionAudio.js';
import { run, spawnTokyo } from '../entities/Tokyo.js';
import { HOME_FAMILY, HOME_FLOOR, FAMILY_GROUND_OFFSET, HOME_START, spawnHomeRoom } from '../home.js';
import { isMobileView, getTouchOverride } from '../mobile.js';
import { beginDream, journey } from '../journey.js';
import { createDialogueVoice } from '../dialogueAudio.js';

const ROOM_WIDTH = 1280;
const ROOM_HEIGHT = 720;
const FAMILY_SCALE = 1.48;
const GREETING_RANGE = 64;
const ACTION_FRAME_TIME = 0.2;
const MESSAGE_SECONDS = 3.6;
const TOY_REACH = 38;

export const Ending = {
    name: 'ending',
    enter(): void {
        let elapsed = 0;
        let messageTime = 4.8;
        const family: {
            id: string; name: string; line: string; x: number;
            sprite: ReturnType<typeof game.spawn>; actionTime: number;
        }[] = [];
        const lines: Record<string, string> = {
            sandesh: 'Sandesh laughs as Tokyo rushes over.',
            sushil: 'Sushil gives Tokyo a gentle scratch.',
            dad: 'Dad scoops Tokyo into a happy hug.',
            mom: 'Mom gives Tokyo the warmest welcome.',
            reshika: 'Reshika smiles: “Our little dream explorer!”',
            senny: 'Senny calls, “Tokyo! Let’s play!”',
        };

        run.scene = 'journey';
        game.camera.snap(ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 1);
        game.physics.gravity(0, 1500);
        game.touch.visible = getTouchOverride() ?? isMobileView();
        const room = spawnHomeRoom();
        room.shade.alpha = 0;

        for (const [id, x, y, w, h] of [
            ['morning-floor', ROOM_WIDTH / 2, HOME_FLOOR + 24, ROOM_WIDTH, 48],
            ['morning-left-wall', 0, ROOM_HEIGHT / 2, 28, ROOM_HEIGHT],
            ['morning-right-wall', ROOM_WIDTH, ROOM_HEIGHT / 2, 28, ROOM_HEIGHT],
        ] as const) {
            game.spawn({ id, x, y, width: w, height: h, visible: false,
                layer: 'world', body: { type: 'static', friction: 0 } });
        }

        const tokyo = spawnTokyo(HOME_START + 30, HOME_FLOOR, () => true);
        const plushie = game.spawn({ id: 'reunited-favourite-plushie', texture: 'home-plushie',
            x: tokyo.x, y: HOME_FLOOR, width: 39, layer: 'world', z: 11, visible: false });
        const ball = game.spawn({ id: 'morning-play-ball', texture: 'home-ball',
            x: 498, y: HOME_FLOOR - 19, width: 30, layer: 'world', z: 11 });
        if (journey.plushie) tokyo.carry('plushie');
        let flight: { from: number; to: number; time: number } | null = null;

        for (const member of HOME_FAMILY) {
            const sprite = game.spawn({ id: 'morning-' + member.id, texture: 'family-' + member.id,
                x: member.x, y: HOME_FLOOR - FAMILY_GROUND_OFFSET * FAMILY_SCALE,
                scale: FAMILY_SCALE, layer: 'world', z: 7 });
            family.push({ ...member, sprite, actionTime: 0 });
        }

        game.text('GOOD MORNING, TOKYO!', ROOM_WIDTH / 2, 60,
            { size: 28, font: 'mono-bold', color: '#fff0c9', shadow: { color: '#283828', x: 2, y: 3 } });
        game.text('Everyone—and your favourite plushie—are together again.', ROOM_WIDTH / 2, 96,
            { size: 15, font: 'mono-bold', color: '#fff1d6', shadow: { color: '#283828', x: 1, y: 2 } });
        game.ui.button({ id: 'replay-dream', anchor: 'top-left', x: 14, y: 15, h: 48,
            text: 'Dream again', icon: 'restart', style: 'flat', onClick: beginDream });
        game.ui.pauseButton();
        game.ui.muteButton();
        const message = game.text('That was a big adventure. Go play with everyone!', ROOM_WIDTH / 2, 630,
            { size: 17, font: 'mono-bold', color: '#fff3d8', shadow: { color: '#283828', x: 2, y: 2 } });
        const prompt = game.text('← → MOVE   ·   F GREET OR PLAY   ·   SHIFT RUN',
            ROOM_WIDTH / 2, 679, { size: 13, font: 'mono-bold', color: '#fff1d0',
                shadow: { color: '#283828', x: 1, y: 2 } });
        const voice = createDialogueVoice();

        game.step('morning-reunion', dt => {
            elapsed += dt;
            if (messageTime > 0) messageTime = Math.max(0, messageTime - dt);
            for (const member of family) {
                if (member.actionTime > 0) {
                    member.actionTime = Math.max(0, member.actionTime - dt);
                    const phase = Math.floor((ACTION_FRAME_TIME * 5 - member.actionTime) / ACTION_FRAME_TIME);
                    member.sprite.setFrame(phase < 2 ? 4 + phase : Math.floor(elapsed * 2) % 2);
                } else {
                    member.sprite.setFrame(Math.floor(elapsed * 2 + member.x / 110) % 2);
                }
            }
            if (flight) {
                flight.time += dt;
                const t = Math.min(1, flight.time / 0.72);
                ball.x = flight.from + (flight.to - flight.from) * t;
                ball.y = HOME_FLOOR - 15 - Math.sin(Math.PI * t) * 88;
                if (t >= 1) flight = null;
            }

            const playerX = tokyo.data.x;
            let closest: { label: string; action: () => void; distance: number; sound?: string } | null = null;
            for (const member of family) {
                const distance = Math.abs(playerX - member.x);
                if (distance <= GREETING_RANGE && (!closest || distance < closest.distance)) {
                    closest = { label: 'Greet ' + member.name, distance, action: () => {
                        member.actionTime = ACTION_FRAME_TIME * 5;
                        const line = lines[member.id]!;
                        message.text = line;
                        messageTime = MESSAGE_SECONDS;
                        voice.speak(line, MESSAGE_SECONDS);
                    } };
                }
            }
            const ballDistance = Math.abs(playerX - ball.x);
            if (ball.visible && !flight && ballDistance <= GREETING_RANGE
                && (!closest || ballDistance < closest.distance)) {
                closest = { label: 'Pick up the ball', distance: ballDistance, sound: PICKUP_SOUND, action: () => {
                    if (tokyo.data.carrying === 'plushie') {
                        plushie.x = playerX - tokyo.data.facing * TOY_REACH;
                        plushie.y = HOME_FLOOR - plushie.height / 2 + 2;
                        plushie.visible = true;
                    }
                    tokyo.carry('ball');
                    ball.visible = false;
                } };
            } else if (tokyo.data.carrying === 'ball' && !flight) {
                const receiver = family.find(member => member.id === 'senny')!;
                const distance = Math.abs(playerX - receiver.x);
                if (distance <= GREETING_RANGE && (!closest || distance < closest.distance)) {
                    closest = { label: 'Play fetch with Senny', distance, sound: INTERACT_SOUND, action: () => {
                        tokyo.carry(null);
                        ball.x = playerX + tokyo.data.facing * TOY_REACH;
                        ball.y = HOME_FLOOR - 15;
                        ball.visible = true;
                        flight = { from: ball.x, to: receiver.x, time: 0 };
                        message.text = 'Senny tosses the ball. Tokyo races to fetch it!';
                        messageTime = MESSAGE_SECONDS;
                        voice.stop();
                    } };
                }
            }
            const plushieDistance = Math.abs(playerX - plushie.x);
            if (plushie.visible && tokyo.data.carrying === null && plushieDistance <= GREETING_RANGE
                && (!closest || plushieDistance < closest.distance)) {
                closest = { label: 'Pick up your plushie', distance: plushieDistance, sound: PICKUP_SOUND, action: () => {
                    plushie.visible = false;
                    tokyo.carry('plushie');
                } };
            }
            if (closest) prompt.text = game.touch.visible ? closest.label : 'F  ' + closest.label;
            else if (messageTime <= 0) {
                message.text = 'That was a big adventure. Go play with everyone!';
                prompt.text = '← → MOVE   ·   F GREET OR PLAY   ·   SHIFT RUN';
            }
            if (closest && game.controls.justPressed('interact')) {
                if (closest.sound) game.sound.play(closest.sound);
                closest.action();
            }
            if (game.controls.justPressed('pause')) game.scenes.push('pause');
        }, { after: 'tokyo-visual' });
    },
    exit(): void { game.touch.visible = false; },
};

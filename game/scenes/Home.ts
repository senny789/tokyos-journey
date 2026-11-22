import { game } from '../engine.js';
import { run, spawnTokyo, UPWARD_PLATFORM_TAG } from '../entities/Tokyo.js';
import { getTouchOverride, isMobileView } from '../mobile.js';
import { FAMILY_GROUND_OFFSET, HOME_FAMILY, home, homePreview } from '../home.js';
import {
    HOME_DOOR_ARRIVAL_OFFSET, HOME_DOOR_CLOSE_RANGE, HOME_DOOR_ENTER_RANGE,
    HOME_DOOR_PROMPT_Y, HOME_DOOR_RANGE, spawnHomeDoors,
} from '../homeDoors.js';
import { HOME_DIALOGUE_HEIGHT, HOME_DIALOGUE_WIDTH, spawnHomeFootShadow, spawnHomeInterior } from '../homeInterior.js';
import { HOME_PROMPT_HEIGHT, spawnHomePrompt } from '../homePrompt.js';
import {
    HOME_DOG_BED, HOME_DOG_BED_TOP, HOME_ENTRY, HOME_LIGHT_SWITCH, HOME_ROOMS, HOME_ROOM_WIDTH, HOME_SOFA_FEET,
    HOME_SOFA_SEAT_X, HOME_STATIONS, HOME_TOY_BASKET, HOME_TREATS, HOME_WALK_Y, HOME_WIDTH, roomX,
    type HomeRoom,
} from '../homeRooms.js';
import { beginDream } from '../journey.js';
import { TOKYO_ART_SCALE, type TokyoToy } from '../tokyoArt.js';

const WALL_WIDTH = 28;
const ROOM_FADE_TIME = 0.22;
const GRAVITY = 1500;
const INTERACT_RANGE = 72;
const INTERACT_HEIGHT = 32;
const TOKYO_SCALE = 1.95;
const HOME_JUMP = { launchSpeed: 748, releaseSpeed: 730 };
const TOKYO_SHADOW_WIDTH = 89;
const SURFACE_PROBE_OFFSET = 4;
const FAMILY_FRAME_TIME = 0.18;
const FAMILY_RELEASE_TIME = FAMILY_FRAME_TIME * 2;
const FAMILY_LEAVE_RANGE = 104;
const FAMILY_RETURN_DELAY = 2;
const FAMILY_ENGAGED_FRAME_TIME = 0.6;
const FAMILY_SEATED = [18, 18, 19, 19] as const;
const FAMILY_SEATED_PLAY = [19, 20, 20, 19, 20, 19] as const;
const ROOM_ACTIVITY = [0, 1, 2, 1] as const;
const ROOM_GREETING = [3, 4, 5] as const;
const ROOM_ENGAGED = [5, 5, 6, 5] as const;
const ROOM_RESUME = [4, 3] as const;
const FAMILY_KNEELING_LABEL_HEIGHT = 186;
const FAMILY_SOFA_LABEL_HEIGHT = 204;
const FAMILY_ACTIVITY_GAP = 21;
const ROOM_PREVIEW_X = 568;
const BALL_RELEASE_X = 55;
const BALL_RELEASE_HEIGHT = 83;
const BALL_THROW_DISTANCE = 204;
const BALL_THROW_TIME = 0.65;
const BALL_ARC = 53;
const BALL_SIZE = 25;
const PLUSHIE_SIZE = 42;
const BOWL_SIZE = 60;
const TOY_DROP_OFFSET = 44;
const RESTING_FOOT_OFFSET = 21 * TOKYO_SCALE * TOKYO_ART_SCALE;
const EAT_MUZZLE_OFFSET = 53;
const EAT_TIME = 1.05;
const EAT_FRAMES = [48, 49, 50, 51, 52, 51, 52, 53, 54, 55] as const;
const SLEEP_WAIT = 0.55;
const DREAM_FADE = 0.8;
const LOW_TOKYO_FRAME = 35;
const SHADE_ALPHA = 0.46;
const MESSAGE_TIME = 3.6;
const MESSAGE_RANGE = 104;
const DIALOGUE_FONT_SIZE = 16;
const DIALOGUE_LINE_HEIGHT = 1.25;
const DIALOGUE_PADDING = 13;
const DIALOGUE_GAP = 7;
const FAMILY_PROMPT_OFFSET = 38;
const FAMILY_PROMPT_GAP = 82;
const PROP_PROMPT_GAP = 36;
const SCREEN_EDGE = 16;

type FamilyState = 'activity' | 'greeting' | 'engaged' | 'resuming' | 'sitting';
type FamilyPose = { state: FamilyState; time: number; away: number; facing: number; activity: string };

function changeFamilyState(pose: FamilyPose, state: FamilyState): void {
    if (pose.state === state) return;
    pose.state = state;
    pose.time = 0;
}

const GOAL: Record<typeof home.phase, string> = {
    play: 'Visit your family or pick up your plushie.',
    treats: 'Treat time! Your bowl is in the last room.',
    eating: 'Enjoy your treats.',
    bedtime: 'Bedtime. Your bed is in Senny and Reshu’s room.',
    sleeping: 'Good night, Tokyo.',
};

type PromptAnchor = { x: number; y: number; gap: number };
type HomeTarget = {
    at: () => number;
    y: () => number;
    gap: number;
    range?: number;
    surface?: () => number;
    label: () => string;
    act: () => void;
};

function beside(anchor: PromptAnchor, elementWidth: number): { x: number; y: number; onRight: boolean } {
    const point = game.camera.toScreen(anchor.x, anchor.y);
    const right = point.x + anchor.gap;
    const limit = game.screen.width - elementWidth - SCREEN_EDGE;
    const onRight = right <= limit;
    const x = onRight ? right : point.x - anchor.gap - elementWidth;
    return { x: Math.max(SCREEN_EDGE, x), y: point.y, onRight };
}

function spawnRoomBounds(): void {
    const height = game.screen.height;
    for (const [id, x, y, width, colliderHeight] of [
        ['floor', HOME_WIDTH / 2, HOME_WALK_Y + 24, HOME_WIDTH, 48],
        ...Array.from({ length: HOME_ROOMS.length + 1 }, (_, index) =>
            [`wall-${index}`, index * HOME_ROOM_WIDTH, height / 2, WALL_WIDTH, height] as const),
    ] as const) {
        game.spawn({ id: `home-${id}`, x, y, width, height: colliderHeight, layer: 'world', visible: false,
            body: { type: 'static', friction: 0 } });
    }
}

export const Home = {
    name: 'home',
    enter(): void {
        const { sofa: previewGuest, room: previewRoom, phase: previewPhase } = homePreview;
        Object.assign(homePreview, { sofa: null, room: 'living', phase: 'play' });
        Object.assign(home, { room: previewRoom, phase: previewPhase, lightOn: true, holding: null, ball: 'ready', playedWith: [] });
        run.scene = 'home';
        const { width, height } = game.screen;
        const entry = previewGuest ? HOME_SOFA_SEAT_X - 62
            : previewRoom === 'living' ? HOME_ENTRY : roomX(previewRoom, ROOM_PREVIEW_X);
        function frameRoom(room: HomeRoom, playerX: number): void {
            const left = roomX(room, 0);
            const cameraX = Math.max(left + width / 2, Math.min(left + HOME_ROOM_WIDTH - width / 2, playerX));
            game.rig.bounds({ x: left, y: 0, w: HOME_ROOM_WIDTH, h: height });
            game.camera.snap(cameraX, height / 2, 1);
        }
        frameRoom(home.room, entry);
        game.physics.gravity(0, GRAVITY);
        game.touch.visible = getTouchOverride() ?? isMobileView();
        const { lamp, shade } = spawnHomeInterior();
        const doors = spawnHomeDoors();
        spawnRoomBounds();
        let enteringRoom = false;
        const busy = () => enteringRoom || home.phase === 'eating' || home.phase === 'sleeping';
        const tokyo = spawnTokyo(entry, HOME_WALK_Y, () => !busy(), TOKYO_SCALE, HOME_JUMP);
        game.rig.follow(tokyo);
        const tokyoShadow = spawnHomeFootShadow(entry, TOKYO_SHADOW_WIDTH);
        const members = HOME_FAMILY.map(({ id }, i) => {
            const station = HOME_STATIONS[id];
            const { scale, name, activity } = station;
            const onSofa = id === previewGuest;
            const x = onSofa ? HOME_SOFA_SEAT_X : station.x;
            const feet = onSofa ? HOME_SOFA_FEET : HOME_WALK_Y;
            const shadow = onSofa ? null : spawnHomeFootShadow(x, id === 'dad' ? 206 : 76);
            const pose: FamilyPose = { state: onSofa ? 'sitting' : 'activity', time: i * 0.23, away: 0, facing: 1, activity };
            const sprite = game.spawn({ id: `home-${id}`, texture: `family-${onSofa ? 'home' : 'room'}-${id}`, x,
                y: feet - FAMILY_GROUND_OFFSET * scale, scale,
                frame: onSofa ? FAMILY_SEATED[0] : 0, layer: 'world', z: 5, data: pose });
            const labelY = feet - (onSofa ? FAMILY_SOFA_LABEL_HEIGHT : station.labelHeight);
            const title = game.text(name, x, labelY, {
                size: 21, font: 'sans-bold', color: '#fff1d0', baseline: 'bottom', layer: 'front', z: 8,
                stroke: { color: '#392b26', width: 2 }, shadow: { color: '#392b2680', x: 0, y: 2 },
            });
            const activityLabel = game.text(onSofa ? '' : activity, x, labelY + FAMILY_ACTIVITY_GAP, {
                size: 15, font: 'mono-bold', color: '#f5e2c0', baseline: 'bottom', layer: 'front', z: 8,
                stroke: { color: '#392b26', width: 2 },
            });
            const promptAnchor = { x, y: sprite.y - FAMILY_PROMPT_OFFSET, gap: FAMILY_PROMPT_GAP };
            return { id, ...station, sprite, title, activityLabel, shadow, promptAnchor, onSofa };
        });
        const plushie = game.spawn({ id: 'home-plushie', texture: 'home-plushie', x: HOME_TOY_BASKET, y: HOME_WALK_Y - 39,
            width: PLUSHIE_SIZE, layer: 'world', z: 11 });
        const ball = game.spawn({ id: 'home-ball', texture: 'home-ball',
            x: HOME_STATIONS.senny.x, y: HOME_WALK_Y, width: BALL_SIZE, layer: 'world', z: 11, visible: false });
        const bowl = game.spawn({ id: 'home-bowl', texture: home.phase === 'bedtime' ? 'home-bowl-empty' : 'home-bowl-full',
            x: HOME_TREATS, y: HOME_WALK_Y - 8, width: BOWL_SIZE, layer: 'world', z: 7 });
        const quietTokyo = game.spawn({ id: 'home-resting-tokyo', texture: 'tokyo', frame: LOW_TOKYO_FRAME, x: 0, y: 0,
            scale: TOKYO_SCALE * TOKYO_ART_SCALE, layer: 'world', z: 10, visible: false });

        game.ui.pauseButton();
        game.ui.muteButton();
        const goalPanel = game.graphics({ layer: 'hud' });
        goalPanel.draw(ctx => {
            ctx.fillStyle = '#252c2be8';
            ctx.fillRect(24, 26, 586, 81);
            ctx.fillStyle = '#d7ad70';
            ctx.fillRect(24, 26, 3, 81);
        });
        const goal = game.text(GOAL.play, 42, 81, { size: 18, font: 'mono', align: 'left', color: '#f6e5c2' });
        const roomTitle = game.text('', 42, 49, { size: 21, font: 'mono-bold', align: 'left', color: '#f5d391' });
        const roomFade = game.spawn({ id: 'home-room-fade', texture: 'white', x: width / 2, y: height / 2,
            width, height, tint: '#211a17', alpha: 0, layer: 'hud', z: 900 });
        const dialogueBox = game.spawn({ id: 'home-dialogue-box', texture: 'home-dialogue-box',
            x: 0, y: 0, layer: 'hud', z: 4, visible: false });
        const dialogue = game.typography.write({
            font: game.typography.face({ family: 'sans-bold', size: DIALOGUE_FONT_SIZE }).font,
            text: '', layer: 'hud', z: 5,
            style: { color: '#392b26', fontSize: DIALOGUE_FONT_SIZE, lineHeight: DIALOGUE_LINE_HEIGHT },
            constraints: { width: { mode: 'at-most', size: HOME_DIALOGUE_WIDTH - DIALOGUE_PADDING * 2 } },
            layout: { wrap: 'word' },
        });
        let interactRequested = false;
        const prompt = spawnHomePrompt(() => { interactRequested = true; });

        let elapsed = 0;
        let eatingSince = 0;
        let messageUntil = 0;
        let messageAnchor: PromptAnchor | null = null;
        let flight: { from: number; to: number; time: number } | null = null;
        function say(line: string, anchor: PromptAnchor): void {
            dialogue.set({ text: line });
            messageUntil = elapsed + MESSAGE_TIME;
            messageAnchor = anchor;
        }
        function enterRoom(door: typeof doors[number]): void {
            enteringRoom = true;
            const arriveX = door.to.x + door.facing * HOME_DOOR_ARRIVAL_OFFSET;
            game.tween.to(roomFade, { alpha: 1 }, { duration: ROOM_FADE_TIME, onComplete: () => {
                door.from.setOpen(false);
                door.to.setOpen(true);
                home.room = door.to.room;
                tokyo.warpTo(arriveX, HOME_WALK_Y, door.facing);
                frameRoom(home.room, arriveX);
                messageAnchor = null;
                game.tween.to(roomFade, { alpha: 0 }, { duration: ROOM_FADE_TIME, onComplete: () => {
                    door.to.setOpen(false);
                    enteringRoom = false;
                } });
            } });
        }

        function openTreatTime(): void {
            if (home.phase === 'play') home.phase = 'treats';
        }
        function setLight(on: boolean): void {
            home.lightOn = on;
            lamp.setTexture(on ? 'home-pixel-lamp-on' : 'home-pixel-lamp-off');
        }
        function surfaceBelow(x: number, feet: number): number {
            const y = feet - SURFACE_PROBE_OFFSET;
            const hit = game.physics.raycast(x, y, 0, 1, HOME_WALK_Y - y + SURFACE_PROBE_OFFSET,
                body => body.tags.has(UPWARD_PLATFORM_TAG) || body.id.startsWith('home-floor'));
            return hit?.y ?? HOME_WALK_Y;
        }
        function setHolding(toy: TokyoToy | null): void {
            home.holding = toy;
            tokyo.carry(toy);
        }
        function dropToy(): void {
            if (home.holding === null) return;
            const toy = home.holding === 'plushie' ? plushie : ball;
            toy.x = tokyo.x + tokyo.data.facing * TOY_DROP_OFFSET;
            toy.y = surfaceBelow(toy.x, tokyo.data.feet) - toy.height / 2 + 2;
            toy.visible = true;
            if (home.holding === 'ball') home.ball = 'floor';
            setHolding(null);
        }
        function pickUp(toy: TokyoToy): void {
            dropToy();
            const prop = toy === 'plushie' ? plushie : ball;
            prop.visible = false;
            setHolding(toy);
            if (toy === 'ball') {
                home.ball = 'carried';
                say('Bring the ball back to Senny.', { x: tokyo.x, y: tokyo.y - 50, gap: PROP_PROMPT_GAP });
            } else {
                openTreatTime();
            }
        }
        function toss(x: number, facing: number): void {
            home.ball = 'flying';
            ball.visible = true;
            const from = x + facing * BALL_RELEASE_X;
            flight = { from, to: from + facing * BALL_THROW_DISTANCE, time: 0 };
            ball.x = from;
            ball.y = HOME_WALK_Y - BALL_RELEASE_HEIGHT;
        }
        function playWith(member: typeof members[number]): void {
            const pose = member.sprite.data;
            if (pose.state === 'greeting') return;
            const fetch = member.id === 'senny' && !member.onSofa;
            const needsBall = fetch && home.ball !== 'ready' && home.ball !== 'carried';
            if (pose.state === 'engaged' && !fetch) return;
            if (fetch) {
                if (!needsBall) {
                    if (home.holding === 'ball') setHolding(null);
                    ball.visible = false;
                    home.ball = 'windup';
                }
            }
            if (!home.playedWith.includes(member.id)) home.playedWith.push(member.id);
            openTreatTime();
            pose.away = 0;
            pose.facing = member.onSofa && tokyo.x < member.sprite.x ? -1 : 1;
            changeFamilyState(pose, needsBall ? 'engaged' : 'greeting');
            const line = needsBall ? 'Bring the ball back to me.'
                : member.onSofa ? 'Come here, Tokyo. Good girl!' : member.line;
            say(line, member.promptAnchor);
        }

        function animateMember(member: typeof members[number], dt: number): void {
            const pose = member.sprite.data;
            pose.time += dt;
            const fetch = member.id === 'senny' && !member.onSofa;
            if (pose.state === 'greeting') {
                if (fetch && home.ball === 'windup' && pose.time >= FAMILY_RELEASE_TIME) {
                    toss(member.sprite.x, 1);
                }
                const frames = member.onSofa ? FAMILY_SEATED_PLAY : ROOM_GREETING;
                if (pose.time >= FAMILY_FRAME_TIME * frames.length) changeFamilyState(pose, 'engaged');
            }
            if (pose.state === 'greeting' || pose.state === 'engaged') {
                const here = Math.abs(tokyo.x - member.sprite.x) <= FAMILY_LEAVE_RANGE;
                pose.away = here ? 0 : pose.away + dt;
                if (pose.away >= FAMILY_RETURN_DELAY) {
                    changeFamilyState(pose, member.onSofa ? 'sitting' : 'resuming');
                }
            }
            if (pose.state === 'resuming' && pose.time >= FAMILY_FRAME_TIME * ROOM_RESUME.length) {
                changeFamilyState(pose, 'activity');
            }
            const activity = pose.state === 'activity';
            const feet = member.onSofa ? HOME_SOFA_FEET : HOME_WALK_Y;
            const labelOffset = member.onSofa ? FAMILY_SOFA_LABEL_HEIGHT
                : member.id === 'dad' && !activity ? FAMILY_KNEELING_LABEL_HEIGHT : member.labelHeight;
            member.title.y = feet - labelOffset;
            member.activityLabel.visible = activity;
            member.activityLabel.y = member.title.y + FAMILY_ACTIVITY_GAP;
            if (member.shadow && member.id === 'dad') member.shadow.width = activity ? 206 : 100;
            const frames = {
                activity: ROOM_ACTIVITY,
                greeting: member.onSofa ? FAMILY_SEATED_PLAY : ROOM_GREETING,
                engaged: member.onSofa ? FAMILY_SEATED : fetch ? [6] : ROOM_ENGAGED,
                resuming: fetch ? [6] : ROOM_RESUME,
                sitting: FAMILY_SEATED,
            }[pose.state];
            const cadence = activity ? member.pace : pose.state === 'engaged' || pose.state === 'sitting'
                ? FAMILY_ENGAGED_FRAME_TIME : FAMILY_FRAME_TIME;
            member.sprite.sx = member.scale * pose.facing;
            member.sprite.setFrame(frames[Math.floor(pose.time / cadence) % frames.length]);
        }

        function restPose(x: number, y: number, facing: number): void {
            tokyo.visible = false;
            quietTokyo.visible = true;
            quietTokyo.x = x;
            quietTokyo.y = y;
            quietTokyo.sx = facing * TOKYO_SCALE * TOKYO_ART_SCALE;
        }
        function eatTreats(): void {
            home.phase = 'eating';
            dropToy();
            const facing = tokyo.x < HOME_TREATS ? 1 : -1;
            const x = HOME_TREATS - facing * EAT_MUZZLE_OFFSET;
            tokyo.warpTo(x, HOME_WALK_Y, facing);
            eatingSince = elapsed;
            quietTokyo.setFrame(EAT_FRAMES[0]);
            restPose(x, HOME_WALK_Y - RESTING_FOOT_OFFSET, facing);
            game.after(EAT_TIME, () => {
                bowl.setTexture('home-bowl-empty');
                quietTokyo.visible = false;
                tokyo.visible = true;
                home.phase = 'bedtime';
            });
        }
        function goToSleep(): void {
            home.phase = 'sleeping';
            dropToy();
            quietTokyo.setFrame(LOW_TOKYO_FRAME);
            restPose(HOME_DOG_BED, HOME_DOG_BED_TOP - RESTING_FOOT_OFFSET, 1);
            setLight(false);
            game.touch.visible = false;
            const fade = game.spawn({ id: 'home-dream-fade', texture: 'white', x: width / 2, y: height / 2,
                width, height, tint: '#10111e', alpha: 0, layer: 'hud', z: 1000 });
            game.after(SLEEP_WAIT, () => {
                game.tween.to(fade, { alpha: 1 }, { duration: DREAM_FADE, onComplete: beginDream });
            });
        }

        const targets: HomeTarget[] = [
            ...doors.map(({ from }) => ({
                at: () => !from.open && from.room === home.room ? from.x : Infinity,
                y: () => HOME_DOOR_PROMPT_Y,
                gap: PROP_PROMPT_GAP, range: HOME_DOOR_RANGE, label: () => 'Open door', act: () => from.setOpen(true),
            })),
            ...members.map(member => ({ at: () => {
                    const pose = member.sprite.data;
                    const canReturnBall = member.id === 'senny' && !member.onSofa && home.holding === 'ball';
                    return pose.state === 'greeting' || (pose.state === 'engaged' && !canReturnBall)
                        ? Infinity : member.sprite.x;
                },
                y: () => member.promptAnchor.y, gap: FAMILY_PROMPT_GAP,
                label: () => member.onSofa ? 'Play'
                    : member.id === 'senny' && home.holding === 'ball' ? 'Return ball' : member.prompt,
                act: () => playWith(member) })),
            { at: () => HOME_LIGHT_SWITCH, y: () => 420, gap: PROP_PROMPT_GAP,
                label: () => home.lightOn ? 'Turn off lamp' : 'Turn on lamp', act: () => setLight(!home.lightOn) },
            { at: () => home.holding === 'plushie' ? Infinity : plushie.x, y: () => plushie.y - 44, gap: PROP_PROMPT_GAP,
                surface: () => plushie.y + plushie.height / 2, label: () => 'Pick up plushie', act: () => pickUp('plushie') },
            { at: () => home.ball === 'floor' ? ball.x : Infinity, y: () => ball.y - 44, gap: PROP_PROMPT_GAP,
                surface: () => ball.y + ball.height / 2, label: () => 'Pick up ball', act: () => pickUp('ball') },
            { at: () => home.phase === 'treats' ? HOME_TREATS : Infinity, y: () => bowl.y - 44, gap: PROP_PROMPT_GAP,
                label: () => 'Eat treats', act: eatTreats },
            { at: () => home.phase === 'bedtime' ? HOME_DOG_BED : Infinity, y: () => HOME_WALK_Y - 80, gap: 88,
                surface: () => Math.abs(tokyo.data.feet - HOME_DOG_BED_TOP) <= INTERACT_HEIGHT
                    ? HOME_DOG_BED_TOP : HOME_WALK_Y,
                label: () => 'Go to sleep', act: goToSleep },
        ];
        const dropTarget = { at: () => tokyo.x, y: () => tokyo.y - 60, gap: FAMILY_PROMPT_GAP,
            label: () => 'Put down toy', act: dropToy };

        game.step('home-interactions', dt => {
            elapsed += dt;

            if (!busy()) {
                for (const door of doors) {
                    if (!door.from.open || door.from.room !== home.room) continue;
                    const distance = Math.abs(tokyo.x - door.from.x);
                    if (distance > HOME_DOOR_CLOSE_RANGE) door.from.setOpen(false);
                    else if (distance <= HOME_DOOR_ENTER_RANGE && tokyo.data.grounded) enterRoom(door);
                }
            }
            for (const member of members) animateMember(member, dt);
            const feet = quietTokyo.visible ? quietTokyo.y + RESTING_FOOT_OFFSET : tokyo.data.feet;
            tokyoShadow.x = quietTokyo.visible ? quietTokyo.x : tokyo.x;
            const surface = surfaceBelow(tokyoShadow.x, feet);
            tokyoShadow.y = surface + 2;
            tokyoShadow.alpha = Math.max(0.2, 1 - (surface - feet) / 150);
            if (flight) {
                flight.time += dt;
                const t = Math.min(1, flight.time / BALL_THROW_TIME);
                ball.x = flight.from + (flight.to - flight.from) * t * (2 - t);
                const releaseLift = BALL_RELEASE_HEIGHT - BALL_SIZE / 2;
                ball.y = HOME_WALK_Y - BALL_SIZE / 2 - releaseLift * (1 - t) - BALL_ARC * Math.sin(Math.PI * t);
                if (t === 1) {
                    home.ball = 'floor';
                    flight = null;
                }
            }
            const room = HOME_ROOMS.find(candidate => candidate.id === home.room)!;
            roomTitle.text = room.name;
            goal.text = home.phase === 'play' && room.id === 'living'
                ? 'Pick up your plushie or open the door to explore.'
                : GOAL[home.phase];
            shade.alpha = home.phase === 'sleeping' || (!home.lightOn && room.id === 'living') ? SHADE_ALPHA : 0;
            if (messageAnchor && elapsed < messageUntil && !busy()
                && Math.abs(tokyo.x - messageAnchor.x) <= MESSAGE_RANGE) {
                const point = beside(messageAnchor, HOME_DIALOGUE_WIDTH);
                const bottom = point.y - HOME_PROMPT_HEIGHT / 2 - DIALOGUE_GAP;
                const centerY = bottom - HOME_DIALOGUE_HEIGHT / 2;
                dialogueBox.x = point.x + HOME_DIALOGUE_WIDTH / 2;
                dialogueBox.y = centerY;
                dialogueBox.sx = point.onRight ? 1 : -1;
                dialogueBox.visible = true;
                const textHeight = dialogue.measure().lineCount * DIALOGUE_FONT_SIZE * DIALOGUE_LINE_HEIGHT;
                dialogue.object.x = point.x + DIALOGUE_PADDING;
                dialogue.object.y = centerY - textHeight / 2;
                dialogue.object.visible = true;
            } else {
                dialogueBox.visible = false;
                dialogue.object.visible = false;
            }
            if (home.phase === 'eating') {
                const progress = (elapsed - eatingSince) / EAT_TIME;
                const frame = Math.min(EAT_FRAMES.length - 1, Math.floor(progress * EAT_FRAMES.length));
                quietTokyo.setFrame(EAT_FRAMES[frame]);
            }
            if (busy()) {
                interactRequested = false;
                prompt.hide();
                return;
            }
            if (game.controls.justPressed('pause')) {
                interactRequested = false;
                game.scenes.push('pause');
                return;
            }
            let chosen: typeof targets[number] | undefined;
            let distance = Infinity;
            if (tokyo.data.grounded) {
                for (const target of targets) {
                    const gap = Math.abs(tokyo.x - target.at());
                    const targetSurface = target.surface?.() ?? HOME_WALK_Y;
                    if (gap <= (target.range ?? INTERACT_RANGE) && gap < distance
                        && Math.abs(tokyo.data.feet - targetSurface) <= INTERACT_HEIGHT) {
                        chosen = target;
                        distance = gap;
                    }
                }
            }
            chosen ??= home.holding && tokyo.data.grounded ? dropTarget : undefined;
            if (chosen) {
                const key = game.input.gamepads.some(pad => pad.connected) ? 'Y' : 'F';
                const promptWidth = prompt.measure(chosen.label(), game.touch.visible ? 'touch' : key);
                const point = beside({ x: chosen.at(), y: chosen.y(), gap: chosen.gap }, promptWidth);
                prompt.place(point.x, point.y - HOME_PROMPT_HEIGHT / 2, promptWidth);
            } else {
                prompt.hide();
            }
            if (interactRequested || game.controls.justPressed('interact')) {
                interactRequested = false;
                chosen?.act();
            }
        }, { after: 'rig-follow.camera' });
    },
    exit(): void { game.touch.visible = false; },
};

import { game } from '../engine.js';
import { DREAM_GATE_SCALE, DREAM_SHADOW_WIDTH, DREAM_SHADOW_FOOT_OFFSET } from '../dreamArt.js';
import { run, spawnTokyo } from '../entities/Tokyo.js';
import { FAMILY_GROUND_OFFSET, spawnHomeRoom } from '../home.js';
import { isMobileView, getTouchOverride } from '../mobile.js';
import { DREAM_LEVELS, completeDreamStage, journey } from '../journey.js';

const SCREEN_W = 1280;
const FLOOR = 576;
const LEVEL_FLOORS: Record<number, number> = {
    2: 570, 3: 522, 4: 543, 5: 558, 6: 550, 7: 593, 8: 570, 9: 560,
};
const FLOOR_HEIGHT = 48;
const GRAVITY = 1500;
const WALKING_START = 120;
const EXIT_X = 1172;
const EXIT_RANGE = 62;
const CHAT_RANGE = 68;
const LIGHTS = [204, 467, 730, 993, 1174];
const LIGHT_SAFE_RADIUS = 116;
const LIGHT_BUFFER_RADIUS = 128;
const SHADOW_SPEED = 194;
const SHADOW_TOUCH_DISTANCE = 54;
const HAZARD_TOUCH_X = 48;
const HAZARD_TOUCH_Y = 45;
const FAMILY_SCALE = 1.48;
const FAMILY = [
    { id: 'sandesh', name: 'Sandesh', line: 'Sandesh: “You found your way out!”' },
    { id: 'sushil', name: 'Sushil', line: 'Sushil: “I knew you would find me.”' },
    { id: 'dad', name: 'Dad', line: 'Dad: “The forest could not hide you from us.”' },
    { id: 'mom', name: 'Mom', line: 'Mom: “I knew you would find your way.”' },
    { id: 'reshika', name: 'Reshika', line: 'Reshika: “Come on, Tokyo. Everyone is waiting.”' },
    { id: 'senny', name: 'Senny', line: 'Senny: “I have been calling you, little one.”' },
] as const;

type Hazard = {
    sprite: { x: number; sx: number; setFrame(frame: number): void };
    frames: readonly [number, number];
    low: number;
    high: number;
    speed: number;
    direction: number;
};
type Target = { x: number; label: string; act(): void; ready?: () => boolean };

export const Journey = {
    name: 'journey',
    enter(): void {
        const stage = journey.stage;
        const info = DREAM_LEVELS[stage - 1] ?? DREAM_LEVELS[1];
        const floor = LEVEL_FLOORS[stage] ?? FLOOR;
        const saved = journey.rescued.slice();
        let elapsed = 0;
        let messageTime = 0;
        let stopped = false;
        let stumbleTime = 0;
        let hazardCooldown = 0;
        let doorOpen = stage !== 2;
        let reunionActive = false;
        let reunionTimer = 0;
        let wakeReady = false;
        const hazards: Hazard[] = [];
        const lights: { x: number; sprite: { x: number; y: number; setFrame(frame: number): void } }[] = [];
        const targets: Target[] = [];

        if (stage === 1) {
            game.scenes.go('dream-start');
            return;
        }
        run.scene = 'journey';
        game.camera.snap(SCREEN_W / 2, 360, 1);
        game.physics.gravity(0, GRAVITY);
        game.touch.visible = getTouchOverride() ?? isMobileView();

        if (stage === 7) {
            const { lamp, shade } = spawnHomeRoom();
            lamp.setTexture('home-pixel-lamp-off');
            shade.alpha = 0.28;
        } else {
            game.background.picture(info.background, 'stretch');
        }

        game.touch.button({ code: 'Touch:interact', label: 'INTERACT', anchor: 'bottom-right',
            x: 320, y: 152, r: 40, tint: '#f5df9a' });
        game.ui.pauseButton();
        game.ui.muteButton();

        for (const [id, x, y, w, h] of [
            ['floor', SCREEN_W / 2, floor + FLOOR_HEIGHT / 2, SCREEN_W, FLOOR_HEIGHT],
            ['left-edge', 0, 360, 32, 720],
            ['right-edge', SCREEN_W, 360, 32, 720],
        ] as const) {
            game.spawn({ id: 'journey-' + id, x, y, width: w, height: h, visible: false,
                layer: 'world', body: { type: 'static', friction: 0 } });
        }

        const tokyo = spawnTokyo(WALKING_START, floor,
            () => !stopped && stumbleTime <= 0, stage === 2 ? 1.12 : 1.5);
        if (stage >= 8 && journey.plushie) tokyo.carry('plushie');
        const glowSprites = lights;
        if (stage < 9) {
            for (let i = 0; i < LIGHTS.length; i++) {
                const x = LIGHTS[i];
                const glow = game.spawn({ id: 'safe-light-' + (i + 1), texture: 'dream-light',
                    x, y: floor - 42, width: 170, height: 170, layer: 'world', z: 2, frame: i % 4 });
                glowSprites.push({ x, sprite: glow });
            }
        }
        const aura = game.spawn({ id: 'tokyo-light-shield', texture: 'dream-shield',
            x: WALKING_START, y: floor - 38, width: 120, layer: 'world', z: 9, alpha: 0.84 });
        aura.visible = false;

        let entity: ReturnType<typeof game.spawn> | null = null;
        if (stage < 9) {
            entity = game.spawn({ id: 'roaming-dream-shadow', texture: 'dream-entity', x: 824,
                y: floor - DREAM_SHADOW_FOOT_OFFSET, width: DREAM_SHADOW_WIDTH, layer: 'world', z: 8, frame: 0 });
        }

        const portal = game.spawn({ id: 'journey-exit-portal', texture: 'park-portal', frame: 1,
            x: EXIT_X, y: floor - 83, width: 112, height: 142, layer: 'world', z: 4 });
        if (stage === 9) portal.visible = false;

        const headline = game.text(String(stage).padStart(2, '0') + ' / 09     ' + info.name.toUpperCase(),
            SCREEN_W / 2, 37, { size: 20, font: 'mono-bold', color: '#fff2c9',
                shadow: { color: '#17202c', x: 2, y: 3 } });
        const objective = game.text(info.title, SCREEN_W / 2, 72,
            { size: 15, font: 'mono-bold', color: '#f2e9cb', shadow: { color: '#17202c', x: 1, y: 2 } });
        const companions = game.text(saved.length
            ? 'FOUND: ' + saved.map(id => id.toUpperCase()).join('  ·  ')
            : 'SENNY’S VOICE IS FAR AWAY', SCREEN_W / 2, 106,
            { size: 13, font: 'mono-bold', color: '#f4d88d', shadow: { color: '#17202c', x: 1, y: 2 } });
        const message = game.text(stage === 2
            ? 'Small paws. A long way home.'
            : stage === 9 ? 'Look—your whole family is here!'
            : 'Keep exploring. The warm light keeps Tokyo safe.', SCREEN_W / 2, 614,
            { size: 18, font: 'mono-bold', color: '#fff1cf',
                shadow: { color: '#1c1825', x: 2, y: 2 } });
        const prompt = game.text('', SCREEN_W / 2, 675,
            { size: 14, font: 'mono-bold', color: '#fff6dc', shadow: { color: '#171924', x: 1, y: 2 } });

        if (stage === 2) {
            const gate = game.spawn({ id: 'kennel-front-gate', texture: 'dream-gate', x: 647,
                y: floor - 82, scale: DREAM_GATE_SCALE, layer: 'world', z: 6, frame: 0 });
            const gateWall = game.spawn({ id: 'kennel-gate-collision', x: 647, y: floor - 81,
                width: 54, height: 165, visible: false, layer: 'world',
                body: { type: 'static', friction: 0 } });
            game.spawn({ id: 'kennel-gate-latch', texture: 'dream-latch', x: 424,
                y: floor - 28, width: 54, height: 58, layer: 'world', z: 8 });
            targets.push({ x: 424, label: 'Free the kennel gate', act: () => {
                if (doorOpen) return;
                doorOpen = true;
                gate.setFrame(1);
                gateWall.destroy();
                message.text = 'The latch turns. Tokyo can leave the kennel.';
                messageTime = 4.2;
            } });
        }

        if (stage === 3) {
            game.spawn({ id: 'first-house-way-out', texture: 'dream-light',
                x: 1066, y: floor - 58, width: 110, height: 110, layer: 'world', z: 2 });
        }

        if (stage === 4) {
            const owl = game.spawn({ id: 'forest-wild-owl', texture: 'dream-owl', x: 625,
                y: floor - 91, width: 78, height: 78, layer: 'world', z: 7 });
            hazards.push({ sprite: owl, frames: [0, 1], low: 433, high: 861, speed: 94, direction: 1 });
            game.spawn({ id: 'forest-lost-sign', texture: 'dream-star', x: 368,
                y: floor - 108, width: 35, height: 35, layer: 'world', z: 6, alpha: 0.8 });
        }

        if (stage === 5 || stage === 6) {
            const dogs = stage === 5 ? [
                { x: 538, low: 462, high: 632, speed: 94 },
                { x: 847, low: 786, high: 961, speed: 120 },
            ] : [{ x: 552, low: 500, high: 612, speed: 102 }];
            for (let i = 0; i < dogs.length; i++) {
                const dog = dogs[i];
                const sprite = game.spawn({ id: 'dream-stray-dog-' + (i + 1),
                    texture: 'park-villain-dogs', x: dog.x, y: floor - 42, width: 92, height: 92,
                    layer: 'world', z: 7, frame: i + 1 });
                hazards.push({ sprite, frames: [i + 1, i + 5], low: dog.low, high: dog.high, speed: dog.speed, direction: i % 2 ? -1 : 1 });
            }
        }

        if (stage === 6) {
            for (const cat of [
                { index: 0, x: 414, name: 'Mikan' },
                { index: 1, x: 796, name: 'Sora' },
            ]) {
                const sprite = game.spawn({ id: 'city-cat-' + cat.index, texture: 'dream-cat',
                    frame: cat.index * 2, x: cat.x, y: floor - 29, width: 76, height: 68, layer: 'world', z: 7 });
                targets.push({ x: cat.x, label: 'Say hello to ' + cat.name, ready: () => !journey.visitedCats.includes(cat.index),
                    act: () => {
                        if (!journey.visitedCats.includes(cat.index)) journey.visitedCats.push(cat.index);
                        sprite.setFrame(cat.index * 2 + 1);
                        message.text = cat.name + ' gives Tokyo a friendly little meow.';
                        messageTime = 3.3;
                    } });
            }
        }

        if (stage === 7) {
            const moonPad = game.spawn({ id: 'puzzle-moon-pad', texture: 'dream-puzzle-pad',
                x: 440, y: floor - 31, width: 68, height: 68, layer: 'world', z: 7 });
            const moonMark = game.spawn({ id: 'puzzle-moon-mark', texture: 'dream-moon',
                x: 440, y: floor - 31, width: 40, height: 40, layer: 'world', z: 8 });
            const starPad = game.spawn({ id: 'puzzle-star-pad', texture: 'dream-puzzle-pad',
                x: 708, y: floor - 31, width: 68, height: 68, layer: 'world', z: 7 });
            const starMark = game.spawn({ id: 'puzzle-star-mark', texture: 'dream-star',
                x: 708, y: floor - 31, width: 40, height: 40, layer: 'world', z: 8 });
            if (journey.puzzleStep > 0) moonPad.setFrame(1);
            if (journey.puzzleStep > 1) starPad.setFrame(1);
            void moonMark; void starMark;
            targets.push({ x: 440, label: 'Press the moon stone first', act: () => {
                if (journey.puzzleStep === 0) {
                    journey.puzzleStep = 1;
                    moonPad.setFrame(1);
                    message.text = 'The moon stone glows. Now find the star.';
                } else {
                    message.text = 'Moon first, then the star. Follow the picture hint.';
                }
                messageTime = 3.2;
            } });
            targets.push({ x: 708, label: 'Press the star stone second', act: () => {
                if (journey.puzzleStep === 1) {
                    journey.puzzleStep = 2;
                    starPad.setFrame(1);
                    message.text = 'The hidden door swings open!';
                } else {
                    journey.puzzleStep = 0;
                    moonPad.setFrame(0);
                    starPad.setFrame(0);
                    message.text = 'The stones reset. Look at the moon and star order.';
                }
                messageTime = 3.3;
            } });
        }

        if (stage === 8) {
            const favoriteToy = game.spawn({ id: 'favorite-plushie-on-floor', texture: 'home-plushie',
                x: 858, y: floor - 29, width: 66, layer: 'world', z: 9, visible: !journey.plushie });
            targets.push({ x: 858, label: 'Pick up your favourite plushie', ready: () => !journey.plushie,
                act: () => {
                    journey.plushie = true;
                    tokyo.carry('plushie');
                    favoriteToy.visible = false;
                    message.text = 'There you are. Tokyo has her favourite plushie again.';
                    messageTime = 4;
                } });
        }

        let character: ReturnType<typeof game.spawn> | null = null;
        if (info.family) {
            const person = FAMILY.find(item => item.id === info.family)!;
            character = game.spawn({ id: 'dream-family-' + person.id, texture: 'family-' + person.id,
                x: 1060, y: floor - FAMILY_GROUND_OFFSET * FAMILY_SCALE,
                scale: FAMILY_SCALE, layer: 'world', z: 7 });
            game.text(person.name, 1060, floor - 126,
                { size: 16, font: 'mono-bold', color: '#fff2c9', shadow: { color: '#181923', x: 2, y: 2 } });
            targets.push({ x: 1060, label: 'Run to ' + person.name, act: () => {
                if (!journey.rescued.includes(person.id)) journey.rescued.push(person.id);
                character?.setFrame(4);
                companions.text = 'FOUND: ' + journey.rescued.map(id => id.toUpperCase()).join('  ·  ');
                message.text = person.line;
                messageTime = 4.4;
            } });
        }

        if (stage === 9) {
            const groupX = [481, 593, 705, 817, 929, 1041];
            for (let i = 0; i < FAMILY.length; i++) {
                const person = FAMILY[i];
                const personSprite = game.spawn({ id: 'spring-reunion-' + person.id, texture: 'family-' + person.id,
                    x: groupX[i], y: floor - FAMILY_GROUND_OFFSET * 1.27,
                    scale: 1.27, layer: 'world', z: 7 });
                void personSprite;
                game.text(person.name, groupX[i], floor - 117,
                    { size: 12, font: 'mono-bold', color: '#fff6de',
                        shadow: { color: '#354239', x: 1, y: 2 } });
            }
            targets.push({ x: 758, label: 'Hug everyone', act: () => {
                reunionActive = true;
                reunionTimer = 0;
                message.text = 'Everyone cheers as petals swirl around Tokyo!';
                messageTime = 5;
            } });
        }

        const familyGoalReady = (): boolean => {
            if (stage === 2) return doorOpen && journey.rescued.includes('sandesh');
            if (stage === 6) return journey.visitedCats.length >= 2 && journey.rescued.includes('reshika');
            if (stage === 7) return journey.puzzleStep >= 2 && journey.rescued.includes('senny');
            if (stage === 8) return journey.plushie;
            if (info.family) return journey.rescued.includes(info.family);
            return true;
        };

        if (stage !== 9) {
            targets.push({ x: EXIT_X, label: 'Enter the glowing doorway',
                ready: familyGoalReady,
                act: () => {
                    if (!familyGoalReady()) {
                        if (stage === 2 && !doorOpen) message.text = 'The kennel gate is still latched. Find the lever.';
                        else if (stage === 6 && journey.visitedCats.length < 2) message.text = 'Two city cats still want to say hello.';
                        else if (stage === 7 && journey.puzzleStep < 2) message.text = 'The pawprint stones need their moon-and-star order.';
                        else if (stage === 8 && !journey.plushie) message.text = 'Your favourite plushie is still somewhere in the toy piles.';
                        else message.text = 'There is still someone you need to find.';
                        messageTime = 3.6;
                        return;
                    }
                    completeDreamStage();
                } });
        } else {
            targets.push({ x: 1040, label: 'Wake up with your family', ready: () => wakeReady,
                act: () => completeDreamStage() });
        }

        if (stage === 9) {
            objective.text = 'EVERYONE IS HERE. GIVE THEM A HUG!';
            companions.text = 'SANDESH  ·  SUSHIL  ·  DAD  ·  MOM  ·  RESHIKA  ·  SENNY  ·  PLUSHIE';
        } else if (stage === 6) {
            objective.text = 'FIND MIKAN AND SORA. THEN FIND RESHIKA.';
        } else if (stage === 7) {
            objective.text = 'PUZZLE: MOON FIRST, THEN STAR.';
        } else if (stage === 8 && journey.plushie) {
            objective.text = 'YOUR PLUSHIE IS SAFE. FIND THE LIGHT AHEAD.';
        }

        function caught(reason = 'THE SHADOW FOUND TOKYO'): void {
            if (stopped) return;
            stopped = true;
            game.ui.panel({ anchor: 'center', w: 608, h: 298, z: 30, safeArea: false, style: 'dark' });
            game.text(reason, SCREEN_W / 2, 237,
                { z: 31, size: 32, font: 'mono-bold', color: '#edbdd6' });
            game.text('The warm light will protect her next time.', SCREEN_W / 2, 294,
                { z: 31, size: 18, font: 'mono', color: '#f4e8d0' });
            game.ui.button({ id: 'shadow-retry', anchor: 'center', y: 170, z: 31, h: 58,
                text: 'Try this level again', icon: 'restart', style: 'good',
                onClick: () => game.scenes.go('journey') });
            game.ui.button({ id: 'shadow-home', anchor: 'center', y: 239, z: 31, h: 50,
                text: 'Wake up at home', icon: 'home', style: 'flat',
                onClick: () => game.scenes.go('home') });
            message.text = '';
            prompt.text = '';
        }

        game.step('journey-world', dt => {
            if (stopped) return;
            elapsed += dt;
            if (messageTime > 0) messageTime = Math.max(0, messageTime - dt);
            if (stumbleTime > 0) stumbleTime = Math.max(0, stumbleTime - dt);
            if (hazardCooldown > 0) hazardCooldown = Math.max(0, hazardCooldown - dt);
            const playerX = tokyo.data.x;
            const lightDistance = glowSprites.reduce((best, light) => Math.min(best, Math.abs(playerX - light.x)), Infinity);
            const protectedNow = stage < 9 && lightDistance <= LIGHT_SAFE_RADIUS;
            aura.visible = protectedNow;
            aura.x = playerX;
            aura.y = tokyo.data.feet - 34;
            aura.alpha = 0.62 + Math.sin(elapsed * 3) * 0.12;

            if (entity && stage < 9) {
                const gap = Math.abs(entity.x - playerX);
                const bufferNearby = lightDistance <= LIGHT_BUFFER_RADIUS;
                if (bufferNearby && gap < LIGHT_BUFFER_RADIUS + 10) {
                    if (playerX < entity.x) entity.x = playerX + LIGHT_BUFFER_RADIUS + 10;
                    else entity.x = playerX - LIGHT_BUFFER_RADIUS - 10;
                } else {
                    const direction = playerX < entity.x ? -1 : 1;
                    entity.x += direction * SHADOW_SPEED * dt;
                }
                entity.x = Math.max(40, Math.min(SCREEN_W - 40, entity.x));
                entity.y = floor - DREAM_SHADOW_FOOT_OFFSET + Math.sin(elapsed * 4) * 5;
                entity.sx = playerX < entity.x ? -1 : 1;
                entity.setFrame(Math.floor(elapsed * 3) % 2);
                const distanceAfterMove = Math.abs(entity.x - playerX);
                if (distanceAfterMove < SHADOW_TOUCH_DISTANCE && !protectedNow) caught();
            }

            for (const hazard of hazards) {
                hazard.sprite.x += hazard.direction * hazard.speed * dt;
                if (hazard.sprite.x <= hazard.low || hazard.sprite.x >= hazard.high) {
                    hazard.direction *= -1;
                    hazard.sprite.x = Math.max(hazard.low, Math.min(hazard.high, hazard.sprite.x));
                }
                hazard.sprite.sx = hazard.direction;
                hazard.sprite.setFrame(hazard.frames[Math.floor(elapsed * 2.8) % 2]!);
                const dogHeight = tokyo.data.feet - floor;
                if (Math.abs(tokyo.data.x - hazard.sprite.x) < HAZARD_TOUCH_X
                    && Math.abs(dogHeight) < HAZARD_TOUCH_Y && hazardCooldown <= 0) {
                    stumbleTime = 0.38;
                    hazardCooldown = 1.0;
                    message.text = stage === 4
                        ? 'The owl flutters past. Follow the fireflies.'
                        : 'The stray dog rushes past. Wait for a clear path.';
                    messageTime = 2.4;
                }
            }

            if (stage === 9 && reunionActive) {
                reunionTimer += dt;
                if (reunionTimer > 2.8 && !wakeReady) {
                    wakeReady = true;
                    message.text = 'Everyone is safe. Follow the morning light home.';
                    objective.text = 'PRESS F TO WAKE UP';
                }
            }

            const near = targets
                .filter(target => !target.ready || target.ready())
                .map(target => ({ target, distance: Math.abs(playerX - target.x) }))
                .filter(entry => entry.distance <= (entry.target.x === EXIT_X ? EXIT_RANGE : CHAT_RANGE))
                .sort((a, b) => a.distance - b.distance)[0]?.target;

            prompt.text = near ? (game.touch.visible ? near.label : 'F  ' + near.label)
                : game.touch.visible ? 'Move with the stick · Jump to dodge · Find the warm lights'
                : '← → MOVE   ·   SPACE JUMP   ·   SHIFT RUN   ·   F INTERACT';
            if (messageTime <= 0) {
                message.text = protectedNow
                    ? 'The patch of light protects Tokyo.'
                    : stage === 6 ? 'The cats are friendly. Watch the dog’s path.'
                    : stage === 7 ? 'Press the moon stone, then the star stone.'
                    : stage === 8 && journey.plushie ? 'Her favourite friend is beside her again.'
                    : 'Keep exploring. Stay close to the warm lights.';
            }
            if (near && game.controls.justPressed('interact')) near.act();
            if (game.controls.justPressed('pause')) game.scenes.push('pause');
            void headline;
        }, { after: 'tokyo-visual' });
    },
    exit(): void {
        game.touch.visible = false;
    },
};

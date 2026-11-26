import { game } from '../engine.js';
import { INTERACT_SOUND, PICKUP_SOUND, RIFT_SOUND } from '../actionAudio.js';
import { run, spawnTokyo } from '../entities/Tokyo.js';
import { FAMILY_GROUND_OFFSET, spawnHomeRoom } from '../home.js';
import { isMobileView, getTouchOverride } from '../mobile.js';
import { DREAM_LEVELS, completeDreamStage, journey } from '../journey.js';
import { spawnRiftPortal } from '../riftPortal.js';
import { showDreamTitle, spawnDreamPrompt } from '../dreamPresentation.js';
import { spawnDreamOrb } from '../dreamOrb.js';

const SCREEN_W = 1280;
const FLOOR = 576;
const LEVEL_FLOORS: Record<number, number> = {
    3: 522, 4: 543, 5: 558, 6: 550, 7: 593, 8: 570, 9: 560,
};
const FLOOR_HEIGHT = 48;
const GRAVITY = 1500;
const WALKING_START = 120;
const EXIT_X = 1172;
const EXIT_RANGE = 62;
const PORTAL_HEIGHT = 142;
const CHAT_RANGE = 68;
const ACTION_HEIGHT = 68;
const LIGHTS = [204, 467, 730, 993, 1174];
const HAZARD_TOUCH_X = 48;
const HAZARD_TOUCH_Y = 45;
const FAMILY_SCALE = 1.48;
const FAMILY_ACTION_HEIGHT = 130;
const REUNION_SECONDS = 2.8;
const ORB_LOCATIONS: Record<number, number> = { 3: 625, 4: 747, 5: 709, 6: 922, 7: 876, 8: 1002, 9: 924 };
const FAMILY = [
    { id: 'sandesh', name: 'Sandesh' },
    { id: 'sushil', name: 'Sushil' },
    { id: 'dad', name: 'Dad' },
    { id: 'mom', name: 'Mom' },
    { id: 'reshika', name: 'Reshika' },
    { id: 'senny', name: 'Senny' },
] as const;

type Hazard = {
    sprite: { x: number; sx: number; setFrame(frame: number): void };
    frames: readonly [number, number];
    low: number;
    high: number;
    speed: number;
    direction: number;
};
type Target = { x: number; height?: number; label: string; act(): void; ready?: () => boolean; sound?: string };

export const Journey = {
    name: 'journey',
    enter(): void {
        const stage = journey.stage;
        const info = DREAM_LEVELS[stage - 1] ?? DREAM_LEVELS[1];
        const floor = LEVEL_FLOORS[stage] ?? FLOOR;
        let elapsed = 0;
        let stumbleTime = 0;
        let hazardCooldown = 0;
        let reunionActive = false;
        let reunionTimer = 0;
        let wakeReady = false;
        let orbCollected = false;
        let wasInteract = false;
        let interactRequested = false;
        const hazards: Hazard[] = [];
        const targets: Target[] = [];

        if (stage === 1) {
            game.scenes.go('dream-start');
            return;
        }
        if (stage === 2) {
            game.scenes.go('kennel');
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

        const tokyo = spawnTokyo(WALKING_START, floor, () => stumbleTime <= 0);
        if (stage >= 8 && journey.plushie) tokyo.carry('plushie');
        if (stage < 9) {
            for (let i = 0; i < LIGHTS.length; i++) {
                game.spawn({ id: 'dream-light-' + (i + 1), texture: 'dream-light',
                    x: LIGHTS[i], y: floor - 42, width: 170, height: 170, layer: 'world', z: 2, frame: i % 4 });
            }
        }

        const portal = spawnRiftPortal('journey-exit-portal', EXIT_X, floor, PORTAL_HEIGHT);
        const orb = spawnDreamOrb('journey-orb', ORB_LOCATIONS[stage]!, floor, stage < 6);
        const goal = game.text('', 34, 44, { size: 17, font: 'mono-bold', color: '#fff1d1',
            align: 'left', stroke: { color: '#18121f', width: 3 } });

        showDreamTitle(info.name);
        const prompt = spawnDreamPrompt(() => { interactRequested = true; });

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
                targets.push({ x: cat.x, label: 'Greet ' + cat.name, ready: () => !journey.visitedCats.includes(cat.index),
                    act: () => {
                        journey.visitedCats.push(cat.index);
                        sprite.setFrame(cat.index * 2 + 1);
                    } });
            }
        }

        if (stage === 7) {
            const moonPad = game.spawn({ id: 'puzzle-moon-pad', texture: 'dream-puzzle-pad',
                x: 440, y: floor - 31, width: 68, height: 68, layer: 'world', z: 7 });
            game.spawn({ id: 'puzzle-moon-mark', texture: 'dream-moon',
                x: 440, y: floor - 31, width: 40, height: 40, layer: 'world', z: 8 });
            const starPad = game.spawn({ id: 'puzzle-star-pad', texture: 'dream-puzzle-pad',
                x: 708, y: floor - 31, width: 68, height: 68, layer: 'world', z: 7 });
            game.spawn({ id: 'puzzle-star-mark', texture: 'dream-star',
                x: 708, y: floor - 31, width: 40, height: 40, layer: 'world', z: 8 });
            if (journey.puzzleStep > 0) moonPad.setFrame(1);
            if (journey.puzzleStep > 1) starPad.setFrame(1);
            targets.push({ x: 440, label: 'Press moon first', ready: () => journey.puzzleStep === 0, act: () => {
                journey.puzzleStep = 1;
                moonPad.setFrame(1);
            } });
            targets.push({ x: 708, label: 'Press star second', act: () => {
                if (journey.puzzleStep === 1) {
                    journey.puzzleStep = 2;
                    starPad.setFrame(1);
                } else {
                    journey.puzzleStep = 0;
                    moonPad.setFrame(0);
                    starPad.setFrame(0);
                }
            } });
        }

        if (stage === 8) {
            const favoriteToy = game.spawn({ id: 'favorite-plushie-on-floor', texture: 'home-plushie',
                x: 858, y: floor - 29, width: 66, layer: 'world', z: 9, visible: !journey.plushie });
            targets.push({ x: 858, label: 'Pick up plushie', sound: PICKUP_SOUND, ready: () => !journey.plushie,
                act: () => {
                    journey.plushie = true;
                    tokyo.carry('plushie');
                    favoriteToy.visible = false;
                } });
        }

        if (info.family) {
            const person = FAMILY.find(item => item.id === info.family)!;
            const character = game.spawn({ id: 'dream-family-' + person.id, texture: 'family-' + person.id,
                x: 1060, y: floor - FAMILY_GROUND_OFFSET * FAMILY_SCALE,
                scale: FAMILY_SCALE, layer: 'world', z: 7 });
            targets.push({
                x: 1060, height: FAMILY_ACTION_HEIGHT, label: 'Greet ' + person.name,
                ready: () => !journey.rescued.includes(person.id),
                act: () => {
                    journey.rescued.push(person.id);
                    character.setFrame(4);
                },
            });
        }

        if (stage === 9) {
            const groupX = [481, 593, 705, 817, 929, 1041];
            for (let i = 0; i < FAMILY.length; i++) {
                const person = FAMILY[i];
                game.spawn({ id: 'spring-reunion-' + person.id, texture: 'family-' + person.id,
                    x: groupX[i], y: floor - FAMILY_GROUND_OFFSET * 1.27,
                    scale: 1.27, layer: 'world', z: 7 });
            }
            targets.push({ x: 758, height: FAMILY_ACTION_HEIGHT, label: 'Hug everyone', ready: () => !reunionActive, act: () => {
                reunionActive = true;
                game.particles.burst({ x: tokyo.x, y: floor - 60, count: 24, layer: 'front', frame: 'particle:petal',
                    color: ['#ffdec0', '#ffb8d4', '#fff2cc'], speed: [45, 145], lifespan: [0.8, 1.7] });
            } });
        }

        const storyGoalReady = (): boolean => {
            if (stage === 6) return journey.visitedCats.length >= 2 && journey.rescued.includes('reshika');
            if (stage === 7) return journey.puzzleStep >= 2 && journey.rescued.includes('senny');
            if (stage === 8) return journey.plushie;
            if (stage === 9) return wakeReady;
            if (info.family) return journey.rescued.includes(info.family);
            return true;
        };
        function orbAvailable(): boolean {
            if (stage === 6) return journey.visitedCats.length >= 2;
            if (stage === 7) return journey.puzzleStep >= 2;
            if (stage === 8) return journey.plushie;
            if (stage === 9) return wakeReady;
            return true;
        }
        function goalText(): string {
            if (!orbAvailable()) {
                if (stage === 6) return 'Greet both cats to reveal the orb';
                if (stage === 7) return 'Press moon, then star to reveal the orb';
                if (stage === 8) return 'Find the plushie to reveal the orb';
                return reunionActive ? 'Wait for the morning light' : 'Hug the family to reveal the orb';
            }
            if (!orbCollected) return 'Collect the glowing orb';
            if (!storyGoalReady() && info.family) return 'Greet ' + FAMILY.find(person => person.id === info.family)!.name;
            return stage === 9 ? 'Enter the rift to wake up' : 'Enter the rift';
        }
        targets.push({ x: EXIT_X, label: stage === 9 ? 'Wake up' : 'Enter the rift', sound: RIFT_SOUND,
            ready: () => orbCollected && storyGoalReady(), act: completeDreamStage });

        game.step('journey-world', dt => {
            elapsed += dt;
            if (stumbleTime > 0) stumbleTime = Math.max(0, stumbleTime - dt);
            if (hazardCooldown > 0) hazardCooldown = Math.max(0, hazardCooldown - dt);
            const playerX = tokyo.data.x;
            const interact = game.controls.pressed('interact');
            const interactPressed = interactRequested || game.controls.justPressed('interact') || (interact && !wasInteract);
            interactRequested = false;
            wasInteract = interact;

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
                }
            }

            if (reunionActive && !wakeReady) {
                reunionTimer += dt;
                if (reunionTimer >= REUNION_SECONDS) {
                    wakeReady = true;
                    const glow = game.spawn({ id: 'spring-morning-light', texture: 'dream-light',
                        x: EXIT_X, y: floor - 64, width: 210, alpha: 0, layer: 'world', z: 4 });
                    game.tween.to(glow, { alpha: 1 }, { duration: 0.55, ease: 'easeOutSine' });
                }
            }
            orb.setVisible(orbAvailable());
            if (orb.tryCollect(tokyo)) {
                orbCollected = true;
                portal.setOpen(true);
            }
            const hint = goalText();
            if (goal.text !== hint) goal.text = hint;

            const near = targets
                .filter(target => !target.ready || target.ready())
                .map(target => ({ target, distance: Math.abs(playerX - target.x) }))
                .filter(entry => entry.distance <= (entry.target.x === EXIT_X ? EXIT_RANGE : CHAT_RANGE))
                .sort((a, b) => a.distance - b.distance)[0]?.target;

            if (near) {
                const top = near.x === EXIT_X
                    ? portal.y - PORTAL_HEIGHT / 2
                    : floor - (near.height ?? ACTION_HEIGHT);
                const tapped = prompt.show(near.label, near.x, top, dt);
                if (interactPressed || tapped) {
                    game.sound.play(near.sound ?? INTERACT_SOUND);
                    near.act();
                }
            } else {
                prompt.hide();
            }
            if (game.controls.justPressed('pause')) game.scenes.push('pause');
        }, { after: 'tokyo-visual' });
    },
    exit(): void {
        game.touch.visible = false;
    },
};

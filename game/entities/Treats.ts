import { game } from '../engine.js';
import { PICKUP_SOUND } from '../actionAudio.js';
import { run } from './Tokyo.js';
import { GROUND_Y } from '../meadow.js';

export interface TreatItem {
    id: string;
    x: number;
    baseY: number;
    y: number;
    frame: number;
    collected: boolean;
    sprite: ReturnType<typeof game.spawn>;
    offset: number;
}

export interface TreatsState {
    total: number;
    collected: number;
    allCollected: boolean;
    flagRaised: boolean;
    items: TreatItem[];
    flagSprite?: ReturnType<typeof game.spawn>;
    notification?: ReturnType<typeof game.ui.panel>;
}

// 10 treat placements across the 2400px meadow:
// Ledges are at: x620/y474, x850/y392, x1080/y450, x2030/y456. Low tunnel at x1510..1770.
const TREAT_LOCATIONS = [
    { x: 380, y: 505, frame: 0 },   // Walkway start
    { x: 620, y: 420, frame: 1 },   // Above Ledge 1 (first leap)
    { x: 850, y: 340, frame: 2 },   // Above Ledge 2 (high leap)
    { x: 1080, y: 395, frame: 3 },  // Above Ledge 3 (running jump)
    { x: 1320, y: 505, frame: 0 },  // Before low tunnel
    { x: 1580, y: 535, frame: 1 },  // Inside low tunnel (requires crouching/crawling!)
    { x: 1700, y: 535, frame: 2 },  // Inside low tunnel (crawl reward)
    { x: 1890, y: 505, frame: 3 },  // Exiting low tunnel
    { x: 2030, y: 400, frame: 0 },  // Above Ledge 4
    { x: 2240, y: 505, frame: 1 },  // Near rest grove before victory
];

export let currentTreats: TreatsState = {
    total: TREAT_LOCATIONS.length,
    collected: 0,
    allCollected: false,
    flagRaised: false,
    items: [],
};

let onCollectCallback: ((collected: number, total: number) => void) | undefined;

export function spawnTreats(onCollect?: (collected: number, total: number) => void): TreatsState {
    onCollectCallback = onCollect;
    currentTreats = {
        total: TREAT_LOCATIONS.length,
        collected: 0,
        allCollected: false,
        flagRaised: false,
        items: [],
    };

    // Pre-spawn the goal flagpole at the finish grove (x2280)
    // Initially un-raised at ground level, pops up proudly when all treats are collected
    const flag = game.spawn({
        id: 'victory-flag',
        texture: 'goal-flag',
        x: 2280,
        y: GROUND_Y,
        layer: 'world',
        z: 8,
        visible: false,
        tags: ['flag'],
    });
    currentTreats.flagSprite = flag;

    // Spawn each hovering treat
    for (const [index, loc] of TREAT_LOCATIONS.entries()) {
        const sprite = game.spawn({
            id: `treat-${index + 1}`,
            texture: 'treat-atlas',
            frame: loc.frame,
            x: loc.x,
            y: loc.y,
            layer: 'world',
            z: 9,
            scale: 1.1,
            tags: ['treat'],
        });

        currentTreats.items.push({
            id: `treat-${index + 1}`,
            x: loc.x,
            baseY: loc.y,
            y: loc.y,
            frame: loc.frame,
            collected: false,
            sprite,
            offset: index * 0.75,
        });
    }

    let elapsed = 0;

    // Hover step: gentle floating and pulsing
    game.step('treats-hover', dt => {
        elapsed += dt;
        for (const item of currentTreats.items) {
            if (item.collected || !item.sprite.alive) continue;
            item.y = item.baseY + Math.sin(elapsed * 3.2 + item.offset) * 6;
            item.sprite.y = Math.round(item.y);
            item.sprite.scale = 1.1 + Math.sin(elapsed * 2.2 + item.offset) * 0.06;
        }

        // Flag flutter / bounce when raised
        if (currentTreats.flagRaised && flag.alive) {
            flag.scale = 1.15 + Math.sin(elapsed * 4) * 0.05;
        }
    });

    // Collection step: check distance to Tokyo
    game.step('treats-collect', () => {
        if (!run.tokyo) return;
        const tokyoX = run.tokyo.x;
        const tokyoFeet = run.tokyo.feet;
        const tokyoCenterY = tokyoFeet - 25;

        for (const item of currentTreats.items) {
            if (item.collected || !item.sprite.alive) continue;

            const dx = Math.abs(tokyoX - item.x);
            const dy = Math.abs(tokyoCenterY - item.y);

            // Tokyo collects treat
            if (dx < 42 && dy < 44) {
                collectTreat(item, onCollect);
            }
        }
    });

    return currentTreats;
}

function collectTreat(item: TreatItem, onCollect?: (collected: number, total: number) => void): void {
    item.collected = true;
    currentTreats.collected++;
    game.sound.play(PICKUP_SOUND);

    // Collection pop animation
    game.tween.to(item.sprite, { y: item.y - 36, scale: 1.7, alpha: 0 }, {
        duration: 0.32,
        ease: 'easeOutQuad',
        onComplete: () => item.sprite.destroy(),
    });

    // Spawn golden sparkle particles
    spawnSparkles(item.x, item.y);

    onCollect?.(currentTreats.collected, currentTreats.total);

    // Check if all treats have been collected
    if (currentTreats.collected >= currentTreats.total && !currentTreats.allCollected) {
        currentTreats.allCollected = true;
        triggerAllTreatsCollected();
    }
}

function spawnSparkles(x: number, y: number): void {
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2 + game.rng.between(0, 0.5);
        const dist = game.rng.between(18, 34);
        const sx = x + Math.cos(angle) * dist;
        const sy = y + Math.sin(angle) * dist;
        const sp = game.spawn({
            texture: 'sparkle',
            x,
            y,
            layer: 'world',
            z: 15,
            scale: 0.8,
            alpha: 1,
        });
        game.tween.to(sp, { x: sx, y: sy, alpha: 0, scale: 0.3 }, {
            duration: 0.45,
            ease: 'easeOutQuad',
            onComplete: () => sp.destroy(),
        });
    }
}

function triggerAllTreatsCollected(): void {
    currentTreats.flagRaised = true;

    // 1. Raise and animate the victory flag at x2280
    const flag = currentTreats.flagSprite;
    if (flag?.alive) {
        flag.visible = true;
        flag.y = GROUND_Y;
        game.tween.to(flag, { y: GROUND_Y - 48 }, {
            duration: 0.8,
            ease: 'easeOutBack',
        });
        // Extra burst of celebratory sparkles at the flagpole
        for (let i = 0; i < 8; i++) {
            spawnSparkles(2280 + game.rng.between(-25, 25), GROUND_Y - 30 + game.rng.between(-20, 20));
        }
    }

    // 2. Display the victory notification banner on HUD
    showAllTreatsNotification();
}

function showAllTreatsNotification(): void {
    // Elegant drop-in banner on HUD
    const banner = game.ui.panel({
        anchor: 'top',
        y: -140,
        w: 520,
        h: 96,
        layer: 'hud',
        style: 'dark',
        layout: { direction: 'column', padding: 12, gap: 6, align: 'center', justify: 'center' },
    });

    // Golden title with flag icon
    game.ui.label({
        parent: banner,
        text: '🚩 ALL TREATS COLLECTED! 🦴',
        style: { textColor: '#ffd256', font: 'bold 20px mono' },
    });

    game.ui.label({
        parent: banner,
        text: 'Tokyo found all 10 treats in the meadow! Good girl! ✨',
        style: { textColor: '#f4e8b8', font: '15px mono' },
    });

    currentTreats.notification = banner;

    // Drop down into view
    game.tween.to(banner.ui, { y: 24 }, { duration: 0.5, ease: 'easeOutBack' });
}

/**
 * Debug cheat helper to collect all treats instantly
 */
export function cheatCollectAllTreats(): string {
    for (const item of currentTreats.items) {
        if (!item.collected && item.sprite.alive) {
            item.collected = true;
            item.sprite.destroy();
        }
    }
    currentTreats.collected = currentTreats.total;
    onCollectCallback?.(currentTreats.collected, currentTreats.total);
    if (!currentTreats.allCollected) {
        currentTreats.allCollected = true;
        triggerAllTreatsCollected();
    }
    return `Collected all ${currentTreats.total} treats! Flag raised.`;
}

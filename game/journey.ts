import { game } from './engine.js';
import { loadDreamSprites } from './dreamArt.js';
import { paintKennelFloors } from './kennelTerrain.js';

export type FamilyName = 'sandesh' | 'sushil' | 'dad' | 'mom' | 'reshika' | 'senny';

export const DREAM_LEVELS = [
    { number: 1, name: 'The Dark Place', background: 'dream-dark', family: null },
    { number: 2, name: 'The Kennel', background: 'dream-kennel', family: 'sandesh' },
    { number: 3, name: 'The First House', background: 'dream-night-house', family: 'sushil' },
    { number: 4, name: 'The Dark Forest', background: 'dream-forest', family: 'dad' },
    { number: 5, name: 'The Grassland', background: 'dream-grassland', family: 'mom' },
    { number: 6, name: 'The City', background: 'dream-city', family: 'reshika' },
    { number: 7, name: 'The Puzzle House', background: 'home-room', family: 'senny' },
    { number: 8, name: 'The Toy World', background: 'dream-toys', family: null },
    { number: 9, name: 'The Spring Outdoors', background: 'dream-spring', family: null },
] as const;

export const journey: {
    stage: number;
    rescued: FamilyName[];
    visitedCats: number[];
    plushie: boolean;
    puzzleStep: number;
} = { stage: 1, rescued: [], visitedCats: [], plushie: false, puzzleStep: 0 };

export async function loadJourneyArt(): Promise<void> {
    await game.assets.load([
        // Use the sky above the horizon and the doorway painted into the original backdrop.
        { kind: 'image', key: 'dream-dark', url: 'assets/dream/dark.png', w: 1280, h: 404 },
        { kind: 'image', key: 'dream-kennel', url: 'assets/dream/kennel.png' },
        { kind: 'image', key: 'kennel-platform', url: 'assets/dream/kennel-platform.png' },
        { kind: 'image', key: 'kennel-timber-ledge', url: 'assets/dream/kennel-timber-ledge.png' },
        { kind: 'image', key: 'kennel-lever', url: 'assets/dream/kennel-lever.png', w: 38, h: 36, cols: 2, rows: 1 },
        { kind: 'image', key: 'kennel-room-0', url: 'assets/dream/kennel-room-0.png' },
        { kind: 'image', key: 'kennel-room-1', url: 'assets/dream/kennel-room-1.png' },
        { kind: 'image', key: 'kennel-room-2', url: 'assets/dream/kennel-room-2.png' },
        { kind: 'image', key: 'dream-night-house', url: 'assets/dream/night-house.png' },
        { kind: 'image', key: 'dream-forest', url: 'assets/dream/forest.png' },
        { kind: 'image', key: 'dream-grassland', url: 'assets/dream/grassland.png' },
        { kind: 'image', key: 'dream-city', url: 'assets/dream/city.png' },
        { kind: 'image', key: 'dream-toys', url: 'assets/dream/toys.png' },
        { kind: 'image', key: 'dream-spring', url: 'assets/dream/spring.png' },
    ]);
    await loadDreamSprites();
    paintKennelFloors();
}

export function beginDream(): void {
    journey.stage = 1;
    journey.rescued = [];
    journey.visitedCats = [];
    journey.plushie = false;
    journey.puzzleStep = 0;
    game.scenes.go('dream-start');
}

export function prepareDreamStage(stage: number): void {
    const selected = Math.max(1, Math.min(DREAM_LEVELS.length, Math.round(stage || 1)));
    journey.stage = selected;
    const order: FamilyName[] = ['sandesh', 'sushil', 'dad', 'mom', 'reshika', 'senny'];
    journey.rescued = order.slice(0, Math.max(0, Math.min(6, selected - 2)));
    journey.visitedCats = selected > 6 ? [0, 1] : [];
    journey.plushie = selected > 8;
    journey.puzzleStep = selected > 7 ? 2 : 0;
    game.scenes.go(selected === 1 ? 'dream-start' : 'journey');
}

export function completeDreamStage(): void {
    const stage = journey.stage;
    const milestone = DREAM_LEVELS[stage - 1]?.family;
    if (milestone && !journey.rescued.includes(milestone)) journey.rescued.push(milestone);
    if (stage === 8) journey.plushie = true;
    if (stage === 9) {
        journey.rescued = ['sandesh', 'sushil', 'dad', 'mom', 'reshika', 'senny'];
        journey.plushie = true;
        game.scenes.go('ending');
        return;
    }
    journey.stage = stage + 1;
    journey.visitedCats = [];
    journey.puzzleStep = 0;
    game.scenes.go('journey');
}

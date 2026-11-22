import { game } from '../engine.js';

const WIDTH = 26;
const LINGER_TIME = 11;
const FADE_TIME = 0.9;

export function spawnDroppings(x: number, feet: number): void {
    const pile = game.spawn({ id: 'tokyo-poop', texture: 'tokyo-poop', x, y: feet, width: WIDTH,
        layer: 'world', z: 9 });
    pile.y -= pile.height / 2;
    game.after(LINGER_TIME, () => {
        game.tween.to(pile, { alpha: 0 }, { duration: FADE_TIME, onComplete: () => pile.destroy() });
    });
}

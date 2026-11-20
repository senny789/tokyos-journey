import { game } from './engine.js';
import { run } from './entities/Tokyo.js';

export function addDebugControls(): void {
    game.inspect.state(() => run);
    game.cheats.add({ name: 'screen', does: 'Open title or play', args: 'name',
        run: name => { game.scenes.go(name === 'play' ? 'play' : 'title'); return name ?? 'title'; } });
    game.cheats.add({ name: 'place', does: 'Start beside a practice area: start, jumps, tunnel, rest', args: 'area',
        run: area => {
            const places: Record<string, number> = { start: 220, jumps: 460, tunnel: 1400, rest: 2160 };
            run.spawnX = places[area ?? 'start'] ?? 220; game.scenes.go('play');
            return `Tokyo at ${area ?? 'start'}`;
        } });
}

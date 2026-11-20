import { game } from './engine.js';
import { run } from './entities/Tokyo.js';
import { isMobileView, setTouchOverride } from './mobile.js';

export function addDebugControls(): void {
    game.inspect.state(() => ({
        ...run,
        mobileView: isMobileView(),
        touchVisible: game.touch?.visible ?? false,
        fullscreen: game.commands.isFullscreen,
    }));
    game.cheats.add({ name: 'screen', does: 'Open title or play', args: 'name',
        run: name => { game.scenes.go(name === 'play' ? 'play' : 'title'); return name ?? 'title'; } });
    game.cheats.add({ name: 'place', does: 'Start beside a practice area: start, jumps, tunnel, rest', args: 'area',
        run: area => {
            const places: Record<string, number> = { start: 220, jumps: 460, tunnel: 1400, rest: 2160 };
            run.spawnX = places[area ?? 'start'] ?? 220; game.scenes.go('play');
            return `Tokyo at ${area ?? 'start'}`;
        } });
    game.cheats.add({ name: 'touch', does: 'Toggle touch controls: on, off, auto', args: 'mode',
        run: mode => {
            if (mode === 'on') setTouchOverride(true);
            else if (mode === 'off') setTouchOverride(false);
            else setTouchOverride(null);
            return `Touch controls: ${game.touch.visible ? 'VISIBLE' : 'HIDDEN'} (override: ${mode ?? 'auto'})`;
        } });
    game.cheats.add({ name: 'fullscreen', does: 'Toggle fullscreen: on, off', args: 'mode',
        run: mode => {
            const want = mode === 'on' ? true : mode === 'off' ? false : !game.commands.isFullscreen;
            void game.commands.fullscreen(want);
            return `Fullscreen command sent (target: ${want ? 'ON' : 'OFF'})`;
        } });
}

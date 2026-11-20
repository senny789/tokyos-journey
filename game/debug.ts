import { game } from './engine.js';
import { run } from './entities/Tokyo.js';
import { isMobileView, setTouchOverride, rotateToHorizontal, isForcedHorizontal } from './mobile.js';
import { currentTreats, cheatCollectAllTreats } from './entities/Treats.js';
import { getSettings, updateSettings } from './settings.js';

export function addDebugControls(): void {
    game.inspect.state(() => ({
        ...run,
        mobileView: isMobileView(),
        touchVisible: game.touch?.visible ?? false,
        fullscreen: game.commands.isFullscreen,
        horizontalMode: isForcedHorizontal(),
        settings: getSettings(),
        treats: {
            collected: currentTreats.collected,
            total: currentTreats.total,
            allCollected: currentTreats.allCollected,
            flagRaised: currentTreats.flagRaised,
        },
    }));

    game.cheats.add({
        name: 'screen',
        does: 'Open title, play, pause, or settings',
        args: 'name',
        run: name => {
            const target = name === 'settings' ? 'settings' : name === 'play' ? 'play' : name === 'pause' ? 'pause' : 'title';
            game.scenes.go(target);
            return `Switched to screen: ${target}`;
        }
    });

    game.cheats.add({
        name: 'place',
        does: 'Start beside a practice area: start, jumps, tunnel, rest, flag',
        args: 'area',
        run: area => {
            const places: Record<string, number> = {
                start: 220,
                jumps: 460,
                tunnel: 1400,
                rest: 2160,
                flag: 2240,
            };
            run.spawnX = places[area ?? 'start'] ?? 220;
            game.scenes.go('play');
            return `Tokyo placed at ${area ?? 'start'} (x: ${run.spawnX})`;
        }
    });

    game.cheats.add({
        name: 'touch',
        does: 'Toggle touch controls: on, off, auto',
        args: 'mode',
        run: mode => {
            if (mode === 'on') setTouchOverride(true);
            else if (mode === 'off') setTouchOverride(false);
            else setTouchOverride(null);
            return `Touch controls: ${game.touch.visible ? 'VISIBLE' : 'HIDDEN'} (override: ${mode ?? 'auto'})`;
        }
    });

    game.cheats.add({
        name: 'fullscreen',
        does: 'Toggle fullscreen: on, off',
        args: 'mode',
        run: mode => {
            const want = mode === 'on' ? true : mode === 'off' ? false : !game.commands.isFullscreen;
            void game.commands.fullscreen(want);
            return `Fullscreen command sent (target: ${want ? 'ON' : 'OFF'})`;
        }
    });

    game.cheats.add({
        name: 'treats',
        does: 'Treat controls: all (collect all), status',
        args: 'action',
        run: action => {
            if (action === 'all') {
                return cheatCollectAllTreats();
            }
            return `Treats: ${currentTreats.collected}/${currentTreats.total} (allCollected: ${currentTreats.allCollected}, flagRaised: ${currentTreats.flagRaised})`;
        }
    });

    game.cheats.add({
        name: 'controls',
        does: 'Set control toggle mode: run toggle|hold, crouch toggle|hold',
        args: 'action mode',
        run: (action, mode) => {
            const m = mode === 'toggle' ? 'toggle' : 'hold';
            if (action === 'run') {
                updateSettings({ runBehavior: m });
                return `Run behavior set to: ${m}`;
            }
            if (action === 'crouch') {
                updateSettings({ crouchBehavior: m });
                return `Crouch behavior set to: ${m}`;
            }
            return `Current controls: run=${getSettings().runBehavior}, crouch=${getSettings().crouchBehavior}`;
        }
    });

    game.cheats.add({
        name: 'rotate',
        does: 'Rotate screen to horizontal mode: on, off, toggle',
        args: 'mode',
        run: mode => {
            const want = mode === 'on' ? true : mode === 'off' ? false : undefined;
            void rotateToHorizontal(want);
            return `Rotate command sent (forced horizontal: ${isForcedHorizontal()})`;
        }
    });
}

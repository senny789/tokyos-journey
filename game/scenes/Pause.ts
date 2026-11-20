import { game } from '../engine.js';
import { addFullscreenButton, isMobileView } from '../mobile.js';

export const Pause = {
    name: 'pause',
    enter(): void {
        game.touch.visible = false;
        const W = game.screen.width, H = game.screen.height;
        // The game dimmed beneath, then the menu, which drops in.
        game.ui.panel({ anchor: 'center', w: W, h: H, safeArea: false, style: 'dark' });
        const menu = game.ui.window({ anchor: 'center', w: Math.min(W - 96, 460), h: 'auto', title: 'Paused', titleHeight: 56, layout: { padding: 24, gap: 14, align: 'stretch' } });
        game.ui.button({ parent: menu, h: 80, text: 'Resume', style: 'good', icon: 'play', onClick: () => game.scenes.pop() });
        game.ui.button({ parent: menu, h: 72, text: 'Settings', icon: 'settings', onClick: () => game.scenes.push('settings') });
        const fsMenuItem = game.ui.button({
            parent: menu,
            h: 72,
            text: game.commands.isFullscreen ? 'Exit Fullscreen' : 'Fullscreen',
            icon: game.commands.isFullscreen ? 'fullscreen-exit' : 'fullscreen',
            onClick: async (b) => {
                await game.commands.fullscreen();
                if (b && 'ui' in b) {
                    b.ui.text = game.commands.isFullscreen ? 'Exit Fullscreen' : 'Fullscreen';
                    b.ui.icon = game.commands.isFullscreen ? 'fullscreen-exit' : 'fullscreen';
                }
            },
        });
        game.ui.button({ parent: menu, h: 72, text: 'Restart', icon: 'restart', onClick: () => game.scenes.go('play') });
        game.ui.button({ parent: menu, h: 72, text: 'Title', icon: 'home', onClick: () => game.scenes.go('title') });
        game.ui.muteButton();
        menu.ui.y = -H;
        game.tween.to(menu.ui, { y: 0 }, { duration: 0.35, ease: 'easeOutBack' });
        game.step('pause', () => {
            if (fsMenuItem?.alive) {
                fsMenuItem.ui.text = game.commands.isFullscreen ? 'Exit Fullscreen' : 'Fullscreen';
                fsMenuItem.ui.icon = game.commands.isFullscreen ? 'fullscreen-exit' : 'fullscreen';
            }
            if (game.input.keyPressed('Escape') || game.input.keyPressed('KeyP')) game.scenes.pop();
        });
    },
    exit(): void {
        if (isMobileView()) {
            game.touch.visible = true;
        }
    },
};

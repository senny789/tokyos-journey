import { game } from '../engine.js';
import { getSettings, toggleRunBehavior, toggleCrouchBehavior } from '../settings.js';
import { rotateToHorizontal, isMobileView } from '../mobile.js';

export const Settings = {
    name: 'settings',
    enter(): void {
        game.touch.visible = false;
        const W = game.screen.width, H = game.screen.height;

        // Dimmed backdrop
        game.ui.panel({ anchor: 'center', w: W, h: H, safeArea: false, style: 'dark' });

        const menu = game.ui.window({
            anchor: 'center',
            w: Math.min(W - 96, 540),
            h: 'auto',
            title: 'Settings',
            titleHeight: 56,
            layout: { padding: 24, gap: 12, align: 'stretch' }
        });

        // Controls Section
        game.ui.label({ parent: menu, text: 'CONTROLS CONFIGURATION', style: 'heading' });

        const settings = getSettings();

        // Run mode button and description
        const runBtn = game.ui.button({
            parent: menu,
            h: 60,
            icon: 'gamepad',
            text: `Run Mode: ${settings.runBehavior.toUpperCase()}`,
            onClick: () => {
                const next = toggleRunBehavior();
                runBtn.ui.text = `Run Mode: ${next.toUpperCase()}`;
                runDesc.ui.text = next === 'toggle'
                    ? '• RUN: Tap once to sprint, tap again to walk'
                    : '• RUN: Hold button/key while moving to sprint';
            }
        });

        const runDesc = game.ui.label({
            parent: menu,
            text: settings.runBehavior === 'toggle'
                ? '• RUN: Tap once to sprint, tap again to walk'
                : '• RUN: Hold button/key while moving to sprint',
            style: { textColor: '#c3d1b2', font: '14px mono' }
        });

        // Crouch mode button and description
        const crouchBtn = game.ui.button({
            parent: menu,
            h: 60,
            icon: 'gamepad',
            text: `Crouch Mode: ${settings.crouchBehavior.toUpperCase()}`,
            onClick: () => {
                const next = toggleCrouchBehavior();
                crouchBtn.ui.text = `Crouch Mode: ${next.toUpperCase()}`;
                crouchDesc.ui.text = next === 'toggle'
                    ? '• CROUCH: Tap once to crouch/crawl, tap again to stand'
                    : '• CROUCH: Hold button/key while crawling';
            }
        });

        const crouchDesc = game.ui.label({
            parent: menu,
            text: settings.crouchBehavior === 'toggle'
                ? '• CROUCH: Tap once to crouch/crawl, tap again to stand'
                : '• CROUCH: Hold button/key while crawling',
            style: { textColor: '#c3d1b2', font: '14px mono' }
        });

        // Screen & Display Section
        game.ui.label({ parent: menu, text: 'DISPLAY & ROTATION', style: 'heading' });

        game.ui.button({
            parent: menu,
            h: 56,
            icon: 'redo',
            text: 'Rotate to Horizontal Mode',
            onClick: () => {
                void rotateToHorizontal();
            }
        });

        const fsMenuItem = game.ui.button({
            parent: menu,
            h: 56,
            icon: game.commands.isFullscreen ? 'fullscreen-exit' : 'fullscreen',
            text: game.commands.isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode',
            onClick: async (b) => {
                await game.commands.fullscreen();
                if (b && 'ui' in b) {
                    b.ui.text = game.commands.isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode';
                    b.ui.icon = game.commands.isFullscreen ? 'fullscreen-exit' : 'fullscreen';
                }
            }
        });

        // Done / Back button
        game.ui.button({
            parent: menu,
            h: 64,
            style: 'good',
            icon: 'check',
            text: 'Back to Game',
            onClick: () => game.scenes.pop()
        });

        game.ui.muteButton();

        menu.ui.y = -H;
        game.tween.to(menu.ui, { y: 0 }, { duration: 0.35, ease: 'easeOutBack' });

        game.step('settings', () => {
            if (fsMenuItem?.alive) {
                fsMenuItem.ui.text = game.commands.isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode';
                fsMenuItem.ui.icon = game.commands.isFullscreen ? 'fullscreen-exit' : 'fullscreen';
            }
            if (game.input.keyPressed('Escape') || game.input.keyPressed('KeyP')) {
                game.scenes.pop();
            }
        });
    },
    exit(): void {
        if (isMobileView()) {
            game.touch.visible = true;
        }
    }
};

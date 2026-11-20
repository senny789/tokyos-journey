import { game } from './engine.js';

let touchOverride: boolean | null = null;

/**
 * Checks whether the player is on a mobile/touch device or in mobile view (e.g. touch device or ?mobile / ?touch query param).
 */
export function isMobileView(): boolean {
    if (touchOverride !== null) return touchOverride;
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.has('mobile') || params.has('touch')) return true;
        if (params.get('desktop') === 'true' || params.has('nomobile')) return false;
    }
    return Boolean(game.input.touchDevice || game.touch?.touchDevice);
}

/**
 * Overrides the touch controls visibility for testing or player preference.
 */
export function setTouchOverride(value: boolean | null): void {
    touchOverride = value;
    if (game.scenes.current === 'play') {
        game.touch.visible = value ?? isMobileView();
    }
}

export function getTouchOverride(): boolean | null {
    return touchOverride;
}

/**
 * Adds a responsive Fullscreen toggle button that uses the engine's fullscreen command and icons.
 */
export function addFullscreenButton(spec: {
    anchor?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    x?: number;
    y?: number;
    parent?: unknown;
} = {}) {
    const getIcon = () => (game.commands.isFullscreen ? 'fullscreen-exit' : 'fullscreen');

    const btn = game.ui.button({
        id: 'fullscreen-btn',
        accessibleLabel: 'Toggle Fullscreen',
        anchor: spec.anchor ?? 'top-right',
        x: spec.x ?? -152,
        y: spec.y ?? 16,
        w: 56,
        h: 56,
        style: 'icon',
        icon: getIcon(),
        onClick: (b) => {
            void (async () => {
                try {
                    await game.commands.fullscreen();
                } catch (err) {
                    console.error('Fullscreen toggle error:', err);
                }
                if (b && 'ui' in b) {
                    b.ui.icon = getIcon();
                }
            })();
        },
    });

    return btn;
}

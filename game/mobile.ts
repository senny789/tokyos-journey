import { game } from './engine.js';

let touchOverride: boolean | null = null;
let forceHorizontal = false;
let mobileDisplayRequested = false;

/** Ask once when a mobile player starts the game, rather than after they exit fullscreen. */
export function prepareMobileDisplay(): void {
    if (mobileDisplayRequested || !isMobileView()) return;
    mobileDisplayRequested = true;
    void rotateToHorizontal(true);
}

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
 * Checks if the device/screen is currently in portrait orientation.
 */
export function isPortrait(): boolean {
    if (typeof screen === 'undefined') return false;
    const type = screen.orientation?.type;
    if (type && type.includes('portrait')) return true;
    return Boolean(screen.height && screen.width && screen.height > screen.width);
}

/**
 * Overrides the touch controls visibility for testing or player preference.
 */
export function setTouchOverride(value: boolean | null): void {
    touchOverride = value;
    if (game.scenes.current === 'play' || game.scenes.current === 'meadow' || game.scenes.current === 'home'
        || game.scenes.current === 'dream-start' || game.scenes.current === 'journey' || game.scenes.current === 'ending') {
        game.touch.visible = value ?? isMobileView();
    }
}

export function getTouchOverride(): boolean | null {
    return touchOverride;
}

export function isForcedHorizontal(): boolean {
    return forceHorizontal;
}

/**
 * Rotates the project to horizontal mode on mobile view or user command.
 * Uses the Screen Orientation API when available in conjunction with fullscreen.
 */
export async function rotateToHorizontal(enable?: boolean): Promise<boolean> {
    const want = enable ?? !forceHorizontal;
    forceHorizontal = want;

    // 1. Enter fullscreen if requested
    if (want && !game.commands.isFullscreen) {
        try {
            await game.commands.fullscreen(true);
        } catch {
            // Fullscreen may require direct player interaction on certain browsers
        }
    }

    // 2. Lock screen orientation using standard Screen Orientation API
    try {
        if (typeof screen !== 'undefined' && 'orientation' in screen) {
            const orient = screen.orientation as unknown as {
                lock?: (mode: string) => Promise<void>;
                unlock?: () => void;
            };
            if (want && typeof orient.lock === 'function') {
                await orient.lock('landscape');
            } else if (!want && typeof orient.unlock === 'function') {
                orient.unlock();
            }
        }
    } catch {
        // Handled silently
    }

    return forceHorizontal;
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

/**
 * Adds a quick Rotate-to-Horizontal button that toggles landscape orientation on mobile devices.
 */
export function addRotateButton(spec: {
    anchor?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    x?: number;
    y?: number;
    parent?: unknown;
} = {}) {
    const btn = game.ui.button({
        id: 'rotate-btn',
        accessibleLabel: 'Rotate to Horizontal Mode',
        anchor: spec.anchor ?? 'top-right',
        x: spec.x ?? -216,
        y: spec.y ?? 16,
        w: 56,
        h: 56,
        style: 'icon',
        icon: 'redo',
        onClick: () => {
            void rotateToHorizontal();
        },
    });

    return btn;
}

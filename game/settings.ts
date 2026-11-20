import { game } from './engine.js';
import { isMobileView } from './mobile.js';

export type ControlBehavior = 'hold' | 'toggle';

export interface GameSettings {
    runBehavior: ControlBehavior;
    crouchBehavior: ControlBehavior;
}

let activeSettings: GameSettings | null = null;

/**
 * Returns default settings based on whether the player is on mobile.
 * "make toggle mode default for mobile screens"
 */
export function getDefaultSettings(): GameSettings {
    const isMobile = isMobileView();
    return {
        runBehavior: isMobile ? 'toggle' : 'hold',
        crouchBehavior: isMobile ? 'toggle' : 'hold',
    };
}

/**
 * Retrieves the current user settings, loading from storage if available,
 * or initializing with defaults.
 */
export function getSettings(): GameSettings {
    if (activeSettings) return activeSettings;

    const defaults = getDefaultSettings();
    try {
        const saved = game.save.read<GameSettings | null>('controls-settings', null);
        if (saved && typeof saved === 'object' &&
            (saved.runBehavior === 'hold' || saved.runBehavior === 'toggle') &&
            (saved.crouchBehavior === 'hold' || saved.crouchBehavior === 'toggle')) {
            activeSettings = { ...defaults, ...saved };
            return activeSettings;
        }
    } catch {
        // Fallback to defaults
    }

    activeSettings = { ...defaults };
    return activeSettings;
}

/**
 * Updates partial settings and saves to persistent storage.
 */
export function updateSettings(partial: Partial<GameSettings>): GameSettings {
    const current = getSettings();
    activeSettings = { ...current, ...partial };
    try {
        game.save.write('controls-settings', activeSettings);
    } catch {
        // Continue if save throws in restricted environments
    }
    return activeSettings;
}

/**
 * Toggles the Run control behavior between hold and toggle.
 */
export function toggleRunBehavior(): ControlBehavior {
    const current = getSettings();
    const next: ControlBehavior = current.runBehavior === 'toggle' ? 'hold' : 'toggle';
    updateSettings({ runBehavior: next });
    return next;
}

/**
 * Toggles the Crouch control behavior between hold and toggle.
 */
export function toggleCrouchBehavior(): ControlBehavior {
    const current = getSettings();
    const next: ControlBehavior = current.crouchBehavior === 'toggle' ? 'hold' : 'toggle';
    updateSettings({ crouchBehavior: next });
    return next;
}

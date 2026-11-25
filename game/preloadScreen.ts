import { game } from './engine.js';

const BADGE_POSITION = 'center calc(50% - clamp(62px, 19vmin, 158px))';
const BADGE_SIZE = 'clamp(76px, 23vmin, 184px)';
const TOKYO_WIDTH = 'clamp(62px, 18vmin, 146px)';

export function configureLoadingScreen(): void {
    const assetBase = game.assets.baseURL.replace(/\/$/, '') || '.';
    game.preloader.configure({
        delay: 0,
        fadeOut: 0.24,
        background: [
            `url("${assetBase}/assets/tokyo-loading.png") ${BADGE_POSITION} / ${TOKYO_WIDTH} auto no-repeat`,
            `radial-gradient(circle closest-side, #445740 84%, #dcb8747d 85%, transparent 89%) `
                + `${BADGE_POSITION} / ${BADGE_SIZE} ${BADGE_SIZE} no-repeat`,
            'linear-gradient(180deg, #172a23a8, #192e26c7 52%, #14241fe8)',
            `url("${assetBase}/assets/title-home-dusk.png") center / cover no-repeat`,
            '#253c36',
        ].join(', '),
        style: {
            title: 'Loading Tokyo’s Journey',
            fill: '#eeb664',
            track: '#182b22',
            border: '#bfa064',
            text: '#fff1d0',
            font: '700 16px/1.4 system-ui, sans-serif',
        },
    });
}

import { game } from './engine.js';

export function paintArt(): void {
    game.paint('meadow', 2400, 720, ctx => {
        ctx.fillStyle = '#c8ded6'; ctx.fillRect(0, 0, 2400, 720);
        ctx.fillStyle = '#d7e3d2'; ctx.fillRect(0, 144, 2400, 576);
        ctx.fillStyle = '#e7e7cf'; ctx.fillRect(0, 272, 2400, 448);
        ctx.fillStyle = '#f2dfad'; ctx.fillRect(1008, 128, 80, 64); ctx.fillRect(1016, 120, 64, 80);
        ctx.fillStyle = '#f7efcf';
        for (const [x, y, w] of [[90, 170, 150], [480, 212, 180], [1220, 156, 160], [1760, 180, 200], [2180, 232, 160]]) {
            ctx.fillRect(x, y, w, 12); ctx.fillRect(x + 20, y - 12, w - 60, 12);
            ctx.fillRect(x + 40, y - 24, w - 100, 12);
        }
    }, { res: 1 });
    game.paint('tunnel', 260, 100, ctx => {
        ctx.fillStyle = '#343d36'; ctx.fillRect(0, 0, 260, 100);
        ctx.fillStyle = '#6d775d'; ctx.fillRect(4, 4, 252, 88);
        ctx.fillStyle = '#8b946a';
        for (let y = 12; y < 88; y += 24) for (let x = (y % 48 === 12 ? 8 : 32); x < 250; x += 60) ctx.fillRect(x, y, 48, 12);
        ctx.fillStyle = '#a8bd78'; ctx.fillRect(0, 0, 260, 8);
    }, { res: 1 });
    game.paint('signpost', 220, 50, ctx => {
        ctx.fillStyle = '#4f4b3b'; ctx.fillRect(104, 0, 12, 50);
        ctx.fillStyle = '#6c674b'; ctx.fillRect(0, 0, 220, 32);
        ctx.fillStyle = '#82795a'; ctx.fillRect(4, 4, 212, 24);
    }, { res: 1 });
    game.paint('shadow', 60, 10, ctx => {
        ctx.fillStyle = '#263e3d'; ctx.fillRect(8, 2, 44, 6); ctx.fillRect(0, 4, 60, 2);
    }, { res: 1 });
}


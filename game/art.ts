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
    game.paint('goal-flag', 48, 96, ctx => {
        // Flagpole
        ctx.fillStyle = '#3c3226'; ctx.fillRect(8, 6, 6, 90);
        ctx.fillStyle = '#594a38'; ctx.fillRect(10, 6, 2, 90);
        // Golden finial ball
        ctx.fillStyle = '#f5c842'; ctx.fillRect(6, 0, 10, 8);
        ctx.fillStyle = '#ffe992'; ctx.fillRect(8, 2, 4, 4);
        // Fluttering banner
        ctx.fillStyle = '#c7382c'; ctx.fillRect(14, 8, 32, 34);
        ctx.fillStyle = '#e85848'; ctx.fillRect(16, 10, 28, 14);
        ctx.fillStyle = '#9b241a'; ctx.fillRect(14, 40, 32, 2);
        // Paw print emblem on banner
        ctx.fillStyle = '#ffeaa7';
        ctx.fillRect(26, 26, 8, 7);
        ctx.fillRect(27, 24, 6, 2);
        ctx.fillRect(22, 19, 3, 4);
        ctx.fillRect(27, 16, 4, 4);
        ctx.fillRect(33, 19, 3, 4);
        // Rippled pennant edge
        ctx.clearRect(42, 36, 6, 6);
        ctx.clearRect(40, 8, 8, 2);
    }, { res: 1 });
    game.paint('sparkle', 16, 16, ctx => {
        ctx.fillStyle = '#ffd358'; ctx.fillRect(7, 1, 2, 14); ctx.fillRect(1, 7, 14, 2);
        ctx.fillStyle = '#fff4a3'; ctx.fillRect(6, 6, 4, 4);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(7, 7, 2, 2);
    }, { res: 1 });
    game.paint('treat-icon', 24, 24, ctx => {
        // Little golden bone/biscuit icon
        ctx.fillStyle = '#e6a845';
        ctx.fillRect(3, 4, 4, 5); ctx.fillRect(3, 15, 4, 5);
        ctx.fillRect(17, 4, 4, 5); ctx.fillRect(17, 15, 4, 5);
        ctx.fillRect(5, 9, 14, 6);
        ctx.fillStyle = '#ffd175';
        ctx.fillRect(4, 5, 2, 3); ctx.fillRect(18, 5, 2, 3);
        ctx.fillRect(7, 10, 10, 2);
    }, { res: 1 });
}


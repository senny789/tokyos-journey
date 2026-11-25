import { game } from '../engine.js';
import { run } from './Tokyo.js';
import { PARK_GROUND, park, say } from '../playground.js';
import { parkProp } from '../parkMap.js';

const DOG_SPEED = 34, DOG_FOLLOW_SPEED = 75, DOG_PERSONAL_SPACE = 90;
const DOG_NAMES = ['Dash', 'Dumpling', 'Patch', 'Bruno'];
export type ParkInteraction = {
    x: () => number; y: number; prompt: () => string; act: () => void | false;
    radius?: number; available?: () => boolean; sound?: string | null;
};
export function parkSparkles(x: number, y: number): void {
    game.particles.burst({ x, y, count: 12, layer: 'front', frame: 'particle:star',
        speed: [35, 100], lifespan: [0.3, 0.8], color: ['#ffe39a', '#f7fcdf'] });
}
export function spawnParkWildlife(interactions: ParkInteraction[]): void {
    for (let i = 0; i < 4; i++) {
        const home = 5100 + i * 250;
        const dog = game.spawn({ id: `park-dog-${i + 1}`, texture: 'park-villain-dogs', frame: i,
            x: home, y: PARK_GROUND - 46, height: 92, layer: 'world', z: 8,
            tags: ['park-dog'], data: { home, direction: i % 2 ? 1 : -1, friendly: park.friends.includes(i), mood: 'patrolling', clock: i } });
        const name = game.text(DOG_NAMES[i], dog.x, PARK_GROUND - 112,
            { size: 15, font: 'mono-bold', color: '#374b3e', layer: 'world' });
        interactions.push({ x: () => dog.x, y: PARK_GROUND - 35, radius: 115,
            prompt: () => dog.data.friendly ? `F: play with ${DOG_NAMES[i]}` : `E: sit, then F: befriend ${DOG_NAMES[i]}`,
            act: () => {
                if (!run.tokyo?.seated && !dog.data.friendly) { say(`${DOG_NAMES[i]} is shy. Sit with E, then press F to say hello.`); return false; }
                if (!dog.data.friendly) { park.friends.push(i); dog.data.friendly = true; }
                say(`${DOG_NAMES[i]} trusts Tokyo! A happy little play-bow.`);
                parkSparkles(dog.x, dog.y);
                game.tween.to(dog, { y: PARK_GROUND - 66 }, { duration: 0.2, yoyo: true });
            } });
        game.step(`dog-behavior-${i}`, dt => {
            const d = dog.data, tokyo = run.tokyo;
            d.clock += dt;
            const dx = (tokyo?.x ?? home) - dog.x;
            const nearby = Math.abs(dx) < 180;
            if (d.friendly && nearby && Math.abs(dx) > DOG_PERSONAL_SPACE) {
                d.direction = Math.sign(dx); dog.x += d.direction * DOG_FOLLOW_SPEED * dt; d.mood = 'following';
            } else if (!d.friendly && nearby && tokyo?.sprinting && Math.abs(dx) < 130) {
                d.direction = -Math.sign(dx); dog.x += d.direction * DOG_SPEED * dt; d.mood = 'shy';
            } else if (nearby) { d.mood = d.friendly ? 'happy' : 'curious'; d.direction = Math.sign(dx) || 1; }
            else {
                d.mood = 'patrolling'; dog.x += d.direction * DOG_SPEED * dt;
                if (Math.abs(dog.x - home) > 80) d.direction = dog.x > home ? -1 : 1;
            }
            dog.x = Math.max(home - 150, Math.min(home + 150, dog.x));
            dog.sx = d.direction;
            dog.setFrame(i + (Math.floor(d.clock * 2) % 2) * 4);
            dog.tint = d.friendly ? '#fff3ca' : '#ffffff';
            name.x = dog.x; name.text = `${DOG_NAMES[i]}${d.friendly ? ' / FRIEND' : ''}`;
        });
    }
    for (let i = 0; i < 6; i++) {
        const x = 3220 + i * 115;
        const insect = parkProp(`garden-insect-${i + 1}`, 'insects', i, x, i < 3 ? 32 : 26,
            i < 3 ? 440 : PARK_GROUND - 2);
        let elapsed = i;
        game.step(`insect-behavior-${i}`, dt => {
            elapsed += dt;
            const flee = run.tokyo && Math.abs(run.tokyo.x - insect.x) < 110 ? 1 : 0;
            insect.x = x + Math.sin(elapsed * (i === 2 ? 1.8 : 0.8)) * (flee ? 65 : 30);
            if (i < 3) {
                insect.y = 420 + Math.sin(elapsed * 2 + i) * 30 - flee * 35;
                insect.sy = 0.7 + Math.abs(Math.sin(elapsed * 12)) * 0.3;
            } else if (i === 4) insect.y = PARK_GROUND - 16 - Math.max(0, Math.sin(elapsed * 2.6)) * (flee ? 70 : 30);
            else insect.y = PARK_GROUND - 15;
            insect.sx = Math.cos(elapsed * 0.8) > 0 ? 1 : -1;
        });
    }
}

import { game } from './engine.js';
import { run } from './entities/Tokyo.js';

export const PARK_WIDTH = 6400, PARK_GROUND = 560;
export const PARK_AREAS = [
    { name: 'Home & rest', x: 240, description: 'Beds, doghouse and a warm welcome' },
    { name: 'Fetch lawn', x: 1110, description: 'Bring a stick back to the mail carrier' },
    { name: 'Adventure yard', x: 1980, description: 'Crates, stepping rocks and a crawl tunnel' },
    { name: 'Wildlife garden', x: 3230, description: 'Sniff six bushes; watch six tiny creatures' },
    { name: 'Picnic corner', x: 4250, description: 'Sample six snacks and say hello' },
    { name: 'Dog club & portal', x: 5270, description: 'Befriend four rivals and find the gateway' },
] as const;
export const BADGE_NAMES = ['Cozy paws', 'Fetch star', 'Treat explorer', 'Hide & seek', 'Super sniffer', 'Picnic pal', 'Dog whisperer', 'Hello, neighbor'];
export const park = {
    treats: [] as number[], sniffed: [] as number[], snacks: [] as number[], friends: [] as number[], greeted: [] as number[],
    rested: false, fetched: false, hidden: false, carrying: -1, night: false, celebrated: false,
    message: 'Welcome! Walk right, meet your neighbors, and press F to play.', messageTime: 7,
};
export function badges(): boolean[] {
    return [park.rested, park.fetched, park.treats.length === 12, park.hidden, park.sniffed.length === 6,
        park.snacks.length === 6, park.friends.length === 4, park.greeted.length === 4];
}
export function say(message: string): void { park.message = message; park.messageTime = 5; }
export function startPlayground(): void {
    park.treats = []; park.sniffed = []; park.snacks = []; park.friends = []; park.greeted = [];
    park.rested = false; park.fetched = false; park.hidden = false; park.carrying = -1;
    park.night = false; park.celebrated = false;
    say('Welcome! Walk right, meet your neighbors, and press F to play.');
    visitArea(PARK_AREAS[0].x);
}
export function visitArea(x: number): void { run.spawnX = x; game.scenes.go('play'); }
export function currentArea(x: number): string {
    return PARK_AREAS.filter(area => x >= area.x - 180).pop()?.name ?? PARK_AREAS[0].name;
}

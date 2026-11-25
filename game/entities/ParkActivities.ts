import { game } from '../engine.js';
import { INTERACT_SOUND, PICKUP_SOUND, RIFT_SOUND } from '../actionAudio.js';
import { run } from './Tokyo.js';
import { PARK_GROUND, badges, park, say } from '../playground.js';
import { parkProp } from '../parkMap.js';
import { spawnRiftPortal } from '../riftPortal.js';
import { parkSparkles, spawnParkWildlife, type ParkInteraction } from './ParkWildlife.js';
import { createDialogueVoice } from '../dialogueAudio.js';

const INTERACTION_RANGE = 92, REST_SECONDS = 2;
const PORTAL_X = 6210, PORTAL_HEIGHT = 235;
const TREAT_POSITIONS = [
    [470, 515], [1190, 510], [1790, 425], [2070, 450], [2290, 415], [2420, 345],
    [2760, 535], [2925, 535], [3440, 505], [4020, 505], [4960, 510], [6100, 505],
];
const PEOPLE_X = [470, 1050, 4340, 4870];
const PEOPLE_LINES = [
    'Welcome home, Tokyo! Try a bed, then follow the path to the fetch lawn.',
    'Fetch time! Pick up a stick with F and bring it back to me.',
    'Good girl! The picnic is yours to explore. F to sample each snack.',
    'The dogs look tough, but they are shy. Sit with E, then greet each with F.',
];
const FOOD_NAMES = ['kibble bowl', 'roast', 'sausage links', 'cheese', 'fish plate', 'birthday cake'];
const BUSH_X = [3250, 3370, 3500, 3620, 3750, 3880];

export function spawnParkActivities() {
    const interactions: ParkInteraction[] = [];
    const voice = createDialogueVoice();
    let spokenLine: string | null = null;
    let nearest: ParkInteraction | undefined;
    let hidingTime = 0, restTime = 0;
    const restSpots = [350, 710, 4530, 5740];
    [260, 1480, 650, 4660].forEach((x, i) => interactions.push({ x: () => x, y: PARK_GROUND - 25,
        prompt: () => ['F: knock at home', 'F: visit the neighbor', 'F: settle into the doghouse', 'F: switch the cabin lantern / day-night'][i],
        act: () => {
            if (i === 3) { park.night = !park.night; say(park.night ? 'The cabin lantern glows. Time for moonlight adventures!' : 'Good morning! The whole park is awake.'); }
            else if (i === 2 && run.tokyo?.grounded) {
                run.tokyo.seated = true; run.tokyo.sitPhase = 'down'; run.tokyo.sitTime = 0;
                say('Home sweet doghouse. Stay cozy for a moment.');
            } else say(i === 0 ? 'Home is always here for Tokyo. Her favorite bed is just to the right.' : 'A friendly wave from the window! The fetch lawn is a favorite around here.');
        } }));
    restSpots.forEach((x, i) => {
        parkProp(`park-bed-${i + 1}`, 'beds', i, x, i === 2 ? 94 : 58);
        interactions.push({ x: () => x, y: PARK_GROUND - 25, prompt: () => 'F: curl up / E: get up', act: () => {
            const d = run.tokyo;
            if (!d || !d.grounded) return false;
            d.seated = true; d.sitPhase = 'down'; d.sitTime = 0;
            d.crouchToggled = false;
            say('A cozy rest. Stay seated for two seconds to earn Cozy paws.');
        } });
    });
    PEOPLE_X.forEach((x, i) => {
        const person = parkProp(`park-person-${i + 1}`, 'people', i, x, i === 2 ? 100 : 158, PARK_GROUND, true);
        interactions.push({ x: () => x, y: PARK_GROUND - 35,
            prompt: () => i === 1 && park.carrying >= 0 ? 'F: return the fetch stick' : 'F: say hello',
            sound: null,
            act: () => {
                if (!park.greeted.includes(i)) park.greeted.push(i);
                let line = PEOPLE_LINES[i]!;
                if (i === 1 && park.carrying >= 0) {
                    park.carrying = -1; park.fetched = true;
                    line = 'Perfect fetch! The mail carrier cheers for Tokyo. Fetch star earned!';
                    parkSparkles(x, PARK_GROUND - 80);
                }
                say(line);
                spokenLine = line;
                voice.speak(line, park.messageTime);
                game.tween.to(person, { y: person.y - 8 }, { duration: 0.2, yoyo: true });
            } });
    });
    for (let i = 0; i < 6; i++) {
        const x = 1270 + i * 86;
        const stick = parkProp(`fetch-stick-${i + 1}`, 'sticks', i, x, 40);
        interactions.push({ x: () => x, y: PARK_GROUND - 20, available: () => park.carrying !== i,
            sound: PICKUP_SOUND,
            prompt: () => park.carrying >= 0 ? 'F: swap fetch sticks' : 'F: pick up a fetch stick',
            act: () => { park.carrying = i; say('Stick collected! Bring it left to the mail carrier, or F in open space to toss it.'); } });
        game.step(`fetch-stick-${i}`, () => {
            const d = run.tokyo;
            if (park.carrying === i && d) {
                stick.x = d.x + d.facing * 42; stick.y = d.feet - 42;
                stick.rot = d.facing * 0.5; stick.z = 12;
            } else { stick.x = x; stick.y = PARK_GROUND - 20; stick.rot = 0; stick.z = 4; }
        });
    }
    BUSH_X.forEach((x, i) => {
        const bush = parkProp(`sniff-bush-${i + 1}`, 'bushes', i, x, i === 2 ? 136 : 85, PARK_GROUND, true);
        interactions.push({ x: () => x, y: PARK_GROUND - 28,
            prompt: () => park.sniffed.includes(i) ? 'F: sniff this familiar scent' : 'F: sniff for a surprise',
            act: () => {
                if (!park.sniffed.includes(i)) park.sniffed.push(i);
                say(`Sniff sniff! ${['Berry scent', 'Fresh rain', 'A squirrel trail', 'Wildflowers', 'Cool moss', 'Autumn leaves'][i]}. Bushes explored: ${park.sniffed.length}/6.`);
                parkSparkles(x, PARK_GROUND - 65);
                game.tween.to(bush, { rot: 0.08 }, { duration: 0.12, yoyo: true });
            } });
    });
    for (let i = 0; i < 6; i++) {
        const x = 4060 + i * 91;
        const food = parkProp(`picnic-food-${i + 1}`, 'food', i, x, 50);
        food.alpha = park.snacks.includes(i) ? 0.4 : 1;
        interactions.push({ x: () => x, y: PARK_GROUND - 20,
            prompt: () => park.snacks.includes(i) ? `F: sniff the ${FOOD_NAMES[i]}` : `F: sample the ${FOOD_NAMES[i]}`,
            act: () => {
                if (!park.snacks.includes(i)) park.snacks.push(i);
                food.alpha = 0.4; parkSparkles(x, food.y);
                say(`Yum! Tokyo sampled the ${FOOD_NAMES[i]}. Picnic discoveries: ${park.snacks.length}/6.`);
            } });
    }
    interactions.push({ x: () => 1930, y: PARK_GROUND - 25, prompt: () => 'DOWN + F: hide in the open box', act: () => {
        if (!run.tokyo?.crouched) { say('Hold DOWN or C to crouch, then press F to hide in the open box.'); return false; }
        hidingTime = 1.4; park.hidden = true;
        say('Peekaboo! Tokyo found her hiding place. Hide & seek earned!'); parkSparkles(1930, 500);
    } });
    let crateOpened = false;
    interactions.push({ x: () => 2980, y: PARK_GROUND - 25, prompt: () => crateOpened ? 'F: investigate the empty reward crate' : 'F: open the mystery crate', act: () => {
        if (crateOpened) { say('The mystery crate is empty. More adventures wait to the right!'); return; }
        crateOpened = true; parkSparkles(2980, 500);
        say('A shower of golden stars! The mystery crate says: follow your nose into the garden.');
    } });
    const portal = spawnRiftPortal('park-portal', PORTAL_X, PARK_GROUND, PORTAL_HEIGHT);
    portal.setOpen(badges().every(Boolean));
    interactions.push({ x: () => PORTAL_X, y: PARK_GROUND - 50, radius: 145,
        sound: RIFT_SOUND,
        prompt: () => portal.data.open ? 'F: enter the rift to celebrate' : 'Rift sealed. Earn all 8 activity badges.',
        act: () => {
            if (!portal.data.open) { say('Check the Park map for badge activities.'); return false; }
            park.celebrated = true; parkSparkles(PORTAL_X, 400); game.scenes.push('celebration');
        } });
    TREAT_POSITIONS.forEach(([x, y], i) => {
        if (park.treats.includes(i)) return;
        const treat = game.spawn({ id: `park-treat-${i + 1}`, texture: 'park-treats', frame: i % 4, x, y,
            width: 38, layer: 'world', z: 9, tags: ['park-treat'], data: { collected: false } });
        let elapsed = i;
        game.step(`park-treat-${i}`, dt => {
            elapsed += dt;
            if (treat.data.collected) return;
            treat.y = y + Math.sin(elapsed * 3) * 5;
            const d = run.tokyo;
            if (d && Math.abs(d.x - x) < 43 && Math.abs(d.feet - 25 - treat.y) < 42) {
                treat.data.collected = true; park.treats.push(i); parkSparkles(x, treat.y);
                game.sound.play(PICKUP_SOUND);
                say(`Tasty discovery! Treats ${park.treats.length}/12${park.treats.length === 12 ? ' - Treat explorer earned!' : '.'}`);
                game.tween.to(treat, { y: treat.y - 30, alpha: 0 }, { duration: 0.25, onComplete: () => treat.destroy() });
            }
        }, { after: 'tokyo-visual' });
    });
    spawnParkWildlife(interactions);
    const interact = (): void => {
        const d = run.tokyo;
        if (!d) return;
        if (nearest) {
            const sound = nearest.sound === undefined ? INTERACT_SOUND : nearest.sound;
            if (nearest.act() !== false && sound) game.sound.play(sound);
        } else if (park.carrying >= 0) {
            const thrown = parkProp('thrown-stick', 'sticks', park.carrying, d.x + d.facing * 50, 40, d.feet - 50);
            game.sound.play(INTERACT_SOUND);
            park.carrying = -1;
            game.tween.to(thrown, { x: d.x + d.facing * 260, y: PARK_GROUND - 20, rot: d.facing * 5 },
                { duration: 0.7, onComplete: () => thrown.destroy() });
            say('Wheee! The fetch sticks are back on the lawn whenever you want another go.');
        } else say('Woof! Find a neighbor, bush, bed, snack or stick to interact with.');
    };
    game.step('park-interactions', dt => {
        const d = run.tokyo;
        if (!d) return;
        park.messageTime = Math.max(0, park.messageTime - dt);
        hidingTime = Math.max(0, hidingTime - dt);
        for (const tokyo of game.roster.tagged('tokyo')) tokyo.alpha = hidingTime > 0 && Math.abs(d.x - 1930) < 75 ? 0.25 : 1;
        const atBed = restSpots.some(x => Math.abs(d.x - x) < 70);
        restTime = atBed && d.seated && d.grounded ? restTime + dt : 0;
        if (restTime >= REST_SECONDS && !park.rested) { park.rested = true; say('Cozy paws earned! Tokyo is ready for another adventure.'); parkSparkles(d.x, d.feet - 40); }
        if (spokenLine !== null && (park.message !== spokenLine || park.messageTime === 0)) {
            voice.stop();
            spokenLine = null;
        }
        nearest = interactions.filter(item => (item.available?.() ?? true) && Math.abs(d.x - item.x()) < (item.radius ?? INTERACTION_RANGE)
            && Math.abs(d.feet - 25 - item.y) < 95)
            .sort((a, b) => Math.abs(d.x - a.x()) - Math.abs(d.x - b.x()))[0];
        portal.setOpen(badges().every(Boolean));
        if (game.controls.justPressed('interact')) interact();
    }, { after: 'tokyo-visual' });
    return { interact, prompt: () => nearest?.prompt() ?? (park.carrying >= 0 ? 'F: toss stick / return it to the mail carrier' : 'Explore freely - M opens your park map') };
}

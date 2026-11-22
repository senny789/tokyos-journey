import { existsSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { stripTypeScriptTypes } from 'node:module';

const PORT = Number(process.env.TOKYO_PREVIEW_PORT ?? 4181);
const HOST = '127.0.0.1';
const projectFile = path => new URL(`../${path}`, import.meta.url);
const readText = path => readFileSync(projectFile(path), 'utf8');

// The checked-in bundle already contains the engine. Keep that part intact
// and load the current game modules separately so source edits show on reload.
const bundle = readText('dist/game.js');
const sourceStart = bundle.search(/^\/\/ game\/assets\.json\r?$/m);
const engine = bundle.slice(0, sourceStart);
if (sourceStart < 0 || !engine.includes('var game = composed.game;')) {
    throw new Error('Could not find the Phaser runtime in dist/game.js. Restore the game’s Phaser AE engine to use the normal build.');
}
const licenseStart = bundle.indexOf('\n/*!', sourceStart);
const licenses = licenseStart < 0 ? '' : bundle.slice(licenseStart);

const html = readText('dist/index.html').replace('src="./game.js"', 'src="./main.js"');
const mimeTypes = new Map([
    ['html', 'text/html; charset=utf-8'],
    ['js', 'text/javascript; charset=utf-8'],
    ['png', 'image/png'],
    ['wasm', 'application/wasm'],
]);

function readPreview(path) {
    if (path === '/') return ['html', html];
    if (path === '/engine.js') return ['js', `${engine}\nexport { game, signals, composed };\n${licenses}`];
    if (path === '/text-shaper.wasm') return ['wasm', readFileSync(projectFile('dist/text-shaper.wasm'))];
    if (/^\/assets\/(?:[\w-]+\/)*[\w-]+\.png$/.test(path)) {
        const file = projectFile(`game${path}`);
        if (existsSync(file)) return ['png', readFileSync(file)];
    }
    if (/^\/(assets|park-art)\.json\.js$/.test(path)) {
        const jsonPath = path.slice(0, -3);
        const data = readText(`game${jsonPath}`).replace(/^\uFEFF/, '');
        return ['js', `export default ${data};`];
    }
    if (/^\/(?:(?:entities|scenes)\/)?[\w-]+\.js$/.test(path)) {
        const source = projectFile(`game${path.slice(0, -3)}.ts`);
        if (!existsSync(source)) return null;
        const js = stripTypeScriptTypes(readFileSync(source, 'utf8'));
        return ['js', js.replace(/(from ['"])(\.\/[\w-]+\.json)(['"])/g, '$1$2.js$3')];
    }
    return null;
}

const server = createServer((request, response) => {
    try {
        const { pathname } = new URL(request.url, `http://${HOST}`);
        const result = readPreview(pathname);
        if (!result) {
            response.writeHead(404).end();
            return;
        }
        const [type, body] = result;
        response.writeHead(200, { 'Content-Type': mimeTypes.get(type), 'Cache-Control': 'no-store' }).end(body);
    } catch (error) {
        console.error(error);
        response.writeHead(500).end('The local preview could not load this file. Check the terminal for details.');
    }
});

server.listen(PORT, HOST, () => console.log(`Tokyo's Journey preview at http://${HOST}:${PORT}`));

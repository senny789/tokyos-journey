import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Serve the normal build, using the engine's local font copies when its CDN is unavailable.
const root = fileURLToPath(new URL('..', import.meta.url));
const dist = resolve(root, 'dist');
const port = Number(process.env.TOKYO_PREVIEW_PORT ?? 4181);
const fonts = resolve(root, 'phaser/examples/assets/fonts/typography');
const skinFont = resolve(root, 'phaser/node_modules/.cache/phaser-ae-smoke/d85f3c7ae3d1ffaf-passion-one-ffd1cdc400de64af91e0.glb');
const fontNames = ['sans', 'sans-bold', 'serif', 'serif-bold', 'mono', 'mono-bold'];
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.wasm': 'application/wasm', '.png': 'image/png', '.glb': 'model/gltf-binary', '.json': 'application/json' };

if (!existsSync(skinFont) || fontNames.some(name => !existsSync(resolve(fonts, `ui-${name}.glb`)))) {
    throw new Error('Local preview fonts are missing. Run npm run -s smoke to populate the Phaser font cache.');
}

createServer((request, response) => {
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let file;
    if (path === '/local-fonts/passion-one.glb') file = skinFont;
    else if (/^\/local-fonts\/ui-(sans|sans-bold|serif|serif-bold|mono|mono-bold)\.glb$/.test(path)) file = resolve(fonts, path.slice('/local-fonts/'.length));
    else {
        file = resolve(dist, `.${path === '/' ? '/index.html' : path}`);
        if (file !== dist && !file.startsWith(dist + sep)) return response.writeHead(403).end();
    }
    if (!existsSync(file) || !statSync(file).isFile()) return response.writeHead(404).end();
    response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    if (path === '/game.js') {
        const bundle = readFileSync(file, 'utf8')
            .replace(/https:\/\/cdn\.phaser\.games\/gameblocks\/typography\/ui\/ui-(sans-bold|sans|serif-bold|serif|mono-bold|mono)-[a-f0-9]+\.glb/g, '/local-fonts/ui-$1.glb')
            .replace('https://cdn.phaser.games/gameblocks/fonts/passion-one-ffd1cdc400de64af91e0.glb', '/local-fonts/passion-one.glb');
        return response.end(bundle);
    }
    createReadStream(file).pipe(response);
}).listen(port, '127.0.0.1', () => console.log(`Tokyo's Journey preview: http://localhost:${port}/`));

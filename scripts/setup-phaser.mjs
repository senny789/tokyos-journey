#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGE_FILE = join(ROOT, 'package.json');
const MANIFEST = join(ROOT, 'game', 'manifest.json');
const PHASER_META = join(ROOT, '.phaser', 'build.json');
const LOCAL_SCRIPTS = new Set(['setup:phaser', 'preview:local']);

function run(program, args) {
    let result;
    if (process.platform === 'win32' && program === 'npx') {
        const quote = value => `"${String(value).replaceAll('"', '""')}"`;
        result = spawnSync(`npx.cmd ${args.map(quote).join(' ')}`, {
            cwd: ROOT,
            encoding: 'utf8',
            stdio: 'inherit',
            shell: true,
        });
    } else {
        result = spawnSync(program, args, { cwd: ROOT, encoding: 'utf8', stdio: 'inherit' });
    }
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`${program} exited with status ${result.status ?? 'unknown'}.`);
}

function updateEngine() {
    if (!existsSync(PHASER_META)) {
        throw new Error('Missing .phaser/build.json. Clone the full repository, including its Phaser project metadata.');
    }

    const before = JSON.parse(readFileSync(PACKAGE_FILE, 'utf8'));
    const packageFields = Object.fromEntries(Object.entries(before).filter(([key]) => key !== 'scripts'));
    const localScripts = Object.fromEntries(Object.entries(before.scripts ?? [])
        .filter(([name]) => LOCAL_SCRIPTS.has(name)));
    try {
        console.log('Installing or updating the Phaser AE engine…');
        run('npx', ['-y', '@phaser-ae/cli', 'update']);
    } finally {
        // The official updater refreshes its standard scripts; keep this project's setup and local preview commands.
        const after = JSON.parse(readFileSync(PACKAGE_FILE, 'utf8'));
        writeFileSync(PACKAGE_FILE, JSON.stringify({
            ...after,
            ...packageFields,
            scripts: { ...(after.scripts ?? {}), ...localScripts },
        }, null, 2) + '\n');
    }
}

function installManifestPacks() {
    const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
    const ids = [...new Set((manifest.packs ?? []).map(pack => pack?.id).filter(id => typeof id === 'string'))];
    if (!ids.length) throw new Error('game/manifest.json does not list any Phaser AE packs.');
    console.log(`Restoring this game’s Phaser packs: ${ids.join(', ')}`);
    run(process.execPath, [join(ROOT, 'phaser', 'cli', 'bin', 'phaser-ae.mjs'), 'packs', 'add', ...ids]);
}

try {
    if (Number(process.versions.node.split('.')[0]) < 20) {
        throw new Error('Phaser AE requires Node.js 20 or later.');
    }
    updateEngine();
    installManifestPacks();
    run(process.execPath, [join(ROOT, 'phaser', 'cli', 'bin', 'phaser-ae.mjs'), 'doctor', '--fix']);
    console.log('Phaser AE setup is complete.');
} catch (error) {
    console.error(`Phaser AE setup failed: ${error instanceof Error ? error.message : String(error)}`);
    console.error('If sign-in is requested, run `npx -y @phaser-ae/cli login`, then retry `npm run setup:phaser`.');
    process.exitCode = 1;
}

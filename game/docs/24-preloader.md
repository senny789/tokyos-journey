# Loading screen

A renderer-independent loading screen: the game's own background colour, so
the loader and the first frame meet without a flash, and one bar with the
percentage under it. The bar fills with a gradient laid along its whole length,
so filling reveals it; a soft bloom sits under the fill and a point of light at
its leading edge, which throws off little square pixels as it moves and a burst
of them when it lands. Everything sits in the middle of the game's box, sized
from its shorter side, so it looks the same on a phone held upright and on a
desktop. It covers the PRELOAD by
itself: everything loaded before the game's first scene enters, including work
still finishing as that scene appears. After that it shows only when asked, for
a deliberate loading screen between levels. It uses DOM/CSS rather than GPU
textures, so it works equally in 2D, 3D, WebGPU and WebGL2, before
`game.start()` and during device selection, without engine frames or atlas space.

## When to use it

WebGPU, WebGL2 and automatic renderer packs install the screen by default.
List every file the game needs, all its levels, in one load before
`game.start()`: `game.assets.load`, `loadImage`, `json`, model loads and URL
sounds defined then are all shown, decoding included. Loads started after the
first scene enters are silent, so the first play of a sound or a music track
never brings the screen back mid-game. Call `run` when the game wants a
loading screen later on purpose. Compose `preloader` to change the defaults, or
call `game.preloader.configure`. For other backends, compose this pack explicitly.

## Requires

No world, HUD layer, font download or GPU. The overlay mounts inside the game's
configured host (or `#game` / the document body before startup). It adapts to
host resizing and respects reduced-motion preferences. Headless work has no UI.

## API

```ts
// The preload: everything the game needs, shown automatically if it takes long enough.
const job = game.assets.load([
    { kind: 'image', key: 'tiles', url: '/tiles.png' },
    { kind: 'json', key: 'level4', url: '/levels/4.json' },
    { kind: 'audio', key: 'boom', url: '/boom.ogg' },                       // decoded under the screen
    { kind: 'audio', key: 'theme', url: '/theme.mp3', stream: true },       // music, played by key
]);
// Include custom asynchronous preparation, preserving its result/rejection.
const level = await game.assets.track('Preparing level', async () => buildLevel());
await job;
if (!job.ok) throw new Error('Required assets could not be loaded');
await game.start();
game.scenes.go('title');                                                    // the preload is over

// Later, a deliberate loading screen: shown even for a fast load.
const next = game.preloader.run(items, {
    minTime: 0.6, style: { title: 'Preparing the next chapter', fill: '#65e4dc' },
});
await next;

// Or a background load during play: no screen, with its own progress to draw.
const extra = game.assets.load(moreItems, { silent: true });
```

- `run(items, opts)` returns the original awaitable `LoadJob`; inspect `ok` and
  `failed`. It never rejects for file failures, matching `assets.load`.
- `show(job, opts)` shows an existing job, silent or not, including before startup. Resolves
  after its fade, dismissal or game destruction. Failed or cancelled work stays
  visible until dismissed; await the job for asset completion, not the screen.
- `configure(opts)` changes defaults for future loads. Set `automatic: false`
  for a game's own loading UI over the preload too; explicit `run` and `show` still work.
- `dismiss()` removes the screen without cancelling downloads.
- `retry()` tries the files that failed again, under the same screen (its
  Retry button). Work the game tracked itself cannot be retried and reloads
  the page.
- `shown` reports eased progress; `visible` reports whether a screen is mounted.
- `easeFill` and `minTimeProgress` are exported for custom loading indicators.

## The game, ready

The game is not READY (`game.ready`) while the screen is up: it holds the
ready moment until it has faded, so a host never drives a game still behind
its loading screen.

## A failure

When a file fails, the bar turns red, "Something didn't load" shows, and the
screen stays up with Retry (the failed files again) and Continue (dismiss it
and play on without them). A game that cannot load never becomes ready.

## Options

Manifest options and `configure` accept `automatic` (true: show the preload by
itself), `delay` (0.12 s), `minTime` (0.4 s), `fadeOut` (0.3 s), `style` and
`background` (CSS; default the game's own `screen.background`).
Explicit `show`/`run` bypass the automatic delay. `run` also accepts the kernel's
retry/concurrency options.

Style: `title` (none shown; a line above the bar for a screen put up on
purpose, 'Preparing the next chapter'), `width` (the bar's, CSS px, clamped to
host), `height` (the bar's), `fill` (a colour: a gradient from a lighter tint
of it, with sparks to match; or any CSS background; default a cyan, violet and
pink gradient), `track`, `border` (the track's edge), `text` (the percentage),
`fail`, `font`, `showKey` (false; opt in to an asset-name label; `?debug` in the
address turns it on). Ink and track default to dark on a light background and
light on a dark one, and the gradient deepens on a light one. With reduced
motion there are no sparks, shimmer or easing. Optional `x`/`y` position the panel centre in host CSS pixels. The old
`layer` option is accepted for compatibility; the overlay sits above game layers.

## Limits

- Progress counts completed items, including decode work, rather than bytes.
  Concurrent jobs share one monotonic bar; newly discovered work never moves it
  backwards. A preloaded `stream` music file counts once it is downloaded.
- Empty or quickly completed automatic loads do not flash. Explicit `run`/`show`
  deliberately show fast nonempty jobs for their minimum display time.
- Failures and cancellations remain visible with Retry and Continue;
  Continue does not retry. Games must handle the job's `ok`/`failed` state before entering
  a scene that requires those assets.
- The screen does not pause simulation, unlock audio autoplay, or change scene
  lifecycle. Audio still requires the browser's normal user gesture.
- The preload ends when the first scene enters, before that scene's `enter`
  runs; a game that never enters a scene stays in its preload. Mark a load
  `silent: true` to keep it off the screen even then.
- Background audio work (a music stream buffering, a `stream` file decoded on
  its first `sample`) is always silent.
- Custom fetches outside engine loaders need `assets.track` to participate.
- DOM overlays are not included in canvas screenshots/recordings. Headless jobs
  settle normally, with no timers or visual display.

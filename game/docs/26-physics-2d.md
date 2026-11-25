# Rigid-body 2D physics

Rigid bodies for 2D games. A body is a roster object with a `body` key; the
step moves it (`x`, `y`, `rot`) and collision rules still fire by tag. Gravity
is on by default (900 units/s² down); set `game.physics.gravity(0, 0)` for
space. Shapes are circles, boxes, capsules and polygons (concave ones are
triangulated); the solver is substepped so stacks do not jitter and joints do
not stretch.

```ts
game.spawn({ id: 'ground', x: 320, y: 350, width: 640, height: 20, body: { type: 'static' } });
game.spawn({ id: 'crate', x, y, width: 32, height: 32, body: {} });                       // a box the sprite's size
game.spawn({ id: 'ball',  x, y, width: 20, height: 20, body: { shape: 'circle', restitution: 0.6 } });
game.spawn({ id: 'rock',  x, y, body: { shape: { kind: 'polygon', points: [[-30,-30],[0,-30],[0,0],[30,0],[30,30],[-30,30]] } } });   // concave is fine
game.spawn({ id: 'hero',  x, y, width: 24, height: 32, body: { shape: 'capsule', fixedRotation: true, friction: 0.2 } });  // a platformer character: round ends glide over seams

hero.body.vx = dir * 160;                       // velocity is a property
if (hero.body.grounded && jump) hero.body.impulse(0, -hero.body.mass * 420);
```

## When to use it

Compose it when things must fall, push, stack, bounce or swing: platformers,
physics puzzles, ragdolls, ball games, a crate a player shoves. Do not compose
it for pickups, bullets, triggers or top-down sprites that only need to know
they overlap — `collision` alone is cheaper and never sleeps, tunnels or
jitters. 2D only.

It pairs with `collision` (required: overlap rules by tag work on bodies, and
`collide.raycast` still works), `tiles-2d` (solid tiles become static bodies
with slopes and one-ways) and `grid-move` (which drives `body.vx`/`vy` so walls
stay solid). `feel` and `audio` read `physics.contact` for thuds.

<!-- shared: which-physics -->
### Which physics?

| For | Compose | What it is |
|---|---|---|
| Things that only need to touch: pickups, bullets, top-down sprites, a grid game | `collision` alone | overlap rules by tag, shapes and raycasts, with no bodies to simulate |
| Most 2D games where things fall, push, stack, bounce or swing: platformers, physics puzzles, ragdolls, pinball | `physics-2d` | the engine's own solver, instant and deterministic: a body is a roster object (`spawn({ body })`), with joints, sensors, one-way platforms and conveyors. It needs `collision` |
| Box2D's own behaviour in 2D: tall stacks that stay up, dominoes, long joint chains, vehicles, continuous collision for fast bodies | `physics-box2d` | a vendored Box2D v3 core, embedded in the game. Compose it or `physics-2d`, never both: they do not share bodies |
| Rigid bodies in 3D: crates, ragdolls, a character controller, vehicles, triggers | `physics-3d` | a vendored Box3D core over the 3D world |
| Ropes, cords and chains in 2D or 3D: Cut the Rope, rope bridges, cranes, a hanging lamp | `physics-rope` | strands that swing, drape, stretch, snap and are cut; an end can tie to a body of any of the three above |
| Physics levels authored as data: dominoes, buggies, seesaws and ragdolls placed in an editor | `physics-workshop` | a JSON level format loaded into its own Box2D world, and the painter for its blueprint look |
<!-- /shared: which-physics -->

## Requires

`world:2d` — bodies are world objects with `x`, `y`, `rot`, `width`, `height`.
`collision` — the physics step runs before it, so overlap rules and
`collide.on()` see settled positions; do not use `collide.solid()` on bodies,
the solver owns their separation.

## The joints

| | |
|---|---|
| `pin` | a hinge at a world point: doors, ragdoll elbows, pinball flippers, powered wheels. Limits, and a motor |
| `rope` | a rigid rod, a rope with slack (`min`/`max`), or a spring (`hertz`) |
| `slider` | travel along one axis, holding the angle: elevators, pistons, sliding doors. Limits, and a motor |
| `wheel` | travel along one axis on a **spring**, spinning freely: a car's suspension in one joint |
| `weld` | two bodies become one — build a compound after the fact, glue a rider to a platform |
| `grab` | drag a body to a moving world point. The mouse joint |

Every one takes **world points**; the local frames are worked out for you, because nobody thinks about a hinge in either body's own frame.

Every one but `grab` hands back a **live joint**, not an id:

```ts
const rope = game.physics.rope(hook, player, { max: 200, min: 0 });
rope.max -= reelSpeed * dt;            // REEL IN — the same joint, a shorter limit
if (rope.taut) player.body.vx *= 1.02; // it is pulling, so the swing is loaded
d.line(rope.anchorA, rope.anchorB);    // and it knows where its own ends are
rope.destroy();                        // let go
```

`length`, `min`, `max`, `hertz` and `damping` are the fields the solver reads, so writing one takes effect on the next step and the bodies wake. That is the whole reason the verbs return an object: a grapple that reels, a suspension that stiffens, a winch that pays out are all one number changing every frame, and a joint you can only create and destroy forces a game to tear it down and build a new one — which throws away the solver's accumulated impulses and shows as a visible jolt. `alive` goes false when either body dies, and every field then answers safely rather than throwing.

A **rope is two one-sided limits**, each with its own accumulator, and that is what lets its limits move. Solved as a single row against a target clamped into the range, the constraint reads `C = 0` across the whole slack interval — "inside the range" and "hanging at the limit" are the same number, and only the warm-start impulse tells them apart. Relax the limit on a hanging rope and that stale impulse goes on holding the load at the old length for ever: a winch that pays out and nothing moves. Two accumulators clamped at zero cannot do that.

A joint's **limits are speculative**. Inside the range the bias is the speed that would reach the limit in exactly one substep, so the one-sided clamp throws the row away and the limit costs nothing until the swing or the travel actually arrives at it. Without that term a limit kills all motion from the first step — which is the bug this shape of solver invites.

A joint **doing work keeps its bodies awake**. Without that a driven wheel, a running elevator or a grabbed crate falls asleep the moment it is briefly still, and the motor then pulls at a body nothing is integrating: the joint looks broken and is not.

`grab` runs on the **bias pass only**. The relax pass exists to take back the velocity a bias added, which is right for a contact and wrong for a constraint whose whole job is to drive: relaxed every substep, a grab can never build speed and only ever creeps toward its target. It cannot inject energy anywhere else, because its impulse is force-limited — and that budget is what makes a heavy thing feel heavy to drag.

`grab(h, at, { maxForce?, hertz?, damping? })` returns `{ target(x, y), release() }` rather than a joint. Move the
target every frame the body is held, and release it on let go; a grab still held when the scene exits goes with
it. `maxForce` defaults to 10000, `hertz` to 5 and `damping` to 0.7.

```ts
const held = game.physics.grab(crate, { x: p.x, y: p.y });   // on press
held.target(p.x, p.y);                                       // every frame it is held
held.release();                                              // on release
```

## Chain terrain

`physics.chain(points)` turns a polyline into static terrain: a hillside, a cave wall, a loop of track.

Each segment becomes its **own body**, a capsule, so consecutive segments overlap at their round ends and a body crossing a join has no notch to catch on. One body per segment rather than one body of many pieces, because a manifold is per **pair**: twenty-five pieces on one body would collapse into a single contact with a single normal, and a ball would slide off the world. Static bodies are free, and it is exactly what the tile collision does with its merged runs.

## API

### Spawn: the `body` spec

`body: {}` on a spawn makes the object a body. Every field is optional.

- `type` — `'dynamic'` (default, moves and is pushed), `'static'` (never moves), `'kinematic'` (you move it by `vx`/`vy` or `x`/`y`; it pushes, is not pushed — a moving platform carries what stands on it).
- `shape` — `'box'` (default, the sprite's size), `'circle'`, `'capsule'`, or a `ShapeSpec`: `{ kind: 'circle', r }`, `{ kind: 'box', w, h, angle? }`, `{ kind: 'polygon', points }`, `{ kind: 'compound', shapes }`, `{ kind: 'capsule', w, h }`. A capsule stands upright, a character's shape: round ends top and bottom of radius `w / 2`, so `h` must be more than `w` (a wider one is a single circle). Turn the body by a quarter for one lying down.
- `density` (default 1) or `mass` — one or the other; mass wins. It is also what BUOYANCY measures against: a fluid of density 1.5 floats a body of density 0.5 high, floats one of 1.2 low, and sinks one of 4 — one pool, three behaviours, no filtering.
- `restitution` (0..1, default 0) · `friction` (default 0.6) · `gravityScale` (default 1).
- `linearDamping` (default 0) · `angularDamping` (default 0.05) — velocity lost per second.
- `fixedRotation` — never rotates (characters). `bullet` — swept, never passes through thin walls.
- `category` / `mask` — unsigned 32-bit body collision filters, default `1` / `0xffffffff`. A pair collides only if each mask accepts the other category. `mask: 0` disables physical contacts (including sensors); tag-based `collide.on` overlaps remain independent. Bullet sweeps obey the same filters. For a platformer, walls can use category `1`, mask `6`; player category `2`, mask `1`; enemies category `4`, mask `1`: actors land on walls but can overlap each other for damage rules.
- `sensor` — overlaps and reports (`physics.contact` with `sensor: true`) but never pushes: triggers, pickups, zones.
- `oneWay` — `'up'` is a platform you jump up through and land on; `'down' | 'left' | 'right'` likewise.
- `surfaceSpeed` — a conveyor: what touches it moves along it at this speed (units/s). Live on `h.body`, so a belt can speed up, stop or reverse without rebuilding the body and dropping everything standing on it.
- `ax`, `ay` thrust (units/s²) · `dragX`, `dragY` deceleration toward zero when not thrusting (units/s²) · `maxVx`, `maxVy` speed caps (units/s).
- `vx`, `vy` (units/s) · `av` (rad/s) — initial velocity.

```ts
game.spawn({ id: 'lift', x, y, width: 96, height: 12, body: { type: 'kinematic', vy: -40 } });
game.spawn({ id: 'belt', x, y, width: 200, height: 16, body: { type: 'static', surfaceSpeed: 120 } });
game.spawn({ id: 'ledge', x, y, width: 64, height: 8, body: { type: 'static', oneWay: 'up' } });
game.spawn({ id: 'ship', x, y, width: 24, height: 24, body: { dragX: 200, dragY: 200, maxVx: 300, maxVy: 300, gravityScale: 0 } });
```

### `h.body` — the handle's sub-object

- `vx`, `vy` (units/s), `av` (rad/s) — live; set them to change velocity.
- `ax`, `ay`, `dragX`, `dragY`, `maxVx`, `maxVy` — live, like velocity.
- `restitution`, `friction`, `gravityScale` — live.
- `mass` (read-only) · `type` (read-only: 0 static, 1 dynamic, 2 kinematic) · `awake` (read-only: 1 awake, 0 asleep).
- `impulse(ix, iy, atX?, atY?)` — an instant change of momentum (mass × velocity), at a world point (default the centre; off-centre spins).
- `force(fx, fy)` — a force for one 60 Hz frame.
- `wake()` — wake a sleeping body.
- `grounded` — a contact with a normal pointing up into this body.
- `blocked.up/down/left/right` — which sides touch something this step (sensors excluded).
- `touching` — `[{ other, nx, ny, impulse, speed, load }]`; `load` is the sustained force in multiples of the body's own weight.
- `outline` — the shape in body-local units, one entry per convex piece, for a debug overlay.

```ts
hero.body.vx = dir * 160;
if (hero.body.grounded && jump) hero.body.impulse(0, -hero.body.mass * 420);
if (hero.body.blocked.right) turnAround();
if (pig.body.touching.reduce((s, t) => s + t.load, 0) > 2.5) crushing += dt;   // more than 2.5 of its own weight
crate.body.friction = 0.9; crate.body.restitution = 0; crate.body.gravityScale = 0;
```

### `game.physics`

- `gravity(x, y)` — set world gravity (units/s²); wakes every body; scene-scoped.
- `joint(a, b, def)` → a live `Joint2d` — `{ kind: 'revolute', ax, ay, bx, by, lower?, upper?, motorSpeed?, maxMotorTorque? }` a hinge; `{ kind: 'distance', ax, ay, bx, by, length?, minLength?, maxLength?, hertz?, damping? }` a rod, rope or spring. Anchors are in each body's local frame. Throws if either object has no body.
- `unjoint(j | id)` — remove a joint, by handle or by id. Both bodies wake: something held up by a joint that has gone must fall.
- A `Joint2d` carries `id`, `alive`, `length`, `min`, `max`, `hertz`, `damping`, `taut`, `anchorA`, `anchorB`, `motor(speed, maxTorque?)` and `destroy()`.
- `raycast(x, y, dx, dy, maxDist, filter?)` → `{ handle, x, y, nx, ny, dist } | null` — the nearest body along the ray.
- `setType(h, type)` — change a body's type. A body made dynamic again has the mass it was made with, its density's
  or its spec's `mass`.
- `bounds(b | null)` — world walls, or per-edge bounce; hits arrive as `physics.bounds`.
- `cull(rect | false)` — the cull rect for this scene.
- Area and point effectors also accept live `drag` (default `0`): a linear-velocity damping rate applied only while inside the field. Each substep multiplies velocity by `max(0, 1 - drag × dt)`. It does not add global body friction or angular drag.
- `effector(def)` → the LIVE def (with its `id`) — `'area'` (wind, a floor current), `'point'` (a gravity well; negative strength repels), `'buoyancy'` (water). Write its fields to tune it: the step reads the object you were handed, so a belt that speeds up never removes and re-adds itself.
- `removeEffector(id)`.
- `world` — the raw `World`, for tests and tools.
- `bodies` — how many bodies exist.

```ts
game.physics.joint(post, bob, { kind: 'revolute', ax: 0, ay: 0, bx: -60, by: 0 });
game.physics.joint(a, b, { kind: 'distance', ax: 0, ay: 0, bx: 0, by: 0, minLength: 0, maxLength: 120 });   // a rope; omit min/max for a rod; hertz for a spring
game.physics.raycast(x, y, dx, dy, 400);
game.physics.bounds({ x: 0, y: 0, w: 640, h: 480, bounce: { top: true, left: true, right: true }, edges: { bottom: false } });   // Breakout
game.physics.effector({ kind: 'area', x, y, w, h, fx: 300, fy: 0, accel: true });                 // wind
game.physics.effector({ kind: 'point', x, y, radius: 300, strength: -2000 });                     // repels
const water = game.physics.effector({ kind: 'buoyancy', x, y, w, h, density: 1.5, drag: 3, flowX: 40 });   // water: density is RELATIVE to the body's own
water.density = 2.2; water.flowX = -20;                                                            // live
```

### Signals

- `physics.contact` — `{ a, b, nx, ny, x, y, impulse, speed, sensor }` per touching pair each step. `speed` is the approach speed at impact (units/s): use it for thuds and damage. `impulse` is the sustained normal impulse: a resting body's own weight shows here.
- `physics.bounds` — `{ handle, edge, speed }` when a body hits a world bound.
- `physics.cull` — `{ id, x, y, vx, vy }` when a dynamic body left the cull rect and was killed. The handle is already dead; respawn from the record.

```ts
for (const c of signals.read('physics.contact')) if (c.speed * c.a.body.mass > 250_000) crack(c.b);   // momentum at impact
for (const c of signals.read('physics.cull')) if (c.id === 'ball') serve();
```

## Options

- `gravity` — `{ x, y }` in units/s². Default `{ x: 0, y: 900 }`.
- `substeps` — solver substeps per fixed step. Default 4; 6–8 for taller stacks.
- `cull` — `{ x, y, w, h }` or `false`. Default a 100,000-unit box around the origin, an infinity guard so a body that rolls off the world never falls until its numbers stop being numbers. Set a tight one per level.

```json
{ "id": "physics-2d", "options": { "gravity": { "x": 0, "y": 900 }, "substeps": 6, "cull": { "x": -200, "y": -200, "w": 2400, "h": 1200 } } }
```

## Limits

- Moving a body by writing `x`/`y`/`rot` is a teleport and is adopted next step; so is writing `vx`/`vy`. Keep your own state in `data`, never a second list.
- `collide.solid()` on bodies fights the solver; `collide.on()` overlap rules are fine.
- Tuning: boxes of 10–200 units and speeds under ~3000 units/s are the sweet spot. Bigger or faster needs `bullet` or more `substeps`.
- `force()` applies for one 60 Hz frame whatever the fixed step is; prefer `ax`/`ay` for sustained thrust.
- `grounded`, `blocked` and `touching` read the contacts of the last physics step; inside a `simulate` hook that runs before physics they describe the previous step.
- Floors made of tiles: adjacent static faces are culled automatically (no catching on seams), but one static box per run is still cheaper than a hundred tiles — `tiles-2d` merges runs.
- Sleeping bodies (under 3 units/s for 0.5 s) do not move until something touches them, gravity changes, or `wake()`; a static body never wakes its neighbours.
- Contacts above the signal capacity (512 per frame) are counted and dropped; `touching` still sees them all.


`body.minBounceVelocity` sets a live per-body minimum approach speed for restitution, in world units/second. Omit it (or set -1) to inherit the normal-contact solver threshold. For two dynamic bodies the larger threshold wins; static geometry does not override the moving body's setting. Explicit thresholds also suppress slow bullet and world-bound bounces. Omitting the option preserves their existing behavior.

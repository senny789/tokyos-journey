# Level 0 — Home before the dream

## Story

Tokyo plays at home with Senny, Reshika, Mom, Dad, Sandesh, Sushil, and her favorite plushie. When it gets late, she eats her treats and goes to sleep. She wakes up in [Level 1 — The dark place](../01-the-dark-place/design.md), at the start of the dream.

## What this level should feel like

Home is warm and familiar. Give the player time to see what Tokyo loves about it before she wakes up somewhere strange. The opening also gives the player a chance to learn how to move and interact. Those familiar people and objects become reasons to keep going in the dream.

## Proposed playthrough

1. **Explore the house.** Start Tokyo by the living room reading corner. Her plushie is in the toy basket. The camera follows her through the four adjoining rooms.
2. **Play with everyone.** Walking up to a family member brings up a simple interaction. A reaction could be as small as a pet, someone saying her name, or Tokyo wagging her tail. Give the plushie its own interaction. Tokyo could pick it up and carry it.
3. **Get treats.** After the player tries one playful interaction, show that it’s getting late and have someone call Tokyo over for treats. The player can keep exploring or go eat when they’re ready.
4. **Go to sleep.** After the treats, Tokyo can walk to her sleeping spot and settle down. Let the player choose when she lies down. Dim the room and fade into Tokyo opening her eyes in the first dream level.

## What we’d need to make

- **Room layout** — A starting spot, space for six family members, a spot for the plushie, a treat spot, and a recognizable sleeping spot.
- **Interactions and progression** — Movement, one context-sensitive interaction input, repeatable family and plushie interactions, the treat call, eating treats, and a bedtime interaction that starts the dream.
- **Visuals** — Home scenery, sprites or other readable representations of Senny, Reshika, Mom, Dad, Sandesh, and Sushil, plus the plushie, treats, and sleeping spot. Tokyo needs readable reactions for playing, eating, and lying down.
- **Sound** — Quiet room ambience, a cue when someone calls Tokyo for treats, and a soft sound for playing with the plushie or eating. Fade the home sounds when she falls asleep.
- **Player cues and transition** — A short movement hint if needed, an interaction prompt when Tokyo approaches something, a visible cue for treats and bedtime, and a fade into Level 1. If someone calls her, show a visual cue too.

## Details to decide

- Where does the scene take place, and where does Tokyo actually like to sleep?
- What does her favorite plushie look like, and what does she do with it?
- What is one real habit or interaction that would make a family member recognizable?

## Family sprite sheets

The [family sprite catalog](../../art/family-sprites.md) shows the six characters, their shared idle, greeting, and petting poses, and an individual interaction for each.

## Playable rooms

The house is set at sunset. Tokyo starts in the living room with her plushie and the lamp switch. The doorway sills share the height of the walking surface. Tokyo opens a door and walks into it, then the view fades into the next room. Each connecting door has a return entrance in the adjoining room.

1. Sandesh talks to a client beside his laptop desk. A wardrobe and a navy bed furnish his room.
2. Sushil sits and strums his guitar beside his amp and records. A plaid throw sits on his bed.
3. Mom practices yoga and Dad does push-ups on the mats beside their double bed.
4. Reshu does her makeup at the lit vanity and Senny works on a game at his PC. Tokyo’s bowl and bed sit at the far right of their shared bedroom.

The [room asset catalog](../../art/home-assets.md) contains the furniture and prop list and the prompts used to create the art. The room layout and the bunny plushie are draft designs.

## Implemented playthrough

Interact with a family member or the plushie to unlock the treats. Family members pause what they’re doing to greet Tokyo. Once she’s been outside their conversation range for two seconds, they start returning to their activity. Play fetch with Senny by bringing his ball back. Eat at the bowl, then interact with the bed to fade into Level 1.

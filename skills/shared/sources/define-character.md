---
name: define-character
description: Fabricate a Fondale Character at the height the game decided — target derived from the world contract, artwork generated against the assets already made, normalised to the target, approved at play size inside its Scene, and authored as a CharacterDefinition. Use when a ticket needs a Character, when redoing one, or when adding an Appearance or an Animation.
---

# Define Character

Produce a Character whose pixel height is arithmetic from the world contract and
whose artwork was judged where the Player will see it, so that no figure ever
arrives at a size nobody decided.

## Documents

| | |
| --- | --- |
| Reads | `docs/game/world.md`, `docs/game/assets.md`, `docs/game/story.md` |
| Writes | the Character's Runtime Assets, its `CharacterDefinition`, and its row of `docs/game/assets.md` |
| Missing input | stop and tell the author to run `/setup-game`; never run it yourself |
| Next command | `/define-scene` while the Character has no Scene to stand in; otherwise back to the ticket |

Paths are literal and relative to the game's own repository, which is the
working directory, except `<skill>/scripts/normalise-runtime-asset.mjs`: that
one is this skill's own copy of the normaliser, and `<skill>` stands for the
directory this skill was installed into. ImageMagick 7 — the `magick` command —
must be installed.

## Workflow

### Take stock

Read `docs/game/world.md` for the pixels per world unit, the Logical
Resolution, the stage and the visual direction; `docs/game/assets.md` for this
Character's declared size and for every asset already made; `docs/game/story.md`
for who this Character is. Read the Engine's own contract from the installed
package, which is the version the game is built against:
`node_modules/@asterixcapri/fondale/docs/public/authoring/character.md` for
Appearances, Animations, Roles, the Visual Anchor and the cell rules, and
`node_modules/@asterixcapri/fondale/docs/public/recipes/characters.ts` for a
worked definition.

Stop at the missing-input row above when `docs/game/world.md` is absent, and
when the Character has no row in `docs/game/assets.md`: a declared size is the
author's to give and `/setup-game` is where it is given.

Finish when you can state the Character's declared size, the pixels per world
unit, and which Appearances, Animations and Facings this run produces.

### Grill the Character brief

Invoke `$grilling`. Cover the Character's part in the story, its silhouette,
build and costume, every Appearance it needs, the Animations of each — a
`default` always, `walking` for a Character the game moves, `speaking` where the
performance differs — its Noun and the lines it answers with, its initial Scene,
Ground Point and Facing, its movement speed, and, for a re-run, what must survive
unchanged.

The look of the game is settled: quote the `## Visual direction` section of
`docs/game/world.md` into every generation and add no style of your own.

Finish when the frontier is empty and the author has confirmed the list of
Appearances, the Animations of each, and the four Facings of each Animation.

{{ fabrication-cycle }}

### Author the definition

Write or update the `CharacterDefinition` under `src/`, beside the Runtime
Assets, following the contract read in Take stock: one sheet per Facing of every
Animation, read with `uniformGrid` at the cell Recompose built, the `timing`
shared by the four presentations, the Roles, the Visual Anchor Recompose fixed,
the initial Scene, Ground Point, Facing and Appearance, the movement speed, and
the Noun.

A `dialogue` field already on the Character survives this run untouched.

Finish when the game builds, every Animation of every Appearance supplies all
four Facings at one frame count and one cell, and the initial Ground Point lies
inside the initial Scene's Walkable Region.

### Verify in the Engine

Run the game and walk the Character across its Scene. Confirm that it faces four
ways, that its height does not change when it turns, walks or changes Appearance,
that its feet stay on the ground point it is walking to, and that it matches
`preview.png` at the same place in the Scene. Repeat at the far edge of the
Walkable Region, where Perspective Scale is smallest.
`node_modules/@asterixcapri/fondale/docs/public/authoring/testing.md` drives the
same play from a test.

Finish when every Facing of every Animation loads and plays, and the Character
stands the height the register records.

## Handoff

Report the declared size, the target height and the measurement the script took
from the finished artwork; the Visual Anchor and the cell; every file written;
the register row; and every Appearance or Animation the author asked for that
this run did not produce.

End by giving the author the `Next command` from the table above, alone on its
own line, as the exact text to type.

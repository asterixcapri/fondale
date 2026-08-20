---
name: define-object
description: Fabricate a Fondale Object at the size the game decided — its world target derived from the world contract and judged beside the Character who carries it, its Inventory Appearance authored on the UI scale, normalised, approved at play size, and authored as an ObjectDefinition with its Noun and its whole lifecycle. Use when a ticket needs an Object, when redoing one, when adding an Appearance or an Animation, or when changing how an Object is collected, used, placed back or consumed.
---

# Define Object

Produce an Object that is in proportion to the Character who carries it and to
the Scene it sits in, and that stays legible in the Inventory drawer, so that a
lantern never arrives the size of a door.

## Documents

| | |
| --- | --- |
| Reads | `docs/game/world.md`, `docs/game/assets.md`, `docs/game/story.md`, `docs/game/puzzles.md` |
| Writes | the Object's Runtime Assets, its `ObjectDefinition`, and its row of `docs/game/assets.md` |
| Missing input | stop and tell the author to run `/setup-game`, or `/define-story` or `/define-puzzles` when only their own document is missing; never run any of them yourself |
| Next command | `/define-scene` while the Scene this Object starts in has no artwork; otherwise back to the ticket |

Paths are literal and relative to the game's own repository, which is the
working directory, except `<skill>/scripts/normalise-runtime-asset.mjs`: that
one is this skill's own copy of the normaliser, and `<skill>` stands for the
directory this skill was installed into. ImageMagick 7 — the `magick` command —
must be installed.

## Workflow

### Take stock

Read `docs/game/world.md` for the pixels per world unit, the Logical Resolution,
the Inventory Appearance Size, the stage and the visual direction;
`docs/game/assets.md` for this Object's declared size, for the measured height of
the Character who will carry it, and for every asset already made;
`docs/game/story.md` and `docs/game/puzzles.md` for what this Object is and which
puzzle it serves. Read the Engine's own contract from the installed package,
which is the version the game is built against:
`node_modules/@asterixcapri/fondale/docs/public/authoring/object.md` for the
lifecycle, the non-directional Appearances, the Inventory Appearance and the
Noun, `authoring/interaction.md` for Nouns, Verbs, Command Cases and Game
Operations, and
`node_modules/@asterixcapri/fondale/docs/public/recipes/lantern.ts` for a worked
definition.

Stop at the missing-input row above when `docs/game/world.md` is absent, and when
the Object has no row in `docs/game/assets.md`: a declared size is the author's
to give and `/setup-game` is where it is given.

For an Object that already exists, inventory what a change would touch before
proposing one: the definition, its Runtime Assets, the Scene that holds it, and
every Command Case, Sequence and condition that names it.

Finish when you can state the Object's declared size, the pixels per world unit,
the Inventory Appearance Size, the measured height of the Character who carries
it, and which Appearances and Animations this run produces.

### Grill the Object brief

Invoke `$grilling`. Cover what the Object is for and which puzzle it serves;
which Character carries it and what it looks like in that hand; where it starts,
in which Scene and at which Ground Point; how the Player collects it; every
Appearance the world needs and what changes it; the Animations of each; whether
it is ever placed back and where; whether it is consumed; its Noun, the Verbs it
advertises, every target it may be used with, the answer to each, and the answer
to a combination nobody authored; what must stay recognisable at the Inventory
Appearance Size; and, for a re-run, what must survive unchanged.

The look of the game is settled: quote the `## Visual direction` section of
`docs/game/world.md` into every generation and add no style of your own.

Finish when the frontier is empty and the author has confirmed the Object's
lifecycle, the list of Appearances, the Animations of each, and every interaction
the Noun answers.

{{ fabrication-cycle }}

### Author the definition

Write or update the `ObjectDefinition` under `src/objects/<object>/`, beside the
Runtime Assets, following the contract read in Take stock: the initial Scene, the
initial Ground Point and the initial Appearance, the square `inventoryAppearance`
Recompose built, one non-directional Animation sheet per Appearance read with
`uniformGrid` at the cell Recompose built, the Roles, the `timing`, and the Noun
with its Verbs, its Command Cases, its fallback and its Game Operations.

Lasting state is an Appearance or a location, and an Animation is transient: an
Object that has been emptied wears a different Appearance rather than a different
loop. A Ground Point named by a place operation is checked against every
registered Scene, not only the one intended.

The Scene's own geometry — the Hotspot, the Approach Point, the Walkable Region —
belongs to its `SceneDefinition` and is `/define-scene`'s work; report what this
Object needs there rather than editing it here.

Finish when the game builds, the initial Ground Point lies inside the initial
Scene's Walkable Region, the Inventory Appearance is square at the declared
Inventory Appearance Size, every Verb the Noun advertises reaches a Command Case
or the fallback, and collection, use, placement and consumption each reach a
state the game can carry on from.

### Verify in the Engine

Run the game and play the Object's whole lifecycle: walk to it, look at it,
collect it, open the Inventory, select it, use it on every authored target and on
one nobody authored, place it back where it can be placed, and consume it where
it is consumed. Confirm that it stands beside the carrying Character at the size
`preview.png` showed, that changing its Appearance does not change its height,
that it reads in the drawer at the Inventory Appearance Size, and that the same
Noun answers in the Scene and in the Inventory.
`node_modules/@asterixcapri/fondale/docs/public/authoring/testing.md` drives the
same play from a test.

Finish when every Appearance and Animation loads, the Object measures the height
the register records, and no interaction leaves the game in a state the Player
cannot leave.

## Handoff

Report the declared size, the target height and the measurement the script took
from the finished artwork; the Inventory Appearance Size and the square asset;
the Visual Anchor and the cell; every file written; the register row; the
lifecycle from the initial Scene to consumption; anything the Scene must gain for
this Object to be reachable; and every Appearance, Animation or interaction the
author asked for that this run did not produce.

End by giving the author the `Next command` from the table above, alone on its
own line, as the exact text to type.

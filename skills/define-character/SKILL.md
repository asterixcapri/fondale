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
working directory. The artwork itself is fabricated by the `fabrication-cycle`
skill, which must be installed beside this one and which carries the normaliser
this skill's definitions are written against. ImageMagick 7 — the `magick`
command — must be installed.

## Workflow

### 1. Take stock

Read `docs/game/world.md` for the pixels per world unit, the Logical Resolution,
the stage and the visual direction; `docs/game/assets.md` for this Character's
declared size and for every asset already made; `docs/game/story.md` for who
this Character is. Read the Engine's own contract from the installed package,
which is the version the game is built against:
`node_modules/fondale/docs/public/authoring/character.md` for Appearances,
Animations, Roles, the Visual Anchor and the cell rules, and
`node_modules/fondale/docs/public/recipes/characters.ts` for a worked
definition.

Stop at the missing-input row above when `docs/game/world.md` is absent, and
when the Character has no row in `docs/game/assets.md`: a declared size is the
author's to give and `/setup-game` is where it is given.

Finish when you can state the Character's declared size, the pixels per world
unit, and which Appearances, Animations and Facings this run produces.

### 2. Grill the Character brief

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

### 3. Fabricate the artwork

Invoke the `fabrication-cycle` skill, which runs Anchor, Generate, Normalise,
Recompose, Approve and Register. It reads what it needs about a Character from
the `## Fabrication definitions` section at the end of this document; give it
that section and the brief the previous step settled.

Finish when the cycle hands back an approved recomposition, the cells and sheets
it built, and the Character's registered row.

### 4. Author the definition

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

### 5. Verify in the Engine

Run the game and walk the Character across its Scene. Confirm that it faces four
ways, that its height does not change when it turns, walks or changes
Appearance, that its feet stay on the ground point it is walking to, and that it
matches `preview.png` at the same place in the Scene. Repeat at the far edge of
the Walkable Region, where Perspective Scale is smallest.
`node_modules/fondale/docs/public/authoring/testing.md` drives the same play
from a test.

Finish when every Facing of every Animation loads and plays, and the Character
stands the height the register records.

## Handoff

Report the declared size, the target height and the measurement the script took
from the finished artwork; the Visual Anchor and the cell; every file written;
the register row; and every Appearance or Animation the author asked for that
this run did not produce.

End by giving the author the `Next command` from the table above, alone on its
own line, as the exact text to type.

## Fabrication definitions

What the `fabrication-cycle` skill reads when this skill invokes it. Each
heading is the name a step of that cycle asks for.

### Target

The target height in pixels is the Character's declared size in
`docs/game/assets.md` times the pixels per world unit in `docs/game/world.md`,
rounded to the nearest integer. It is arithmetic, never a judgement, and it is
the height of every Facing and every Animation frame of this Character.

### Extra references

The Background of the Character's initial Scene.

### Reference canvas

The Logical Resolution.

### Art directory

`art/characters/<character>`

### Generation order

Each prompt also carries the Facing being drawn, a transparent background, and
the whole figure standing with its feet at the bottom edge.

Generate the four still Facings of an Appearance first. Generate an Animation's
frames afterwards, one image per frame, each from the approved still of the same
Facing as its reference, and each holding the figure's standing extent from head
to floor: a pose that shortens the figure is a pose normalisation would stretch
back to full height.

### Normalise notes

Every image of this Character takes the same target, so that turning and walking
cannot change its height.

### Recompose assembly

One cell holds every Facing, Animation and frame of one Appearance, and every
figure meets the ground at the same column of it. Take the anchor column as the
largest Visual Anchor x reported in Normalise; each image is padded on its left
by that column minus its own Visual Anchor x; the cell is as wide as the widest
padded image and as tall as the target.

```sh
magick art/characters/<character>/normalised/<name>.png -background none \
  -gravity west -splice <left padding>x0 \
  -gravity southwest -extent <cell width>x<cell height> \
  art/characters/<character>/cells/<appearance>-<animation>-<facing>-<frame>.png
```

The frames of one Animation and one Facing then become that Facing's sheet, in
order, which is the Runtime Asset and belongs beside the `CharacterDefinition`
that imports it:

```sh
magick art/characters/<character>/cells/<appearance>-<animation>-<facing>-*.png +append \
  src/characters/<character>/<appearance>-<animation>-<facing>.png
```

Number the frames so that they sort into playing order. A single-frame
Animation is that one cell. The definition reads the sheet with `uniformGrid` at
the cell width, the cell height and one column per frame.

Every figure now stands on the bottom row of its cell, so the Appearance's
Visual Anchor is `{ x: <anchor column>, y: <cell height minus one> }`.

### Approve extras

The four cells of each Appearance, beside `preview.png`.

### Register subject

The initial Appearance's approved `front` still.

### Register notes

Its `--input` is that still under `art/characters/<character>/`, its `--output`
is the Facing's Runtime Asset under `src/characters/<character>/`, and its
`--asset` is the key the Character's row already carries.

The re-run writes that image cropped to the figure again, so redo Recompose for
that Facing and restore its sheet.

The register describes the figure the script measured, not the cell it is padded
into: its `Visual Anchor x` is the figure's own, and the Appearance's Visual
Anchor is the anchor column Recompose took as the largest of them.

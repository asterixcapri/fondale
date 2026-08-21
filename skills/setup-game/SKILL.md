---
name: setup-game
description: Settle how large a Fondale game's world is and what it looks like — the scale anchor every asset is measured against, the Logical Resolution, the visual direction, the HUD Theme — then initialise the asset register and the progress document and write the pipeline's section into the game's AGENTS.md. Use when a game repository has a story and puzzles but no `docs/game/world.md`, or when changing a game's scale, look or interface.
---

# Setup Game

Settle how large the world is and what it looks like, so that every asset made
afterwards is generated at a size somebody decided rather than one a generator
improvised.

## Documents

| | |
| --- | --- |
| Reads | `docs/game/story.md`, `docs/game/puzzles.md`, `docs/game/screenplay.md` |
| Writes | `docs/game/world.md`, `docs/game/assets.md`, `docs/game/progress.md`, the delimited section of `AGENTS.md` |
| Missing input | stop and tell the author to run `/define-story`, or `/define-puzzles` or `/define-screenplay` when only that document is missing; never run any of them yourself |
| Next command | `/to-tickets` |

Paths are literal and relative to the game's own repository, which is the
working directory.

## Workflow

### 1. Take stock

Read `docs/game/story.md` and `docs/game/puzzles.md` for what the game holds,
`docs/game/screenplay.md` for what each Scene shows — its Scene Size, every
piece of Scenery it takes out of the Background, every occupation the cast is
animated doing and every Character the game moves, each of which is artwork this
register has to carry a row for — and `docs/game/world.md` where it already
exists. Read the Engine's own contract from the installed
package, which is the version the game is built against:
`node_modules/@asterixcapri/fondale/docs/public/authoring/project.md` for the
Logical Resolution and the Inventory Appearance Size, `authoring/hud.md` for the
HUD Theme the Engine accepts, and `authoring/scene.md` for Scene Size and
Perspective Scale.

Stop at the missing-input row above when an input document is absent.

Finish when you can list every Scene, Character and Object the three documents
name, name every Animation the screenplay has ordered, and state in one line
what a re-run is here to change.

### 2. Grill the world

Invoke `$grilling` and interview the author. Propose a value for everything a
number can be proposed for, say it is a proposal, and record what the author
answers. Cover:

- **the world unit** — the unit the author measures their world in. What it
  means is the author's business; you only record it and do arithmetic with it.
- **the scale anchor** — one asset from the story whose real size the author can
  state, how many world units it stands for, and how many pixels tall it is at
  Perspective Scale 1. Propose the Player Character. Where the game has no
  visible Player Character, ask for any Character, Object or piece of Scenery
  instead: the anchor only has to be an asset the game will actually make.
- **the Logical Resolution** — propose `1280 × 720`, and an anchor around one
  third of its height, so a 1.75-unit anchor lands near 240 px.
- **the stage** — a side-on or three-quarter view over a walkable ground plane,
  which is what Perspective Scale expresses; ask which, ask where the horizon
  sits as a fraction of the Scene height, ask how much smaller the anchor stands
  at the far edge of the Walkable Region, and propose `0.6`.
- **the declared size of every other asset**, in the same world unit, for every
  Character and Object the story and the puzzles name. Propose one from the
  anchor and the thing's description; the author corrects it.
- **the visual direction** — medium, light, palette, edge treatment, level of
  detail, and what the game must not look like. These are the author's words,
  and every later generation cites them. Ask; propose nothing.
- **the interface** — the font family and its local file, the six HUD colours,
  the opacity, the speech width, the Inventory Appearance Size, the five cursor
  files, and the speech colour of each Character. Propose the numbers, ask for
  the colours and the font.

Finish when the frontier is empty and every row of the tables in step 4 has a
value the author has agreed to.

### 3. Do the arithmetic

Divide the anchor's pixel height by its declared size to get the pixels per
world unit. Every asset's target height is its declared size multiplied by that
factor, rounded to the nearest integer, at Perspective Scale 1.

Carry the factor to one decimal place and compute each target from the factor,
so that the anchor's own target reproduces the height the author gave.

Finish when the factor is written down and the anchor's declared size times the
factor rounds to the anchor's pixel height.

### 4. Write the world contract

Write `docs/game/world.md` in exactly this shape. The rows are examples of the
shape; the written document carries the author's own values in their place.

```markdown
# World contract — <game name>

**Derives from:** `docs/game/story.md`, `docs/game/puzzles.md`

## Scale

| Key | Value |
| --- | --- |
| Logical Resolution | 1280 × 720 |
| World unit | metre |
| Scale anchor | `gatekeeper` |
| Anchor declared size | 1.75 m |
| Anchor pixel height | 240 |
| Pixels per world unit | 137.1 |

Every asset's target height in pixels is its declared size in world units times
the pixels per world unit, rounded to the nearest integer, at Perspective Scale
1. Perspective Scale carries depth only, never a correction to an asset made at
the wrong size.

## Stage

| Key | Value |
| --- | --- |
| View | three-quarter |
| Horizon | 0.35 of the Scene height |
| Perspective Scale at the near edge of the Walkable Region | 1 |
| Perspective Scale at its far edge | 0.6 |

## Visual direction

<The author's own words: medium, light, palette, edge treatment, level of
detail, and what the game must not look like. Every generation cites this
section.>

## UI scale

The HUD and the Inventory are measured against the Logical Resolution and are
untouched by Perspective Scale; an Inventory Appearance belongs to this scale,
not to the world.

| Key | Value |
| --- | --- |
| Inventory Appearance Size | 96 |

## HUD Theme

| Key | Value |
| --- | --- |
| Font family | <family> |
| Font file | `src/hud/<file>.woff2` |
| `text` | `#e8e4dc` |
| `preferred` | `#f0c674` |
| `selected` | `#d99a4e` |
| `backing` | `#17171a` |
| `border` | `#34343c` |
| `inventoryWell` | `#0e0e11` |
| Opacity | 0.9 |
| Max speech width | 520 |
| Cursors | `src/hud/cursor-{left,right,up,down,enter}.png` |

| Character | Speech colour |
| --- | --- |
| `gatekeeper` | `#e8e4dc` |
```

Finish when the file exists at that path, every Character and asset key it names
is one `docs/game/story.md` defines, and no example value from this skill
survives in it.

### 5. Initialise the asset register

Write `docs/game/assets.md` with this header and one row per Runtime Asset the
game still has to make: one for each Character, one for each Object, and one for
each Scene's Background.

```markdown
# Asset register — <game name>

**Derives from:** `docs/game/world.md`, `docs/game/story.md`, `docs/game/puzzles.md`

Declared sizes are the author's, in the world unit `docs/game/world.md`
declares, and are the only cells written by hand. Every other cell is written by
`normalise-runtime-asset.mjs` from the finished image.

| Asset | Declared size | Target height | Measured height | Measured width | Visual Anchor x | File |
| --- | --- | --- | --- | --- | --- | --- |
| gatekeeper | 1.75 m | — | — | — | — | — |
| brassKey | 0.1 m | — | — | — | — | — |
| northGate | 1280 × 720 px | — | — | — | — | — |
```

Give a Scene's Background its Scene Size in pixels as its declared size: a
Background is authored at exactly the Scene Size the Engine validates, so it is
not derived from the world unit and is never normalised.

A re-run adds the rows the game has gained and rewrites the declared size of the
rows it already has, and leaves every measured cell as it found it.

Finish when every Character, Object and Scene the story and the puzzles name has
a row, every declared size carries its unit, and every cell no asset has been
made for yet is an em dash.

### 6. Initialise the progress document

Write `docs/game/progress.md` in this shape, with one slice row per puzzle
`docs/game/puzzles.md` records, in the order its dependencies allow.

```markdown
# Progress — <game name>

**Derives from:** `docs/game/puzzles.md`

## Pipeline

| Step | State |
| --- | --- |
| Story | done |
| Puzzles | done |
| Setup | done |
| Tickets | next |
| Implementation | not started |

## Vertical slices

| Slice | Puzzle | State |
| --- | --- | --- |
| 1 | `openedTheNorthGate` | not started |
```

Finish when the file exists at that path and carries one slice row per puzzle.

### 7. Write the section into the game's AGENTS.md

Rewrite only the text between these two markers in the repository's `AGENTS.md`,
leaving every other line of that file exactly as it was. Where the file has no
such markers, append the whole block, markers included; where the file does not
exist, create it with a title and the block.

```markdown
<!-- BEGIN fondale -->
## Building this game

The Engine's documentation lives in the installed package at
`node_modules/@asterixcapri/fondale/docs/public/`: `vocabulary.md` for the
terms, `authoring/` for every contract, `recipes/` for a worked example. Read it
there, so that what you read is the version this game is built against. Never
copy it into this repository.

This game's own decisions live in `docs/game/`: `story.md` for what exists and
what is true, `puzzles.md` for what stops the Player, `screenplay.md` for what
each Scene shows, `world.md` for the scale, the stage, the visual direction and
the HUD Theme, `assets.md` for every Runtime Asset with its declared size and
its measured height, `progress.md` for what is built. Update `progress.md` at
the end of each ticket.

Tickets are drafted from `docs/game/`, never from the codebase alone. Before
proposing any breakdown — `/to-tickets` included — read `story.md` for the keys
every ticket must name things by, `puzzles.md` for the obstacle each ticket
makes playable, and `screenplay.md` for the staging its Scene owes. A vertical
slice is one playable puzzle, and it is done when the puzzle can be played from
beginning to end **and** the Scene reads as the screenplay says it should.

Runtime Assets are made by invoking `/define-character`, `/define-scene` and
`/define-object`, which derive each target height from `world.md`, normalise the
generated image to it, and write the measurement into `assets.md`. Artwork made
any other way arrives at a size nobody decided.

The first visual asset is the Player Character: it is the anchor every other
asset is measured against. Until it exists, build Scenes on placeholder
Backgrounds at exactly their Scene Size, so that finished artwork later changes
no authored coordinate.
<!-- END fondale -->
```

Finish when the file contains exactly one such block, its content matches the
block above, and `git diff AGENTS.md` shows no change outside it.

## Handoff

Report the pixels per world unit, the anchor and its height, how many rows the
register gained, and every value you proposed that the author accepted without
changing, so the author can see what they inherited rather than chose.

End by giving the author the `Next command` from the table above, alone on its
own line, as the exact text to type.

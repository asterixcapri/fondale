---
name: define-object
description: Fabricate a Fondale Object at the size the game decided — its world target derived from the world contract and judged beside the Character who carries it, its Inventory Appearance authored on the UI scale, normalised, approved at play size, and authored as an ObjectDefinition with its Noun and its whole lifecycle. Use when a ticket needs an Object, when redoing one, when adding an Appearance or an Animation, or when changing how an Object is collected, used, placed back or consumed.
---

<!-- Generated. Hand edits are overwritten by the next generation. -->

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

### 1. Take stock

Read `docs/game/world.md` for the pixels per world unit, the Logical Resolution,
the Inventory Appearance Size, the stage and the visual direction;
`docs/game/assets.md` for this Object's declared size, for the measured height
of the Character who will carry it, and for every asset already made;
`docs/game/story.md` and `docs/game/puzzles.md` for what this Object is and
which puzzle it serves. Read the Engine's own contract from the installed
package, which is the version the game is built against:
`node_modules/@asterixcapri/fondale/docs/public/authoring/object.md` for the
lifecycle, the non-directional Appearances, the Inventory Appearance and the
Noun, `authoring/interaction.md` for Nouns, Verbs, Command Cases and Game
Operations, and
`node_modules/@asterixcapri/fondale/docs/public/recipes/lantern.ts` for a worked
definition.

Stop at the missing-input row above when `docs/game/world.md` is absent, and
when the Object has no row in `docs/game/assets.md`: a declared size is the
author's to give and `/setup-game` is where it is given.

For an Object that already exists, inventory what a change would touch before
proposing one: the definition, its Runtime Assets, the Scene that holds it, and
every Command Case, Sequence and condition that names it.

Finish when you can state the Object's declared size, the pixels per world unit,
the Inventory Appearance Size, the measured height of the Character who carries
it, and which Appearances and Animations this run produces.

### 2. Grill the Object brief

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
lifecycle, the list of Appearances, the Animations of each, and every
interaction the Noun answers.

### 3. Anchor

An Object has no size of its own: it exists in proportion to the Character who
carries it and the Scene it sits in. Its target height in pixels is therefore
the same arithmetic as every other asset of the world — the Object's declared
size in `docs/game/assets.md` times the pixels per world unit in
`docs/game/world.md`, rounded to the nearest integer, at Perspective Scale 1 —
and it is the height of every Appearance it wears in a Scene and of every
Animation frame.

The Inventory Appearance has a target of its own and it is not on that scale. It
belongs to the UI, which `docs/game/world.md` measures against the Logical
Resolution: its target is the Inventory Appearance Size that document declares,
the Engine draws it square at exactly that size, and no Perspective Scale ever
touches it. It is judged for legibility in the drawer rather than for
consistency with the artwork of the Scene, so an Object too small to read at
that size is drawn larger in its own frame rather than shrunk to match the
Scene.

Gather the visual references as files, so that generation sees the artwork
rather than a description of it: the `File` column of `docs/game/assets.md` for
every asset whose measured height is filled in — the script writes those paths
relative to the register, so resolve them from `docs/game/` — and the artwork of
the Character who will carry this Object and the Background of the Scene it
starts in.

Where no asset has been made yet, derive a neutral reference from the declared
numbers instead. Draw a featureless figure of roughly human proportions — a head
of about an eighth of the height, a body of about a quarter of it in width — at
any size, normalise it to the anchor pixel height `docs/game/world.md` records,
and place it on `<canvas>`, a frame of the Logical Resolution, so that the
generation sees how much of the frame the figure fills:

```sh
magick -size 400x600 xc:none -fill '#808080' \
  -draw "circle 200,90 200,60" -draw "roundrectangle 140,120 260,540 24,24" figure.png
node <skill>/scripts/normalise-runtime-asset.mjs \
  --input figure.png --output silhouette.png --target-height <anchor pixel height>
magick -size <canvas> xc:'#202020' silhouette.png \
  -geometry +<x>+<y> -composite reference-frame.png
```

Finish when every target this run needs is written down and every reference
exists on disk as a file you can pass to a generator.

### 4. Generate

Invoke `$imagegen` once per image, passing the reference files themselves. Each
prompt carries the visual direction quoted in the brief, the brief itself, and
nothing this skill invented about how the game looks.

Each prompt also carries a transparent background and the whole Object resting
on its own lowest point at the bottom edge. An Object has no Facing, so it is
drawn once per Appearance rather than once per direction.

Generate the Object's initial Appearance as it stands in the Scene first.
Generate every other Appearance from it as its reference, so that a state change
reads as the same thing in another condition, and an Animation's frames one
image per frame from the approved still of their own Appearance, each holding
the Object's full extent from top to resting point.

Generate the Inventory Appearance last and separately, from the approved initial
Appearance as its reference, drawn square and filling its frame: it is the same
Object seen in the hand rather than across a Scene, so it carries the
silhouette, the palette and the one detail that names it, and never a scaled
copy of the artwork the Scene shows.

Write every generation to `art/objects/<object>/`, which is where this game's
Art Masters live.

Finish when every image this run needs exists there as a PNG.

### 5. Normalise

Generation settles how the artwork looks; the script settles how large it is, so
that a target is never negotiated with a generator. Run it on every image, with
that image's target from Anchor:

```sh
node <skill>/scripts/normalise-runtime-asset.mjs \
  --input art/objects/<object>/<name>.png \
  --output art/objects/<object>/normalised/<name>.png \
  --target-height <target>
```

The output is the asset alone, cropped to its own opaque pixels; Recompose gives
it its place. Keep the measured width and the Visual Anchor x the script reports
for each image: they are what Recompose is arithmetic on.

Every Appearance and every frame this Object wears in a Scene takes the same
world target, so that changing state or playing an Animation cannot change its
size.

The Inventory Appearance takes the Inventory Appearance Size instead, on the UI
scale Anchor kept apart from the world one:

```sh
node <skill>/scripts/normalise-runtime-asset.mjs \
  --input art/objects/<object>/inventory.png \
  --output art/objects/<object>/normalised/inventory.png \
  --target-height <Inventory Appearance Size>
```

Finish when every image of this run has been normalised and its measurements
recorded.

### 6. Recompose

One cell holds every Appearance and every frame of this Object, and every image
meets its resting point on the same row of it. Take the anchor column as the
largest Visual Anchor x reported in Normalise; each image is padded on its left
by that column minus its own Visual Anchor x; the cell is as wide as the widest
padded image and as tall as the target.

```sh
magick art/objects/<object>/normalised/<name>.png -background none \
  -gravity west -splice <left padding>x0 \
  -gravity southwest -extent <cell width>x<cell height> \
  art/objects/<object>/cells/<appearance>-<animation>-<frame>.png
```

The frames of one Animation then become that Animation's sheet, in order, which
is the Runtime Asset and belongs beside the `ObjectDefinition` that imports it:

```sh
magick art/objects/<object>/cells/<appearance>-<animation>-*.png +append \
  src/objects/<object>/<appearance>-<animation>.png
```

Number the frames so that they sort into playing order. A single-frame Animation
is that one cell. The definition reads the sheet with `uniformGrid` at the cell
width, the cell height and one column per frame. Every image now rests on the
bottom row of its cell, so the Object's Visual Anchor is `{ x: <anchor column>,
y: <cell height minus one> }`.

The Inventory Appearance is squared rather than celled. Fit it inside the square
and pad the rest with transparency; the fit is what makes an Object wider than
it is tall obey the square as well as a tall one does:

```sh
magick art/objects/<object>/normalised/inventory.png -background none \
  -resize <Inventory Appearance Size>x<Inventory Appearance Size> \
  -gravity center -extent <Inventory Appearance Size>x<Inventory Appearance Size> \
  src/objects/<object>/inventory.png
```

The recomposition below has to show this Object beside the hand that will hold
it: place the Object at the Ground Point it starts from, and take the Character
who carries it as the figure standing in the frame, rather than whichever
Character is nearest.

Then compose what the Player will see, at 1:1 and at the Logical Resolution —
cropped to the frame the camera shows, where the Scene is wider than one screen.
The Background, this run's artwork where it belongs, and a Character standing at
a Ground Point inside the Walkable Region: the scale anchor, or the nearest
Character already made.

```sh
magick <background>.png <asset>.png \
  -geometry +<x minus its Visual Anchor x>+<y minus its Visual Anchor y> -composite preview.png
```

Composite one image per asset in the frame. Where the Perspective Scale at a
Ground Point is not 1, resize that image by it before compositing, and take its
Visual Anchor with it.

Finish when `preview.png` is the Logical Resolution and every asset in it meets
the ground where it stands, at the size the Player will see.

### 7. Approve

Show the author `preview.png` at 1:1, together with the Inventory Appearance
shown at the Inventory Appearance Size on the `inventoryWell` colour of the HUD
Theme — the two silhouettes against each other for whether this is a thing that
hand could pick up, the drawer for whether the same thing still reads at a size
the Scene never shows it at. The isolated generation is not what is being
approved: the question is whether this work belongs where the Player will find
it, at that size, beside what the game already has.

Return to Generate for every image the author refuses, and keep the targets
untouched while doing it: what a generator got wrong is the drawing, never the
size.

Finish when the author has approved the recomposition in words.

### 8. Register

Run the script once more on the approved initial Appearance's world still, with
the register flags this time, so that the measurement the register carries is
one the script took from the finished image:

```sh
node <skill>/scripts/normalise-runtime-asset.mjs \
  --input <the approved image> --output <its Runtime Asset> \
  --target-height <target> --register docs/game/assets.md --asset <asset key>
```

Its `--input` is that still under `art/objects/<object>/`, its `--output` is the
Appearance's Runtime Asset under `src/objects/<object>/`, and its `--asset` is
the key the Object's row already carries.

The re-run writes that image cropped to the Object again, so redo Recompose for
that Appearance and restore its sheet.

The register describes the Object the script measured, not the cell it is padded
into: its `Visual Anchor x` is the Object's own, and the Appearance's Visual
Anchor is the anchor column Recompose took as the largest of them.

The Inventory Appearance gets no row and no measurement: every cell of the
register is a pixel height on the world scale, so measuring a UI number into a
column of world numbers would leave the next asset anchored against it.

Finish when the asset's row in `docs/game/assets.md` carries a measured height
equal to its target, and no measured cell of the register was typed by hand.

### 9. Author the definition

Write or update the `ObjectDefinition` under `src/objects/<object>/`, beside the
Runtime Assets, following the contract read in Take stock: the initial Scene,
the initial Ground Point and the initial Appearance, the square
`inventoryAppearance` Recompose built, one non-directional Animation sheet per
Appearance read with `uniformGrid` at the cell Recompose built, the Roles, the
`timing`, and the Noun with its Verbs, its Command Cases, its fallback and its
Game Operations.

Lasting state is an Appearance or a location, and an Animation is transient: an
Object that has been emptied wears a different Appearance rather than a
different loop. A Ground Point named by a place operation is checked against
every registered Scene, not only the one intended.

The Scene's own geometry — the Hotspot, the Approach Point, the Walkable Region
— belongs to its `SceneDefinition` and is `/define-scene`'s work; report what
this Object needs there rather than editing it here.

Finish when the game builds, the initial Ground Point lies inside the initial
Scene's Walkable Region, the Inventory Appearance is square at the declared
Inventory Appearance Size, every Verb the Noun advertises reaches a Command Case
or the fallback, and collection, use, placement and consumption each reach a
state the game can carry on from.

### 10. Verify in the Engine

Run the game and play the Object's whole lifecycle: walk to it, look at it,
collect it, open the Inventory, select it, use it on every authored target and
on one nobody authored, place it back where it can be placed, and consume it
where it is consumed. Confirm that it stands beside the carrying Character at
the size `preview.png` showed, that changing its Appearance does not change its
height, that it reads in the drawer at the Inventory Appearance Size, and that
the same Noun answers in the Scene and in the Inventory.
`node_modules/@asterixcapri/fondale/docs/public/authoring/testing.md` drives the
same play from a test.

Finish when every Appearance and Animation loads, the Object measures the height
the register records, and no interaction leaves the game in a state the Player
cannot leave.

## Handoff

Report the declared size, the target height and the measurement the script took
from the finished artwork; the Inventory Appearance Size and the square asset;
the Visual Anchor and the cell; every file written; the register row; the
lifecycle from the initial Scene to consumption; anything the Scene must gain
for this Object to be reachable; and every Appearance, Animation or interaction
the author asked for that this run did not produce.

End by giving the author the `Next command` from the table above, alone on its
own line, as the exact text to type.

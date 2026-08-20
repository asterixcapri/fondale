---
name: fabrication-cycle
description: Turn a brief into an approved Runtime Asset at the size the game decided — anchor the target and the references, generate against them, normalise to the target, recompose what the Player will see, approve at play size, and register the measurement the script took. Invoked by `/define-scene`, `/define-character` and `/define-object` rather than run on its own.
---

# Fabrication Cycle

Six steps that take a brief to an approved Runtime Asset. They are the same for
a Scene, a Character and an Object, so they are written here once and every
fabrication skill invokes them in the middle of its own workflow.

## What the calling skill supplies

This skill knows how an asset is fabricated and nothing about what kind of asset
this run produces. The calling skill carries a `## Fabrication definitions`
section, and every step below reads the definitions it needs from there by name:

**Target**, **Extra references**, **Reference canvas**, **Art directory**,
**Generation order**, **Normalise notes**, **Recompose assembly**, **Approve
extras**, **Register subject**, **Register notes**.

Stop and say so when the skill that invoked this one carries no such section, or
when a step below asks for a definition that section does not give: a step run
against a target nobody defined is the one failure this cycle exists to prevent.

Paths are literal and relative to the game's own repository, which is the
working directory, except `<fabrication-cycle>/scripts/normalise-runtime-asset.mjs`:
that one is this skill's own copy of the normaliser, and `<fabrication-cycle>`
stands for the directory this skill was installed into, beside the skill that
invoked it. ImageMagick 7 — the `magick` command — must be installed.

`<art directory>` below is the **Art directory** the calling skill defines.

## The cycle

### Anchor

Take the run's targets from the calling skill's **Target**.

Gather the visual references as files, so that generation sees the artwork
rather than a description of it: the `File` column of `docs/game/assets.md` for
every asset whose measured height is filled in — the script writes those paths
relative to the register, so resolve them from `docs/game/` — and whatever
**Extra references** names.

Where no asset has been made yet, derive a neutral reference from the declared
numbers instead. Draw a featureless figure of roughly human proportions — a head
of about an eighth of the height, a body of about a quarter of it in width — at
any size, normalise it to the anchor pixel height `docs/game/world.md` records,
and place it on `<canvas>`, a frame of the size **Reference canvas** gives, so
that the generation sees how much of the frame the figure fills:

```sh
magick -size 400x600 xc:none -fill '#808080' \
  -draw "circle 200,90 200,60" -draw "roundrectangle 140,120 260,540 24,24" figure.png
node <fabrication-cycle>/scripts/normalise-runtime-asset.mjs \
  --input figure.png --output silhouette.png --target-height <anchor pixel height>
magick -size <canvas> xc:'#202020' silhouette.png \
  -geometry +<x>+<y> -composite reference-frame.png
```

Finish when every target this run needs is written down and every reference
exists on disk as a file you can pass to a generator.

### Generate

Invoke `$imagegen` once per image, passing the reference files themselves. Each
prompt carries the visual direction quoted in the brief, the brief itself, and
nothing invented about how the game looks.

Follow the calling skill's **Generation order**: it says what is drawn first,
what is drawn from what, and what each prompt carries beyond the brief.

Write every generation to `<art directory>/`, which is where this game's Art
Masters live.

Finish when every image this run needs exists there as a PNG.

### Normalise

Generation settles how the artwork looks; the script settles how large it is, so
that a target is never negotiated with a generator. Run it on every image, with
that image's target from Anchor:

```sh
node <fabrication-cycle>/scripts/normalise-runtime-asset.mjs \
  --input <art directory>/<name>.png \
  --output <art directory>/normalised/<name>.png \
  --target-height <target>
```

The output is the asset alone, cropped to its own opaque pixels; Recompose gives
it its place. Keep the measured width and the Visual Anchor x the script reports
for each image: they are what Recompose is arithmetic on.

Apply the calling skill's **Normalise notes**, which say which images share a
target and which take one of their own.

Finish when every image of this run has been normalised and its measurements
recorded.

### Recompose

Assemble the normalised images as the calling skill's **Recompose assembly**
directs: the cells, the sheets, the padding and the Visual Anchor it fixes.

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

### Approve

Show the author `preview.png` at 1:1, together with whatever **Approve extras**
names. The isolated generation is not what is being approved: the question is
whether this work belongs where the Player will find it, at that size, beside
what the game already has.

Return to Generate for every image the author refuses, and keep the targets
untouched while doing it: what a generator got wrong is the drawing, never the
size.

Finish when the author has approved the recomposition in words.

### Register

Run the script once more on the calling skill's **Register subject**, with the
register flags this time, so that the measurement the register carries is one the
script took from the finished image:

```sh
node <fabrication-cycle>/scripts/normalise-runtime-asset.mjs \
  --input <the approved image> --output <its Runtime Asset> \
  --target-height <target> --register docs/game/assets.md --asset <asset key>
```

Follow the calling skill's **Register notes** for this run's flags, for what is
re-composed after the script writes over an image, and for what gets no row at
all.

Finish when the asset's row in `docs/game/assets.md` carries a measured height
equal to its target, and no measured cell of the register was typed by hand.

## Handoff

Return to the skill that invoked this one at the step after its invocation, and
report the target of every image, the measurement the script took from each, the
Visual Anchor and the cell that Recompose fixed, and every file written.

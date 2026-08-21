---
name: define-scene
description: Fabricate a Fondale Scene the Player can walk across — Walkable Region and Perspective Scale derived from the world contract, geometry measured on a 1:1 plan, a placeholder Background at the exact Scene Size authored first, then the finished Background and Scenery generated, normalised and approved at play size. Use when a ticket needs a Scene, when redoing one, or when changing a Scene's geometry, artwork or connections.
---

# Define Scene

Produce a Scene that is navigable before it is beautiful: its geometry measured
at 1:1 against the silhouettes the world contract fixes, authored on a
placeholder Background at exactly the Scene Size, so that finished artwork
arrives later and changes no coordinate.

## Documents

| | |
| --- | --- |
| Reads | `docs/game/world.md`, `docs/game/assets.md`, `docs/game/story.md`, `docs/game/puzzles.md`, `docs/game/screenplay.md` |
| Writes | the Scene's Runtime Assets, its `SceneDefinition`, and the Background's row of `docs/game/assets.md` |
| Missing input | stop and tell the author to run `/setup-game`, or `/define-story`, `/define-puzzles` or `/define-screenplay` when only their own document is missing; never run any of them yourself |
| Next command | `/define-object` while an Object this Scene needs has no artwork; otherwise back to the ticket |

Paths are literal and relative to the game's own repository, which is the
working directory. The artwork itself is fabricated by the `fabrication-cycle`
skill, which must be installed beside this one and which carries the normaliser
this skill's definitions are written against. ImageMagick 7 — the `magick`
command — must be installed.

## Workflow

### 1. Take stock

Read `docs/game/world.md` for the Logical Resolution, the pixels per world unit,
the view, the horizon, the Perspective Scale at each edge of the Walkable Region
and the visual direction; `docs/game/assets.md` for this Scene's Background row
— its declared size is the Scene Size in pixels — and for every asset already
made, each with the measured height the Scene has to accommodate;
`docs/game/story.md` and `docs/game/puzzles.md` for what happens here and what
the Player must be able to reach; and `docs/game/screenplay.md` for this Scene's
own section, which is what this Scene has to show — its set, which elements are
Scenery and why, where every Character stands and what they are doing there, and
the route. Read the Engine's own contract from the
installed package, which is the version the game is built against:
`node_modules/fondale/docs/public/authoring/scene.md` for Scene Size, Walkable
Region, Perspective Scale, Hotspots, Approach Points, Scene Entrances and Scene
Passages, `authoring/scenery.md` for Scenery, its Baseline, its position and its
Appearances, and `node_modules/fondale/docs/public/recipes/world.ts` for two
worked definitions.

Stop at the missing-input row above when any of those five documents is absent,
and when the Scene has no Background row in `docs/game/assets.md`: a Scene Size
is the author's to give and `/setup-game` is where it is given.

For a Scene that already exists, inventory what a change would touch before
proposing one: the definition, its Runtime Assets, the passages that arrive
here, and every Character or Object placed by its Ground Point in this Scene.

Finish when you can state the Scene Size, the Perspective Scale at each edge of
the Walkable Region, the measured height of the scale anchor, what the
screenplay's route says this Scene's Walkable Region is a corridor between, and
what this run is here to produce.

### 2. Grill the Scene brief

Invoke `$grilling`. The screenplay has already settled what this Scene shows,
so bring its section as the proposal and grill what it does not answer rather
than reopening it: every Scene Entrance and every Scene Passage and where it
leads; what must be reachable on foot and what is only to be looked at; the
measurements the set and the route need to become coordinates; and, for a re-run,
what must survive unchanged. Where the screenplay is silent on something this
Scene cannot be built without, ask the author for it here and say which section
of `docs/game/screenplay.md` gained the answer.

The look of the game is settled: quote the `## Visual direction` section of
`docs/game/world.md` into every generation and add no style of your own.

Finish when the frontier is empty and the author has confirmed the Scene's
connections, its interactive content, and which elements are Scenery.

### 3. Plan the stage at 1:1

Build the plan at exactly the Scene Size, and measure every coordinate on it. A
resized preview, a thumbnail and a generator's own framing are all the wrong
size: a coordinate read off one of them is wrong by whatever the resize was.

Take the Perspective Scale stops from `docs/game/world.md` — the near edge, the
far edge and the horizon as a fraction of the Scene height — and place them on
the plan as depth bands on Scene Space `y`. Multiply the scale anchor's measured
height in `docs/game/assets.md` by the scale of each band to get the silhouette
the Player will see there, and draw those silhouettes on the plan before drawing
anything else. Architecture, doorways, furniture and Scenery are sized around
them; a Character is never resized to fit a Scene that was drawn too large.

Then draw the set, from the screenplay's own table, before drawing the floor:
every element where it stands, at the size the silhouettes give it. The Walkable
Region is what the furniture leaves — the corridor the screenplay's route
describes, traced between the pieces rather than under them — as one connected
polygon with the fewest purposeful vertices. Keep it honest about what it costs
to cross: obstacles lie outside it or along its boundary, never as islands
inside it; no channel is narrower than the widest silhouette that has to pass,
except a chokepoint the screenplay asks for on purpose, which is drawn exactly
one silhouette wide; and the route between any two things the Player uses is
direct rather than a detour around a concavity nobody asked for. Inset the boundary from every solid form by half that
silhouette's width, so a Character walking the edge does not clip into it.

Place the Approach Point of every interactive target inside the region, and every
Scene Entrance on or inside it. Record for each Scenery element its position, its
Baseline, its Visual Anchor and its ground-contact footprint.

Now draw the placeholders, and draw them where the finished Runtime Assets will
go rather than beside them: these are the files the artwork later overwrites, so
the Scene is authored once against the sizes it will keep. The Background is
flat bands for sky, ground and water with the Walkable Region painted on it, at
exactly the Scene Size.

```sh
magick -size <Scene width>x<Scene height> xc:'#3a4a5a' \
  -fill '#6a6a5a' -draw "polygon <the Walkable Region's points>" \
  -fill white -pointsize 24 -annotate +<x>+<y> '<the Scene's name>' \
  src/scenes/<scene>/background.png
```

Each Scenery Appearance is a flat block of the size the plan gives that element,
with its own Visual Anchor where the finished artwork will carry it.

```sh
magick -size <element width>x<element height> xc:'#8a8a8a' \
  -fill white -pointsize 24 -annotate +8+32 '<its name>' \
  src/scenes/<scene>/<element>-<appearance>.png
```

Draw the geometry over whatever Background is current as well, as a diagnostic
of its own rather than a Runtime Asset, and redraw it from the authored values
whenever they change — including after the artwork arrives, which is what the
author is shown at Approve.

```sh
magick src/scenes/<scene>/background.png -fill none -strokewidth 2 \
  -stroke '#ff00ff' -draw "polygon <the Walkable Region's points>" \
  -stroke '#00ffff' -draw "line 0,<a Perspective Scale stop> <Scene width>,<the same y>" \
  -stroke '#ffff00' -draw "circle <an Approach Point> <the same point plus 4 in x>" \
  art/scenes/<scene>/geometry.png
```

Finish when the placeholder Background is exactly the Scene Size, every element
of the screenplay's set is on the plan, every Scenery Appearance has a
placeholder at its planned size, every Character the screenplay places has a
Ground Point inside the region at the spot its section gives, every point and
polygon has a coordinate measured on the 1:1 plan, and the anchor silhouette fits the Scene at
the near, middle and far bands without clipping the frame.

### 4. Author the playable Scene

Write or update the `SceneDefinition` under `src/scenes/<scene>/`, beside the
placeholder, following the contract read in Take stock: the Background, the Scene
Size, the Walkable Region, the Perspective Scale stops, each Scenery element with
the position, Baseline and Visual Anchor recorded in the plan, the Hotspots, the
Approach Points, the Scene Entrances, the Scene Passages and the cases with
which the Scene answers its own Scene Opening.

Then run the game and walk the Scene on the placeholder. Every coordinate this
step authors is final: the rest of this skill replaces image files and nothing
else, and a Scene that only walks properly once it is beautiful was measured
wrong.

Finish when the game builds, a Character walks from every Scene Entrance to every
Approach Point by a route the author would have taken, every Scene Passage
arrives where the plan says, and no authored point lies outside the Walkable
Region that has to contain it.

### 5. Fabricate the artwork

Invoke the `fabrication-cycle` skill, which runs Anchor, Generate, Normalise,
Recompose, Approve and Register. It reads what it needs about a Scene from the
`## Fabrication definitions` section at the end of this document; give it that
section, the brief the grilling settled, and the plan the previous steps
measured.

Finish when the cycle hands back an approved recomposition, the finished
Background and Scenery Appearances written over their placeholders, and the
Background's registered row.

### 6. Verify in the Engine

Run the game again with the finished artwork in place and walk the Scene as
before. Confirm first that this run changed image files and no coordinate: the
artwork overwrote the placeholders at their own paths, so `git diff` on the
`SceneDefinition` shows nothing.

Then check what only the artwork can now be wrong about: a Character stands the
height of the plan's silhouette at the near, middle and far bands; it passes in
front of Scenery whose Baseline is above its Ground Point and behind Scenery
whose Baseline is below it; the ground the artwork paints as walkable is the
ground the Walkable Region contains, and no painted obstacle stands inside it;
every Scene Passage, Scene Entrance, Hotspot and Scenery Appearance still
answers. `node_modules/fondale/docs/public/authoring/testing.md`
drives the same play from a test.

Finish when the Scene plays as it did on the placeholder, and every Scenery
Appearance lands on the pixel the plan gave it.

## Handoff

Report the Scene Size and the Perspective Scale stops; every file written and
which of them are Runtime Assets; the Background's register row; the Walkable
Region and how a Character crosses it; and every interaction, passage or Scenery
Appearance the author asked for that this run did not produce.

End by giving the author the `Next command` from the table above, alone on its
own line, as the exact text to type.

## Fabrication definitions

What the `fabrication-cycle` skill reads when this skill invokes it. Each
heading is the name a step of that cycle asks for.

### Target

The Background has one target and it is not derived from the world unit: it is
the Scene Size, the declared size of the Scene's row in `docs/game/assets.md`,
which is the size the Engine validates a Background against. The plan and the
placeholder are already that size, so the finished Background inherits every
coordinate rather than deciding any.

Each Scenery element has a target height of its own, and the Engine leaves
Scenery alone: it never applies Perspective Scale to it, so the element is
painted at the size it appears at its own Baseline. Its target is its declared
size in world units, times the pixels per world unit in `docs/game/world.md`,
times the Perspective Scale at its Baseline, rounded to the nearest integer.
Where the author gave no declared size for an element, take the height its
labelled block occupies on the plan as the target and tell the author the size
in world units that implies.

### Extra references

The Backgrounds of the Scenes this one connects to, and the artwork of every
Character and Object that appears here.

### Reference canvas

The Scene Size.

### Art directory

`art/scenes/<scene>`

### Generation order

Each prompt also carries the view and the horizon from `docs/game/world.md`, and
the placeholder as the composition to follow: what stands where, and how much of
the frame the ground takes.

Generate the assembled composition first, at the Scene Size and with every
Scenery element painted in place, so that scale, perspective, overlap, light and
ground contact are solved together rather than negotiated afterwards. Then
generate the clean Background from it, with every Scenery element painted out and
the surface behind it complete — a plausible wall, floor, sky or water, not a
hole. Then generate one transparent image per Scenery Appearance, and one per
frame of a Scenery Animation, each from the composition as its reference and
each on a transparent background.

### Normalise notes

The Background is the exception: it carries no alpha, so the script would crop
it to itself and rescale it by whatever its aspect happened to be. Force it to
the Scene Size instead, and let Register measure the result:

```sh
magick art/scenes/<scene>/background.png \
  -resize <Scene width>x<Scene height>! art/scenes/<scene>/normalised/background.png
```

### Recompose assembly

Give each Scenery Appearance its cell before composing anything: pad the
normalised image so that its own Visual Anchor x lands on the anchor column the
plan recorded for that element, and so that the row where the element meets the
ground is the bottom row of the cell. Every Appearance and every frame of one
element shares that cell, so that changing state cannot make it jump, and the
element's Visual Anchor is `{ x: <anchor column>, y: <cell height minus one> }`
whatever Appearance it is wearing.

```sh
magick art/scenes/<scene>/normalised/<element>-<appearance>.png -background none \
  -gravity west -splice <left padding>x0 \
  -gravity southwest -extent <cell width>x<cell height> \
  src/scenes/<scene>/<element>-<appearance>.png
```

Then check the two halves of the separation against each other. Composite every
Scenery element over the clean Background at the position the Scene definition
gives it, and compare the result with the assembled composition: they are the
same picture, or the separation lost something. Look at the clean Background
alone as well, and refuse it if a removed element left a hole, a shadow or a
duplicate of itself behind.

### Approve extras

The assembled composition beside `preview.png`, the clean Background alone, and
the geometry overlay drawn over the finished Background.

### Register subject

The approved Background, forced to the Scene Size in Normalise.

### Register notes

Its `--input` is `art/scenes/<scene>/normalised/background.png`, the copy
Normalise forced to the Scene Size; its `--output` is
`src/scenes/<scene>/background.png`, over the placeholder; its `--target-height`
is the Scene height; and its `--asset` is the key the Scene's row already
carries.

The script is measuring here rather than deciding: the image already is the
Scene Size, so passing that height as the target rescales nothing and the row
records what the Engine will validate.

Only the Background has a row: Scenery is measured by the plan and carried by the
`SceneDefinition`, where its position, Baseline and Visual Anchor already live,
and `docs/game/assets.md` has one row per Scene rather than one per element.

The Background's `Measured height` and `Measured width` are the Scene Size the
Engine validates, so a run that reports anything else has produced a Background
the Engine will refuse.

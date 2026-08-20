## target

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

## extra references

the Backgrounds of the Scenes this one connects to and the artwork of every
Character and Object that appears here

## reference canvas

the Scene Size

## art directory

art/scenes/<scene>

## generation order

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

## normalise notes

The Background is the exception: it carries no alpha, so the script would crop
it to itself and rescale it by whatever its aspect happened to be. Force it to
the Scene Size instead, and let Register measure the result:

```sh
magick art/scenes/<scene>/background.png \
  -resize <Scene width>x<Scene height>! art/scenes/<scene>/normalised/background.png
```

## recompose assembly

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

## approve extras

the assembled composition beside it, the clean Background alone, and the
geometry overlay drawn over the finished Background

## register subject

the approved Background, forced to the Scene Size in Normalise

## register notes

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

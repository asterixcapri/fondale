## target

The target height in pixels is the Character's declared size in
`docs/game/assets.md` times the pixels per world unit in `docs/game/world.md`,
rounded to the nearest integer. It is arithmetic, never a judgement, and it is
the height of every Facing and every Animation frame of this Character.

## extra references

the Background of the Character's initial Scene

## reference canvas

the Logical Resolution

## art directory

art/characters/<character>

## generation order

Each prompt also carries the Facing being drawn, a transparent background, and
the whole figure standing with its feet at the bottom edge.

Generate the four still Facings of an Appearance first. Generate an Animation's
frames afterwards, one image per frame, each from the approved still of the same
Facing as its reference, and each holding the figure's standing extent from head
to floor: a pose that shortens the figure is a pose normalisation would stretch
back to full height.

## normalise notes

Every image of this Character takes the same target, so that turning and walking
cannot change its height.

## recompose assembly

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

## approve extras

and the four cells of each Appearance beside it

## register subject

the initial Appearance's approved `front` still

## register notes

Its `--input` is that still under `art/characters/<character>/`, its `--output`
is the Facing's Runtime Asset under `src/characters/<character>/`, and its
`--asset` is the key the Character's row already carries.

The re-run writes that image cropped to the figure again, so redo Recompose for
that Facing and restore its sheet.

The register describes the figure the script measured, not the cell it is padded
into: its `Visual Anchor x` is the figure's own, and the Appearance's Visual
Anchor is the anchor column Recompose took as the largest of them.

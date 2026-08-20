## target

An Object has no size of its own: it exists in proportion to the Character who
carries it and the Scene it sits in. Its target height in pixels is therefore
the same arithmetic as every other asset of the world — the Object's declared
size in `docs/game/assets.md` times the pixels per world unit in
`docs/game/world.md`, rounded to the nearest integer, at Perspective Scale 1 —
and it is the height of every Appearance it wears in a Scene and of every
Animation frame.

The Inventory Appearance has a target of its own and it is not on that scale.
It belongs to the UI, which `docs/game/world.md` measures against the Logical
Resolution: its target is the Inventory Appearance Size that document declares,
the Engine draws it square at exactly that size, and no Perspective Scale ever
touches it. It is judged for legibility in the drawer rather than for
consistency with the artwork of the Scene, so an Object too small to read at
that size is drawn larger in its own frame rather than shrunk to match the
Scene.

## extra references

the artwork of the Character who will carry this Object and the Background of the
Scene it starts in

## reference canvas

the Logical Resolution

## art directory

art/objects/<object>

## generation order

Each prompt also carries a transparent background and the whole Object resting on
its own lowest point at the bottom edge. An Object has no Facing, so it is drawn
once per Appearance rather than once per direction.

Generate the Object's initial Appearance as it stands in the Scene first.
Generate every other
Appearance from it as its reference, so that a state change reads as the same
thing in another condition, and an Animation's frames one image per frame from
the approved still of their own Appearance, each holding the Object's full extent
from top to resting point.

Generate the Inventory Appearance last and separately, from the approved initial
Appearance as its reference, drawn square and filling its frame: it is the same
Object seen in the hand rather than across a Scene, so it carries the silhouette,
the palette and the one detail that names it, and never a scaled copy of the
artwork the Scene shows.

## normalise notes

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

## recompose assembly

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
bottom row of its cell, so the Object's Visual Anchor is
`{ x: <anchor column>, y: <cell height minus one> }`.

The Inventory Appearance is squared rather than celled. Fit it inside the square
and pad the rest with transparency; the fit is what makes an Object wider than it
is tall obey the square as well as a tall one does:

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

## approve extras

together with the Inventory Appearance shown at the Inventory Appearance Size on
the `inventoryWell` colour of the HUD Theme — the two silhouettes against each
other for whether this is a thing that hand could pick up, the drawer for whether
the same thing still reads at a size the Scene never shows it at

## register subject

the approved initial Appearance's world still

## register notes

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

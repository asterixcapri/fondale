# Cloister production artwork provenance

The production Scene package was regenerated on 2026-08-16 with the built-in
OpenAI image generation tool. The previous cloister artwork was not used as
final production art. The first generated assembled concept established the
location, early-afternoon light, broad route and mechanical focal area. A
second generated clean plate removed all Characters and the complete well. A
third generation produced the seized well on a flat magenta key for local
alpha extraction.

The final `composition.png` is the exact 1280×720 recomposition of:

- `background.png`, the clean Background Art Master;
- `well-seized.png`, the transparent seized-well Scenery Art Master, fitted as
  `src/scenes/cloister/well-seized.png` at `(875, 270)`;
- `src/characters/brother-elia/idle.png`, shown in the composition at its
  authored Ground Point `(790, 620)` and Perspective Scale `0.918`. This is the
  sole approved 256×256 static Runtime image derived byte-for-byte from the
  lossless `art/characters/brother-elia/static-v2.png` Art Master, promoted
  from the source checkout with explicit user approval (SHA-256
  `fc3448d954ce38d23daf9e72e91be2cabc4815090d4f54d769701bd509402a59`).
  It was not regenerated, repainted or used to create presentation variants.

Michele does not appear in production Scene artwork. His approved V3 Runtime
sprites remain unchanged and are rendered by the Engine against the recorded
Perspective Scale.

## Composition prompt

> Create a complete original afternoon cloister courtyard on Capri in 1535 as
> a playable fixed stage. Use a broad pale-stone walking floor, a shaded arcade
> passage on the left, honey limestone architecture and a small garden wall.
> On the right, stage a mechanically plausible seized well with a taut loaded
> rope, heavy bucket, binding windlass and one visibly mounted borrowed crank.
> Reserve an open centre for a 240-pixel-tall Player Character. Use original
> hand-painted illustrated neo-retro 1990s graphic-adventure language, clear
> early-afternoon Mediterranean light, warm limestone and cool blue-violet
> shadows. Avoid photorealism, pixel art, modern objects, clutter, text and UI.

## Clean-plate prompt

> Remove the friar and complete well mechanism from the composition concept,
> including their temporary shadows, and paint a complete continuation of the
> limestone courtyard, garden wall and architecture. Preserve framing,
> perspective, palette, lighting and the open walking surface. Leave no holes,
> fragments, duplicate shadows, Characters or Objects.

## Seized-well prompt

> Create one isolated seized stone well mechanism matching the clean cloister:
> worn round limestone ring, wooden posts and roof, horizontal windlass drum,
> iron axle, taut loaded hemp rope, hanging glazed bucket and exactly one
> amber-brown crank physically mounted to the right axle. Make the tension and
> trapped handle mechanically readable. Render on perfectly flat `#ff00ff`
> chroma with generous padding, early-afternoon light from upper left, no
> people, no loose second handle, no text and no watermark.

The keyed source was converted with the image-generation skill's standard soft
matte and despill helper, then trimmed and fitted to a 295×360 Runtime Asset.
The 1280×720 masters were exported as full-colour lossless PNGs; no colour
quantisation or pixel-art treatment was applied.

## Well-state extension

Ticket 07 extended the approved seized master on 2026-08-17 with the built-in
OpenAI image-generation edit flow. Both state edits used `well-seized.png` as
their edit target and a flat green key. The keyed outputs were converted with
the same soft-matte/despill helper. The generated lubricated bearing patch was
composited over the unchanged seized master; unrelated pixels from that edit
were discarded after alpha inspection. The freed state was retained as a full
aligned master. Both were cropped through the seized master's fixed
`935×1142+174+42` bounds and fitted to 295×360, preserving the Runtime Visual
Anchor. `well-freeing.png` joins those two Runtime frames without repainting.
`composition-lubricated.png` and `composition-freed.png` are the inspected
1280×720 recompositions over the clean Background with Brother Elia; the freed
composition also places the loose handle Object at its authored Ground Point.
They retain the approved scale, illumination, contact and surrounding
occlusion and are the durable full-composition approval artifacts for the two
new states.

### Lubricated-state edit prompt

> Depict the approved seized well after Michele has applied lamp oil but before
> anyone pulls the rope. Keep the bucket low, rope taut, handle mounted, drum
> position and entire mechanism unchanged. Add clearly readable fresh amber
> oil only at the right iron axle bearing: a warm golden wet sheen around the
> circular bearing, two short oil trails on the iron collar, and three small
> amber drops on the wooden upright beneath it. Preserve style, lighting,
> scale, perspective, framing and all other details. Use a perfectly flat
> `#00ff00` chroma-key background; no text or watermark.

### Freed-state edit prompt

> Depict the approved well immediately after the mechanism has been freed.
> Remove only the detachable crank handle from the right axle socket. Raise the
> turquoise bucket so it rests visibly just above the front stone rim, with the
> rope wound onto the drum and no longer taut. Keep the wooden frame, roof,
> drum, axle, iron fittings, stone well, perspective, lighting, palette,
> brushwork, framing, scale and all other details unchanged. Use a perfectly
> flat `#00ff00` chroma-key background; no extra objects, text or watermark.

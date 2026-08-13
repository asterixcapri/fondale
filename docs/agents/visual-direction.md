# Game Project visual direction

Shared visual contract for Fondale content skills. Read this file before
creating or modifying Scenes, Characters, or Objects, then inspect the target
Game Project for its concrete values and established assets.

## Project scale

- Treat the Logical Resolution as the visible world viewport and the reference
  for composition, Character size, and UI legibility.
- Give a fixed Scene a Scene Size at least as large as the Logical Resolution.
  Make a scrolling Scene wider or taller and give its Runtime Background exactly
  the Scene Size; the Engine Camera reveals the larger Scene Space.
- Use a 1:1 mapping between Runtime Asset pixels and Scene Space units unless
  the Game Project explicitly defines a different asset pipeline.
- Calibrate Background architecture, Characters, Scenery, and in-Scene Object
  Appearances as one world scale. Use the Player Character as the reference.
- Preserve an established Character-to-viewport ratio. For a new visual system,
  begin near one third of the Logical Resolution height at Perspective Scale 1;
  at `1280×720`, test a reference Character around `240 px` tall.
- Express positions, Baselines, Visual Anchors, Hotspots, Walkable Region,
  Approach Points, entrances, and passages in the same Scene Space.
- Use Perspective Scale only for depth. Do not use it to repair an asset authored
  at the wrong project-wide size.
- Calibrate HUD, text, cursors, and Inventory Appearances against the Logical
  Resolution as a separate UI scale; do not apply Scene perspective to them.
- When Logical Resolution changes, inventory every world and UI asset and every
  authored coordinate before treating existing content as compatible. Prefer
  deliberate redrawing and reauthoring over blind mechanical scaling.

The scale is coherent when a reference Character, representative Scenery, an
in-Scene Object, and the HUD can be shown together at actual play size with
intentional proportions.

## Illustrated neo-retro language

Use the visual grammar of hand-painted 1990s graphic adventures as historical
inspiration through an original contemporary design. Create richness through
deliberate simplification rather than simulated hardware limits.

- Stage Scenes theatrically with large silhouettes, selective detail, and
  slightly exaggerated perspective where it improves storytelling.
- Use chunky hand-shaped masses, subtly irregular contours, grouped light and
  shadow, selective brush texture, and controlled edge softness.
- Keep distant forms broader and softer; reserve crisp small accents for focal
  subjects and interactive areas.
- Preserve readable medium-scale shapes at actual play size.
- Use crisp painted edges and controlled anti-aliasing. Treat pixel-sized
  accents as optional detail rather than the rendering method.
- Keep pervasive dithering, enlarged square pixels, staircase diagonals, noisy
  palette reduction, and uniformly hard edges out of the default treatment.

## Colour compression

- Author full RGB or RGBA assets without a technical colour-count limit.
- Build a guide palette from 8–12 dominant hue families with roughly 5–8 tonal
  roles each: about 64–96 intentional guide colours before blends and edge
  colours. Treat this as art direction, not image quantization.
- Use coloured shadows, restrained highlights, repeated accents, and saturation
  hierarchy to organise attention.
- Reserve smooth gradients for atmospheric transitions such as sky, haze,
  water, and light bloom.
- Preserve gradients, transparency, and anti-aliasing through export. Apply
  quantization only when the user explicitly requests it and approves a visual
  comparison.

## Cross-asset consistency

- Choose one dominant light story and one subordinate accent for each Scene.
- Match hue, value, saturation, texture scale, edge treatment, and light
  direction across Background, Character, Scenery, and Object assets.
- Keep every Appearance and Animation frame aligned to a stable Visual Anchor.
- Compare assets in composition at actual play size; isolated asset quality is
  insufficient when scale, lighting, or contact fails in the world.
- Preserve Art Masters as lossless sources and derive fitted Runtime Assets
  without overwriting them.

## Acceptance

Accept a visual package only when:

- the world scale is coherent around the reference Character;
- the location and important silhouettes read immediately;
- the colour world is controlled without visible quantization;
- interactive content attracts attention without looking like UI;
- separated assets share perspective, illumination, and material treatment;
- the result feels hand-authored and recognisably original.

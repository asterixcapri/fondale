# Illustrated neo-retro art direction

Use the visual grammar of hand-painted 1990s graphic adventures as historical
inspiration, expressed through an original contemporary design rather than an
imitation of a particular game or artist.

## Core principle: painterly compression

Create richness through deliberate simplification. Preserve modern canvas size,
alpha, and colour depth while compressing shapes, values, colour relationships,
and detail into a strongly authored image. The result should feel remembered
from a classic adventure, not technically constrained by one.

## Composition

- Stage the Scene like theatre: one dominant read, strong diagonals or framed
  depth, and slightly exaggerated architecture where it improves storytelling.
- Build large, distinct silhouettes before surface detail.
- Keep one broad, continuous traversable ground shape legible at gameplay size.
- Cluster blocking props at the outer edge of the walking surface so visual
  richness does not become navigation complexity.
- Use foreground framing and depth layers sparingly to create intimacy and
  occlusion opportunities without obscuring navigation.
- Concentrate contrast and detail around narrative and interactive focal areas.
- Leave quieter regions for walking Characters, dialogue, and HUD overlap.

## Shape and surface

- Use chunky, hand-shaped masses with subtly irregular contours.
- Model forms with grouped light and shadow rather than smooth photorealistic
  shading.
- Use selective brush texture, broken edges, and simplified material marks.
- Keep distant forms broader and softer; reserve crisp small accents for the
  focal plane.
- Let straight architecture carry a controlled wobble or forced perspective
  while keeping doors, paths, and interaction geometry believable.

## Colour compression

- Author each Scene in full RGB or RGBA without a technical colour-count limit.
  Preserve gradients, transparency, and anti-aliasing in the final assets.
- Build a guide palette from 8–12 dominant hue families with roughly 5–8 tonal
  roles each: about 64–96 intentional guide colours before blends and edge
  colours. Treat this range as art direction, not image quantization.
- Prefer colour relationships over a literal indexed palette. Let the actual
  file contain as many colours as smooth painting and compositing require.
- Use coloured shadows and restrained highlights. Shift hue across depth instead
  of shading every material toward neutral black and white.
- Repeat accent colours intentionally to guide the eye.
- Reserve smooth gradients for sky, haze, water, light bloom, or other genuinely
  atmospheric transitions.
- Keep saturation hierarchical: one or two accents may be vivid while most of
  the Scene remains harmonised.
- Preserve the authored full-colour image through export. Apply quantization or
  indexed conversion only when the user explicitly requests it and approves a
  visual comparison.

## Resolution and edges

- Work at the Game Project's final Scene Size or a clean integer multiple used
  by its asset pipeline.
- Preserve readable medium-scale shapes when the Scene is shown at Logical
  Resolution.
- Use crisp painted edges and controlled anti-aliasing. Pixel-sized accents may
  appear where useful, but they should not determine the whole rendering method.
- Avoid simulated VGA defects as a default treatment: pervasive dithering,
  enlarged square pixels, staircase diagonals, noisy palette reduction, and
  uniformly hard edges.

## Lighting and depth

- Select one dominant light story and one subordinate accent.
- Separate depth planes through value, temperature, saturation, overlap, and
  edge control before adding detail.
- Ensure Characters remain readable against every reachable depth band.
- Paint contact shadows and occlusion cues consistently across Background and
  separated Scenery.

## Acceptance check

Approve the composition only when all answers are yes:

- Does the location read immediately at actual play size?
- Can the walkable ground and exits be understood without an overlay?
- Are central floor obstacles absent unless they carry confirmed gameplay?
- Do interactive focal areas attract attention without looking like UI?
- Does the image feel hand-authored rather than filtered or procedurally noisy?
- Is the colour world controlled but richer than a literal VGA palette?
- Does the guide palette organise the image without visibly quantizing it?
- Would a Character remain legible at the nearest and farthest valid scales?
- Is the work recognisably original rather than a close imitation?

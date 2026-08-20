# Capri 1535 visual direction

A record of the choices made for this Example, kept so that anything added to it
later still looks drawn by the same hand. It is not a contract for anything
outside `examples/capri-1535/`: no skill reads it, and it ships in no package.

A Fondale game settles its own look in its own `docs/game/world.md`, written by
the `setup-game` interview and quoted into every generation from there — see
[building a game](../../../docs/public/building-a-game.md). Scale is settled
there too, as a measured anchor rather than a rule: this document says nothing
about how large anything is.

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

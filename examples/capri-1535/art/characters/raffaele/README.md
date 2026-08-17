# Raffaele art package

Raffaele is the visual reference Character for the Capri 1535 Game Project.

## Stable construction

- approximately 62 years old, tall, lean, and work-strong;
- aquiline nose, heavy eyebrows, short grey beard, wind-tossed grey hair;
- muted brick-red knitted cap and waist sash;
- ivory rolled-sleeve linen shirt, short dark-brown wool waistcoat;
- faded deep-petrol knee breeches and worn brown leather shoes;
- bare lower legs, without stockings;
- canonical side Art Masters and Runtime strips face right and must remain
  credible when the Engine mirrors them for a left Facing;
- no side-specific tools, emblems, fastenings, or accessories.

## Runtime construction

Runtime frames are 288 pixels high at Perspective Scale 1. Their shared Visual
Anchor is the bottom-centre Ground Point. Every Animation frame uses the same
cell dimensions and anchor so that changing performance does not move the
Character in Scene Space.

The `working` Appearance is stationary and owns one looping `idle` Animation,
which every Facing references and which Speaking falls back to. Raffaele has no
Walking Animation Role because no current Motion moves him.

## Retained files

The shipped Runtime Asset is the single `96×288`
`src/characters/raffaele/idle.png` approved before this package was assembled;
nothing here supersedes it, and the prologue verified in ticket 11 presents
that image alone.

- `idle.png` and `static-imagegen-art-master.png` with `idle.prompt.md` and
  `static-imagegen.prompt.md`: the two full-size static Art Masters generated
  for Raffaele, kept as the construction record of the stable portrayal above.
- `idle-strip.png`, `idle-strip-alpha.png`, `speaking-strip.png` and
  `speaking-strip-alpha.png`: the animated strip masters explored for a moving
  Raffaele. They are the only record of that exploration and no Runtime Asset
  derives from them.
- `construction-draft.png`: the construction reference for the portrayal.
- `engine-scale-check.png`: the actual-size Engine diagnostic named by
  `scale.md`.

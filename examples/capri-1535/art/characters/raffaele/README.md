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

The `working` Appearance is stationary and owns explicit looping `idle` and
`speaking` Animations. Raffaele has no Walking Animation Role because no current
Motion moves him.

The Engine presents the canonical right-facing `side` Runtime strip unmirrored
for `right` and mirrors it for `left`. Runtime export applies no compensating
horizontal flip.

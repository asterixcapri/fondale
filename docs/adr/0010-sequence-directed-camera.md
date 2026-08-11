---
status: accepted
---

# Sequence-directed Camera remains derived presentation

A Sequence may temporarily replace the Player-following Camera from ADR-0009
with an authored cut, logical-time move, hold, or subject follow inside its
current Scene. The direction and Sequence progress are canonical, but Camera
position remains derived, bounded presentation: it is not saved independently,
does not expose renderer objects, and automatically returns to the Player
Character when the Sequence ends or is skipped.

The Camera capability owns direction validation, focus precedence,
logical-time interpolation, Player following, and Scene clamping. Sequence
supplies the shared Direction Step timing, CoreSession supplies narrow current
Scene and subject facts, and the browser adapter only applies the resulting
origin to its viewport.

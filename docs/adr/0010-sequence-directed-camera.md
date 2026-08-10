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

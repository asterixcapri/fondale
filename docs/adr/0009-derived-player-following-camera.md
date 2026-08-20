---
status: accepted
---

# Derived Player-following Camera over independent Scene Size

Fondale separates the Logical Resolution viewport from each Scene's complete
Scene Size and derives a transient Camera from the visible Player Character.
One translated PixiJS world contains Background, Scenery, Objects and
Characters, while the Engine-owned HUD remains fixed in the viewport and
pointer input is projected back into Scene Space. This supersedes the
fixed-size rendering assumption of the earlier command interface, while preserving
ADR-0004's internal renderer boundary; persisting Camera position or exposing
renderer coordinates would couple presentation timing to canonical Game State.

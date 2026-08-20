# 07 — `define-object`

**What to build:** the third fabrication skill, generated from the shared source
established in 06, with the parts specific to an Object on top.

An Object has no absolute size: it exists in proportion to the Character who
carries it and the Scene it sits in, so its target is derived from its declared
size in world units like everything else — a lantern must not end up the size of
a door. Its Inventory Appearance is a separate matter: it belongs to the UI scale
against the Logical Resolution, is unaffected by Perspective Scale, and is judged
for legibility in the bag rather than for consistency with the world artwork.

Replaces the existing `define-object`.

**Blocked by:** 06

**Status:** ready-for-agent

- [ ] The in-Scene target is computed from the world contract in the same world unit as every other asset
- [ ] Approval shows the Object beside the Character who will carry it, at play size
- [ ] The Inventory Appearance is treated on the UI scale, not the world scale
- [ ] The skill is generated from the shared source with no hand-written duplication of the cycle
- [ ] The skill carries no art direction and no reference to any document outside its own directory

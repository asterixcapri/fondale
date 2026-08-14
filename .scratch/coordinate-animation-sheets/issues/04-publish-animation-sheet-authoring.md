# 04 — Publish Animation Sheet authoring

**What to build:** Make the coordinate-based Animation Sheet contract the only
documented and verified authoring path. An Author can learn how to define
static, regular-grid, explicitly positioned, directional, Object, and Scenery
Animations without encountering obsolete strips, separate-image examples, or
vendor-specific atlas claims.

**Blocked by:** 02 — Prove multi-row Animation Sheet playback; 03 — Diagnose invalid Animation Sheets.

**Status:** ready-for-agent

- [ ] Public concepts, reference material, authoring guidance, and recipes describe `AnimationSheet`, `AnimationFrame`, `AnimationTiming`, `sheet`, `sheets`, and `uniformGrid` consistently.
- [ ] Documentation explains one-frame sheets, row-major grids, optional origins and gaps, incomplete final rows, and explicit rectangle ordering.
- [ ] Character guidance preserves four authored Facing sheets with equal frame counts and one shared timing value.
- [ ] Object and Scenery guidance uses the same Animation Sheet concept without introducing Facing.
- [ ] Migration guidance identifies the change as an intentional alpha break and explains how former strips and image lists become Runtime Asset sheets.
- [ ] Documentation distinguishes provider-neutral sheet coordinates from AutoSprite or another vendor's raw JSON metadata.
- [ ] The sprite-sheet research points readers to the accepted ADR without retaining a contradictory implementation recommendation.
- [ ] Public export and recipe verification reject old strip types, image-list Animation sources, former Character frame containers, and flat timing authoring.
- [ ] The full package build and browser verification pass with only the accepted contract represented in first-party code and documentation.
- [ ] No AutoSprite adapter, generic packed-atlas promise, asset generator, or production Michele artwork is introduced by this ticket.

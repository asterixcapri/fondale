# 06 — `define-scene` and the single source of the fabrication cycle

**What to build:** the skill that produces a playable Scene — and the point at
which the shared fabrication cycle stops being written twice.

The Scene half: a Scene an author can walk across, with the Walkable Region and
the Perspective Scale derived from the world contract so Characters are the right
size at every depth, geometry measured on a 1:1 plan rather than a preview, and
Scenery separated from the Background. A Scene must be navigable rather than
decorative: one broad connected walking surface, obstacles on its boundary, no
route that takes an absurd path. Placeholder Backgrounds at exactly the validated
Scene Size come first, so the Scene is walkable long before it is beautiful and
substituting finished artwork changes no authored coordinate.

The shared half: anchor, generate, normalise, recompose, approve, register is now
demonstrably identical between this skill and `define-character`, and `npx skills`
installs the directories separately, so the cycle moves into one source in this
repository from which the visual SKILL.md files are generated.

Replaces the existing `define-scene`.

**Blocked by:** 05

**Status:** ready-for-agent

- [ ] Walkable Region and Perspective Scale are derived from the world contract and the reference silhouettes
- [ ] Scene geometry is measured at 1:1, never on a resized preview
- [ ] A placeholder Background at the exact Scene Size is produced before finished artwork
- [ ] Replacing a placeholder with finished artwork requires no coordinate change
- [ ] The fabrication cycle exists in exactly one source; the visual SKILL.md files are generated from it
- [ ] A hand edit to a generated SKILL.md fails the build rather than drifting silently
- [ ] The skill carries no art direction and no reference to any document outside its own directory

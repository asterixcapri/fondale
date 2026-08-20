# 05 — `define-character`

**What to build:** the first fabrication skill, and the one that establishes the
anchor everything else is measured against. An author invokes it — or an agent
implementing a ticket does — and gets a production-ready Character whose height
is the height the game decided.

It reads the world contract and the register, derives the pixel target from the
Character's declared size in world units, generates with `imagegen` passing the
real image files of existing assets as visual references rather than describing
them in words, normalises the result to the target, and offers it for approval as
a recomposition at actual play size beside an existing Character and inside its
Scene — not as an isolated image. The measured height goes into the register.

For the very first asset in an empty game, the reference is a neutral silhouette
derived from the declared numbers.

Replaces the existing `define-character`, which is a source to quarry rather than
a base to patch.

**Blocked by:** 01, 04

**Status:** ready-for-agent

- [ ] The pixel target is computed from the world contract, never chosen by the skill
- [ ] Generation receives existing artwork as image references
- [ ] The first asset in an empty game works from a derived neutral reference
- [ ] Every Facing and Animation frame ends at one consistent height
- [ ] Approval happens on a play-size recomposition
- [ ] The measured height is written to the register by the script, never by hand
- [ ] The skill stops and names `setup-game` when the world contract is missing
- [ ] The skill carries no art direction and no reference to any document outside its own directory

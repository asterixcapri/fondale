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

**Status:** ready-for-human

- [x] The pixel target is computed from the world contract, never chosen by the skill
- [x] Generation receives existing artwork as image references
- [x] The first asset in an empty game works from a derived neutral reference
- [x] Every Facing and Animation frame ends at one consistent height
- [x] Approval happens on a play-size recomposition
- [x] The measured height is written to the register by the script, never by hand
- [x] The skill stops and names `setup-game` when the world contract is missing
- [x] The skill carries no art direction and no reference to any document outside its own directory

## Comments

Rebuilt as `skills/define-character/SKILL.md`, a ten-step skill that reuses
ticket 02's `## Documents` header contract and stops at `/setup-game` when
`docs/game/world.md` is missing or the Character has no row in
`docs/game/assets.md`. The old skill's text was quarried, not patched: its
AutoSprite delegation, its `references/`, its `agents/openai.yaml` and its
`scripts/audit-walk-strip.py` are gone, the last of them carrying a tracked
`__pycache__` with it. The new pipeline skills ship a SKILL.md and nothing else.

**The fabrication cycle is steps 3 to 8** — Anchor, Generate, Normalise,
Recompose, Approve, Register — each named for its word in the cycle and written
about an asset rather than about a Character, so ticket 06 can lift the six as
they stand. Steps 1, 2, 9 and 10 are the Character's own: the world contract and
the Engine's Character contract, the brief, the `CharacterDefinition`, and
walking it in the Engine.

**The target height is one multiplication** — declared size times pixels per
world unit — and it is the same number for every Facing and every frame, which
is what makes the height consistent. Poses that shorten the figure are refused
at generation rather than stretched at normalisation.

**One cell per Appearance, derived from the measurements.** The anchor column is
the largest `Visual Anchor x` the script reported; each image is spliced left by
that column minus its own, then extended south-west into a cell as tall as the
target. Every figure then meets the ground at the same column and on the bottom
row, so the Appearance's Visual Anchor is `{ x: anchor column, y: cell height
minus one }` and turning cannot shift the Character. The frames of one Animation
and Facing are `+append`ed into the sheet the definition reads with
`uniformGrid`. Every `magick` and normaliser command in the skill was executed
against synthetic figures before being written down.

**Approval is a composite, not a gallery.** The Scene's Background at the
Logical Resolution with the new Character at its Ground Point and the nearest
Character already made at its own, resized by the Perspective Scale each Ground
Point carries.

**The skill carries its own copy of the normaliser**, because `npx skills`
installs one directory and nothing else, and `tools/verify-carried-skill-scripts.mjs`
fails the build when a carried copy stops being byte-identical to
`skills/shared/scripts/`. That is the script half of what 06 will generate; the
prose half — the three SKILL.md files from one source — is 06's and is not
attempted here.

**Not solved, recorded.** The register row names the Runtime Asset in its `File`
column but its `Measured width` and `Visual Anchor x` describe the figure the
script measured, not the cell it is padded into; the script cannot measure a
padded image without cropping the padding away. The skill says so where it
matters rather than leaving the two to disagree silently.

Verified in the worktree with `npm ci`, `npx skills experimental_install`,
`npm run build` (green, including the new `verify:carried-skill-scripts`) and
`npm run verify` (351 Playwright tests passed; one run showed a flake in
`test/dialogue-server-url-browser.spec.ts` that passed alone and on a re-run of
the whole suite). The acceptance criteria were checked by reading the finished
skill against each one and by executing every command it hands out; exercising
it against a real game is ticket 09.

`/code-review` was run on both axes and its findings applied: the skill now
names the normaliser by a path inside its own installed directory rather than a
bare relative one, assembles frames into the sheets the Engine's contract wants,
explains the register-versus-cell measurement, and `AGENTS.md` no longer claims
that `define-character` shares `docs/agents/visual-direction.md`.

`npx skills experimental_install` rewrites the `computedHash` of every skill in
the lock file with the current CLI; only the `define-character` entry is
committed here.

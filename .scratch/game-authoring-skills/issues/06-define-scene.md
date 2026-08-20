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

**Status:** ready-for-human

- [x] Walkable Region and Perspective Scale are derived from the world contract and the reference silhouettes
- [x] Scene geometry is measured at 1:1, never on a resized preview
- [x] A placeholder Background at the exact Scene Size is produced before finished artwork
- [x] Replacing a placeholder with finished artwork requires no coordinate change
- [x] The fabrication cycle exists in exactly one source; the visual SKILL.md files are generated from it
- [x] A hand edit to a generated SKILL.md fails the build rather than drifting silently
- [x] The skill carries no art direction and no reference to any document outside its own directory

## Comments

Rebuilt as `skills/define-scene/SKILL.md`, an eleven-step skill on the ticket 02
`## Documents` header contract, and the old directory is gone with it: its
`references/scene-package.md`, its `agents/openai.yaml` and every mention of
`docs/agents/visual-direction.md`. Like `define-character`, it now ships a
SKILL.md and its own copy of the normaliser and nothing else.

**Navigable before beautiful.** Steps 3 and 4 measure the stage on a 1:1 plan,
draw placeholders *at the paths the finished Runtime Assets will occupy* — the
Background at exactly the Scene Size, one flat block per Scenery Appearance at
its planned size — and author the whole `SceneDefinition` against them. The
fabrication cycle then overwrites image files, so step 11 can state the check
plainly: `git diff` on the definition shows nothing.

**The silhouettes come first.** Perspective Scale stops and the horizon come out
of `world.md`; the scale anchor's *measured* height in `assets.md`, times the
scale of each depth band, gives the silhouette the Scene is drawn around. The
Walkable Region is then one broad polygon whose channels are wider than the
widest silhouette and whose boundary is inset from solid forms by half of it.

**The fabrication cycle now has one source.** `skills/shared/fabrication-cycle.md`
holds Anchor, Generate, Normalise, Recompose, Approve and Register written about
an asset; each skill contributes `skills/shared/sources/<skill>.md` (its own
prose, with `{{ fabrication-cycle }}` where the six steps go) and
`<skill>.values.md` (one `## key` section per placeholder). Steps are numbered by
the generator, so `define-character` keeps its cycle at 3–8 and `define-scene`
gets 5–10 from the same text, and the cycle names its own steps rather than
numbering them. A placeholder with no value, and a value nothing uses, are both
errors. Substituted paragraphs are rewrapped to 80 columns; tables, fenced
commands and lists are left alone.

`npm run generate:skill-documents` writes the SKILL.md files;
`npm run build` runs `verify:generated-skill-documents`, which fails when one of
them is not what its source generates. Proved by appending a line to
`skills/define-scene/SKILL.md` and watching the check name the file.
`define-object` is still hand-written and ungenerated: ticket 07 adds its two
source documents to the same directory, which is the last hand-written copy of
the cycle.

**`define-character` is regenerated, not rewritten.** Its steps 1, 2, 9 and 10
are its source document verbatim; the six shared steps read the same as before
apart from the generalisations the shared text forced. Two deliberate changes:
its neutral first reference is now normalised to the `Anchor pixel height`
`world.md` records rather than to "the target", which is the same number when the
Character is the anchor and the right one when it is not; and Recompose's finish
condition became "every asset in it meets the ground where it stands", which
covers a Scene's Scenery as well as two figures.

**Executed before written down.** Every `magick` and normaliser command the skill
hands out was run against synthetic images: the placeholder Background and the
Scenery block, the geometry overlay, the Scenery normalise-and-splice, and the
Background register call, which reports `720 / 1280 / 640` for a 1280 × 720 plate
and rewrites the row while preserving the declared size.

`/code-review` was run on both axes and its findings applied. The register's
`File` column is written relative to the register itself, so the skill and
`skills/shared/README.md` now say to resolve it from `docs/game/` — the README's
example row was wrong about this and is corrected. Scenery is not scaled by the
Engine, so a Scenery target multiplies by the Perspective Scale at its Baseline
rather than standing at Perspective Scale 1. Register names its `--input`,
`--output` and `--asset` per skill instead of implying them. The Engine pointers
now name `authoring/scenery.md` and `recipes/world.ts`, which exist, rather than
`recipes/first-scene.ts`, which does not. The `Missing input` row names all four
documents the skill reads. The generated-file marker names no path, because an
installed skill is one directory and a pointer at a file the reader cannot open
is worse than none. `numberSteps` and `parseValues` now skip fenced blocks.

Verified in the worktree with `npm ci`, `npx skills experimental_install`,
`npm run build` (green, including the new `verify:generated-skill-documents`) and
`npm run verify` (351 Playwright tests passed). The acceptance criteria were
checked by reading the finished skill against each one and by executing the
commands it hands out; exercising it against a real game is ticket 09.

`npx skills experimental_install` rewrites the `computedHash` of every skill in
the lock file; only the `define-scene` and `define-character` entries are
committed here.

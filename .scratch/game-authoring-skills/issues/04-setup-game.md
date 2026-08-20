# 04 — `setup-game`

**What to build:** the skill that settles how large the author's world is and
what it looks like, so that every asset made afterwards is generated at a size
somebody decided rather than one a generator improvised.

It interviews the author for a scale anchor — which asset it is, how many world
units it stands for, how many pixels it measures at Perspective Scale 1 — plus
the Logical Resolution, the visual direction of their game and the HUD theme. It
proposes defaults and accepts being overruled. What the world unit means is the
author's business; the skill only records it.

It then initialises the asset register from the story and the puzzles as a list
of what must be made, initialises the progress document, and writes a delimited
section into the game's own AGENTS.md so that any agent working in that
repository afterwards knows where the Engine's guides are, where the game's
documents are, that a vertical slice is one playable puzzle, that Runtime Assets
are made by invoking the fabrication skills and never by hand, and that the first
visual asset is the Player Character.

**Blocked by:** 01

**Status:** ready-for-human

- [x] The interview yields a scale anchor and a pixels-per-world-unit factor from which any asset's target is arithmetic
- [x] A game with no visible Player Character can still name an anchor
- [x] Defaults are proposed and can be overridden
- [x] Re-running the skill leaves existing AGENTS.md content untouched
- [x] The AGENTS.md section points at the Engine documentation in the installed package, not at a copy
- [x] The asset register is initialised with declared sizes for assets not yet made
- [x] The skill contains no visual style of its own
- [x] The skill ends by naming the next command to run

## Comments

Implemented as `skills/setup-game/SKILL.md`, a model-invoked skill installed
from `./skills` and registered in `skills-lock.json`. It reuses ticket 02's
`## Documents` header contract verbatim, and its missing-input row names
`/define-story` or `/define-puzzles` without ever invoking them.

**The scale is one division.** The interview settles a world unit, an anchor
asset, its declared size in that unit and its pixel height at Perspective Scale
1; step 3 divides the two into a pixels-per-world-unit factor, and every other
asset's target is that factor times its declared size. The anchor is proposed as
the Player Character but is explicitly any asset the game will actually make, so
a game with nothing walking about still has one.

**`world.md` carries four sections.** Scale, Stage (view, horizon, Perspective
Scale at the near and far edges of the Walkable Region — what ticket 06 derives
its geometry from), Visual direction in the author's own words, and the UI scale
with the HUD Theme. The Inventory Appearance Size sits under UI scale rather
than under HUD Theme because it is a Game Project field, not a `HUDTheme` one.

**The register is initialised with declared sizes only.** One row per Character,
Object and Scene Background, in the format `skills/shared/README.md` fixes, with
every measured cell an em dash: those are the normaliser's to write. A Scene
Background's declared size is its Scene Size in pixels, because a Background is
authored at exactly the size the Engine validates and is never normalised.

**The AGENTS.md section is delimited** by `<!-- BEGIN fondale -->` and
`<!-- END fondale -->`, and the step's completion criterion is that
`git diff AGENTS.md` shows no change outside it, so a re-run cannot touch the
author's own instructions. It points at
`node_modules/@asterixcapri/fondale/docs/public/`, the installed package, never
a copy.

No automatable seam exists for a Markdown skill, so no test was written; the
spec places the only seam in ticket 01's script. Verified with `npm ci`,
`npx skills experimental_install`, `npm run build` (green, 8/8 normaliser tests)
and `npm run verify` (351 Playwright tests passed). The acceptance criteria were
checked by reading the finished skill against each one; executing the pipeline
against a real game is ticket 09.

`/code-review` was run on both axes and its findings applied: two completion
criteria that could never be satisfied were rewritten, the declared size regained
its unit, a row-key convention invented for the downstream skills was dropped,
the horizon joined the stage, the register now derives from the puzzles too,
`HUD Theme` and `Inventory Appearance Size` took their `CONTEXT.md` casing, and
the example values were replaced with neutral ones so that no Capri 1535 name or
colour ships inside a portable skill.

`npx skills experimental_install` rewrites the `computedHash` of every skill in
the lock file with the current CLI; only the new `setup-game` entry is committed
here.

# 03 — `define-puzzles`

**What to build:** the skill that turns a story into a game — the obstacles that
stop the Player reaching the end immediately. Each puzzle is recorded as what it
needs, what the Player does, and what changes, so its dependencies are visible
and `/to-tickets` can read the build order straight out of it.

It must support puzzles solvable in any order that converge on a single gate,
which is what lets a short adventure be non-linear without becoming
unmanageable. When a puzzle needs an Object, a Character or a place the story
does not have, the skill adds it to the story document rather than inventing it
silently.

**Blocked by:** 02

**Status:** ready-for-human

- [x] Every puzzle is recorded in the "what it needs / what you do / what changes" form
- [x] Parallel branches converging on a gate are expressible
- [x] A puzzle requiring something absent from the story updates the story document
- [x] The skill refuses to run and names `define-story` when the story document is missing
- [x] The interview covers fair play: the information needed to solve a puzzle is available before it is needed
- [x] The document states which documents it derives from
- [x] The skill ends by naming the next command to run

## Comments

Implemented as `skills/define-puzzles/SKILL.md`, a model-invoked skill installed
from `./skills` and registered in `skills-lock.json`. It reuses ticket 02's
header contract: the `## Documents` table under the title, with `Reads`
(`docs/game/story.md`), `Writes` (`docs/game/puzzles.md`, plus rows appended to
the story), `Missing input` — stop, write nothing, and tell the author to run
`/define-story`, leaving that skill for the author to invoke — and
`Next command` (`/setup-game`).

The puzzle document is one row per puzzle with the columns
`Key | Place | Needs | What the Player does | What changes | Where the Player
learns it`. Convergence is expressible because the gate is an ordinary puzzle
row whose `Needs` names one change from each strand; a `Strands` table names
which puzzles belong to a strand and what it hands the gate. Order is recorded
in the `Needs` cells and nowhere else, so `/to-tickets` has one source for the
build order and the document cannot contradict itself.

Fair play is carried twice: as a grilling topic in the interview, and as step 6,
which names the source of every `Needs` entry and confirms every entry of
`Where the Player learns it` comes earlier than the puzzle it belongs to. That
step stops at fair play; the dead-end verifier stays out of scope.

A puzzle needing something the story lacks sends the agent back to
`docs/game/story.md` to add the row with the author's agreement (step 4), and
the same keys are listed in the puzzle document under `Added to the story`, so
the back-edge between the two documents is visible from either side.

No automatable seam exists for a Markdown skill, so no test was written; the
spec's testing decisions place the only seam in ticket 01's script. Verified
with `npm ci`, `npx skills experimental_install`, `npm run build` and
`npm run verify` (351 Playwright tests passed). Acceptance criteria were checked
by reading the finished skill against each one; executing the pipeline end to
end is ticket 09.

`/code-review` was run on both axes and its findings applied: what a puzzle
changes is now anchored to the Engine's `Game Variable` where the Engine does
not already carry the proposition, the key rules are pointed at rather than
restated from `define-story`, the invented "a dozen puzzles" budget is gone,
`Where the Player learns it` carries one entry per need instead of one per
puzzle, the gate's own row and the single source of ordering are stated, and the
`Added to the story` section was added. Remaining known friction, left alone
deliberately: the three sentences of pipeline boilerplate shared verbatim with
`define-story`, because `npx skills` installs one directory at a time and a
cross-reference is not available.

`npx skills add ./skills --skill define-puzzles` is what registers the skill;
`npx skills experimental_install` only restores what the lock file already
names. Only the new `define-puzzles` entry is committed here.

# 02 — `define-story`

**What to build:** the skill an author invokes first, in an empty repository, when
all they have is an idea. It interviews them and leaves a written story document
naming every place and how places connect, every Character, every Object, and
every Narrative Fact — with the names that will later become Game Project
registry keys, so nothing has to be renamed afterwards.

The document is written for the next skill to extract values from and for a human
to read: stable keys and lists, not prose.

This ticket also establishes the header contract every other skill in the
pipeline reuses: which documents the skill consumes, which it produces, what it
does when an input is missing, and the exact command to type next.

**Blocked by:** None — can start immediately.

**Status:** ready-for-human

- [x] Invoking the skill in a repository with no documents conducts an interview and leaves the story document
- [x] Every place, Character, Object and Narrative Fact carries a name usable as a registry key
- [x] The document states which documents it derives from
- [x] The skill contains no reference to any particular game's setting or style
- [x] The skill ends by naming the next command to run
- [x] The skill runs `grilling` for the interview rather than improvising its own

## Comments

Implemented as `skills/define-story/SKILL.md`, a model-invoked skill installed
from `./skills` and registered in `skills-lock.json`.

The header contract the rest of the pipeline reuses is the `## Documents` table
directly under the title: one row each for what the skill reads, what it writes,
what it does when an input is missing, and the exact next command. `define-story`
reads nothing, so its missing-input row records that there is nothing to miss and
that an existing `docs/game/story.md` is revised in place; a downstream skill
fills the same row with the skill it names and stops for. Because `npx skills`
installs one directory at a time, each skill restates the table rather than
linking to this one.

The document shape is a literal Markdown template with a `Derives from` line,
tables keyed by registry key, and a `Setting and tone` section holding the
author's own words, so the skill carries no setting or style of its own.

No automatable seam exists for a Markdown skill, so no test was written; the
spec's testing decisions place the only seam in ticket 01's script. Verified with
`npm ci`, `npx skills experimental_install`, `npm run build` and `npm run verify`
(351 Playwright tests passed). Acceptance criteria were checked by reading the
finished skill against each one; executing the pipeline end to end is ticket 09.

`/code-review` was run on both axes and its findings applied: the interview rules
`grilling` already owns were cut, the next command now has one source of truth,
each list is tied to the registry it becomes, one-way passage got a marked form
instead of free text, the template's example rows are labelled as examples, and
the branch where the Fondale package is not installed yet is answered.

`npx skills experimental_install` rewrites the `computedHash` of every skill in
the lock file with the current CLI; only the new `define-story` entry is
committed here.

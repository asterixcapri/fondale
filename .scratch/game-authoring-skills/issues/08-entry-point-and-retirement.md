# 08 — Entry point, prerequisites, and retiring what the pipeline replaces

**What to build:** what a stranger reads first. Someone who has installed
Fondale and wants to build a game should find, in one place, the order of the
pipeline, the exact command for each step, what each step leaves behind, and what
must be installed for any of it to work — `grilling`, `to-tickets`, `implement`,
and ImageMagick. It should also say honestly how long a short adventure takes, so
that nobody abandons the process at the third ticket expecting a demo in an
afternoon.

And it removes what the pipeline supersedes. `define-dialogue` goes: dialogue in
Fondale is declarative data with a documented contract and a complete worked
example, so an agent authors it from the guide like a Sequence or a Command Case.
The shared visual direction document stops being a contract cited by skills and
becomes what it always was, a record of Capri 1535's own choices.

**Blocked by:** 03, 07

**Status:** ready-for-human

- [x] A newcomer can follow the pipeline end to end from this document alone
- [x] Every prerequisite is named, including the ones outside npm
- [x] The realistic effort of building a short adventure is stated
- [x] `define-dialogue` is removed and the pipeline documents where dialogue is authored instead
- [x] No installed skill references any file outside its own directory
- [x] The Capri 1535 visual direction document survives as an example, cited by nothing that ships

## Comments

The entry point is `docs/public/building-a-game.md`, linked from `README.md` and
from the documentation index. It lives under `docs/public/` on purpose: that
directory is in `package.json`'s `files`, so the page a stranger needs ships
with the package they installed, beside the guides it sends them to.

Its pipeline table is transcribed from the six skills' `## Documents` tables
rather than written from memory — the order, the exact commands and the
"leaves behind" column all come from there, so the two cannot disagree without
one of them being edited. `AGENTS.md` now says to change this page when a
`## Documents` table changes.

**Prerequisites are the ones that are not obvious.** The Fondale package
installed in the game's own repository, an agent that runs skills, ImageMagick 7
for the normaliser, and the four skills the pipeline leans on but does not own —
`grilling` and `imagegen`, which Fondale's skills invoke, and `to-tickets` and
`implement`, which the author starts because no skill of ours may start them.
Install commands are given for all of them.

**The effort is stated in sessions, not hours**: three interviews of a session
each, ten to twenty implementation sessions at one ticket per puzzle, and an
artwork tail of a dozen Backgrounds and upward of a hundred Character frames.
Weeks of evenings, not an afternoon — with the honest consolation that the
walkable game, on placeholder Backgrounds at their exact Scene Size, arrives in
the first handful of sessions.

**`define-dialogue` is gone** — the directory, its `references/`, its
`agents/openai.yaml` and its `skills-lock.json` entry. Its three checklists were
restatements of rules `docs/public/authoring/dialogue.md` already carries, which
was checked line by line before deleting them (the six-alternative limit, "Trust
alone never opens a secret", Cover Stories, directional Relationships). The new
page has a `## Where dialogue is authored` section that sends an author to that
guide and says where the hard part is really done: `/define-story`, where
Narrative Facts and Claims are named, and `/define-puzzles`, where knowing one
becomes something the Player needs.

**`visual-direction.md` is now Capri 1535's own.** Ticket 07's note held: no
skill read it any more. It moved to `examples/capri-1535/docs/`, its generic
Project-scale rules were dropped where the skills now carry them as mechanism,
and its opening says what it is — a record of one Example's choices, binding
nothing outside that directory. `examples/` is not in `package.json`'s `files`,
so nothing that ships cites it.

**The shared snippet was in scope after all.** The "Paths are literal…" and
"The look of the game is settled…" paragraphs were written identically in all
three fabrication sources. `skills/shared/snippets/` now holds them, marked as
`{{ literal-paths }}` and `{{ settled-look }}` on a line of their own, resolved
by the same generator pass as `{{ fabrication-cycle }}` so a snippet may itself
carry a value. A snippet no source marks and a value that takes a snippet's name
are both errors, mirroring the discipline the generator already had for values.
Written test-first; the three generated `SKILL.md` files came out byte-identical,
which is the evidence the extraction changed nothing but the source.

`/code-review` was run on both axes. Applied: the prose said the pipeline
invokes `to-tickets` and `implement`, which contradicts their
`disable-model-invocation`; the `/to-tickets` row did not say it reads the story
and the puzzle documents; "world contract" was an undefined term on a public
page and is now `world.md`; and the block-marker grammar was written twice in
the generator with two different regexes, so a trailing space counted as marked
but not as filled. Considered and left: folding `fabrication-cycle` into
`snippets/` to delete the special case — the cycle is a named concept in the
spec and reads better as its own parameter; and adding `scale anchor` to
`CONTEXT.md`, which is the Engine's glossary, while the scale anchor is the
authoring pipeline's term and the Engine knows nothing of it. The page defines
it in place instead.

The first criterion is ticked on evidence of a different kind from the rest: the
page carries the whole path from an empty repository to a playable game and
agrees with every `## Documents` table, checked row by row. Whether a newcomer
actually gets to the end is what ticket 09 exists to find out, and no claim here
substitutes for it.

Acceptance criterion 5 was checked by grep rather than by a gate: every path any
`skills/*/SKILL.md` names is the host game's own, the installed package's
`docs/public/`, or `<skill>/scripts/`. A build gate asserting that would be
worth its own ticket.

Verified in the worktree with `npm ci`, `npx skills experimental_install`,
`npm run build` (documentation gate passed; 22 generator tests) and
`npm run verify` (351 Playwright tests passed). As in ticket 02,
`experimental_install` rewrites every `computedHash` in the lock file; only the
`define-dialogue` deletion is committed.

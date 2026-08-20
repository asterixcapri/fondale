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

**Status:** ready-for-agent

- [ ] Every puzzle is recorded in the "what it needs / what you do / what changes" form
- [ ] Parallel branches converging on a gate are expressible
- [ ] A puzzle requiring something absent from the story updates the story document
- [ ] The skill refuses to run and names `define-story` when the story document is missing
- [ ] The interview covers fair play: the information needed to solve a puzzle is available before it is needed
- [ ] The document states which documents it derives from
- [ ] The skill ends by naming the next command to run

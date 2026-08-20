---
status: accepted
---

# Publish under the project's own name rather than the author's

The Engine was first published under the author's own npm scope, and ADR 0020
followed it with a dialogue server under the same scope. That scope reads as one person's
shelf, which was accurate while the repository was private and the Engine had
exactly one game. It stopped being accurate the day the repository went public,
the package reached the registry, and `docs/public/building-a-game.md` began
addressing a stranger who has installed nothing yet. The first line that
stranger types is the package name, and an MIT engine that wants to be used by
people other than its author should not introduce itself as somebody's
belongings.

The Engine is therefore published as **`fondale`**, unscoped, and its satellites
under the **`@fondale`** scope, beginning with `@fondale/dialogue-server`. The
two namespaces are independent on npm, so the package a game installs keeps the
short name while the family stays gathered — the arrangement `vue` and `@vue/*`,
`svelte` and `@sveltejs/*`, `astro` and `@astrojs/*` all use. Reserving the
scope now also costs nothing and cannot be done later if somebody else takes it.

This supersedes the package names in ADRs 0020, 0026 and 0027 and nothing else
about them: those decisions stand as they were argued, and are left unedited so
the record still says what was decided when.

## Considered options

**Keeping the author's scope** was the cheapest option and, for a private
engine, the right one: the product naming study of 16 August 2026 had judged it
sufficient. What changed is not the name's quality but its audience.

**`@fondale/core`** puts everything under the scope and drops the unscoped name.
It is coherent, but `core` earns its keep only in a family large enough that the
centre needs distinguishing from its parts, and it makes the common case —
installing the Engine — longer to say for no gain.

**The unscoped name alone**, with no scope reserved, was rejected because the
Dialogue Provider server already exists as a separate package (ADR 0020): the
family is real today, not hypothetical, and leaving it homeless would only defer
this decision.

## Consequences

A game installs `fondale` and imports from `fondale` and `fondale/testing`; the
documentation gate, the recipes, the Example's vendored tarball and the six
authoring skills all name it that way, and the skills' `node_modules/fondale/`
path is what they read the Engine's contract from. The first published version
under the old scope reached the registry hours before this decision and is
withdrawn within npm's 72-hour window, so no version of it survives to be
depended on.

The GitHub repository is a separate namespace and is unaffected: `npx skills add
asterixcapri/fondale` remains the way the skills are installed until, and unless,
the repository itself moves.

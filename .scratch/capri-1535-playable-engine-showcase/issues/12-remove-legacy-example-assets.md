# 12 — Remove the legacy Example and close production

**What to build:** Finish the replacement by removing every obsolete or
disconnected Capri Example artifact whose verified successor exists. The
remaining Game Project, source art, Runtime media, tests and documentation form
one minimal, auditable four-Scene production package and still pass complete
verification from the cleaned tree.

**Blocked by:** 11 — Prove the complete Fondale demo.

**Status:** resolved

- [x] Every deletion candidate is resolved against current imports, registries, tests, documentation and retained provenance.
- [x] Disconnected legacy Scenes and their unused definitions, Art Masters and Runtime media are removed.
- [x] Obsolete Objects, Sequences, Narrative Facts, Game Variables and tests belonging only to earlier routes are removed.
- [x] Superseded Runtime PNGs and old Character versions are removed only after final replacements have passed verification.
- [x] Abandoned AutoSprite, Godmode, preview, candidate, temporary composite and obsolete diagnostic outputs are removed.
- [x] Untracked experimental binaries are deleted only after confirming they are not the sole source of a retained final asset.
- [x] Every retained production Art Master and Runtime Asset has an owner or explicit documented provenance purpose.
- [x] Clean Backgrounds contain no fragments, holes or obsolete shadows from removed Scenery.
- [x] Searches find no stale import, identity, narrative claim or test expectation for removed content.
- [x] Environment configuration, credentials and unrelated user work remain outside cleanup scope.
- [x] The final inventory is materially smaller and contains no unexplained production duplicates.
- [x] The package build and full browser verification pass again after all deletions.
- [x] The handoff distinguishes Git-recoverable removals from permanently deleted untracked files.

## Comments

- 2026-08-17, during ticket 09: the obsolete `test/acceptance.spec.ts`
  (town-square route and Aiano/Boffe text presentations) and any fixture it
  owns are confirmed legacy test artifacts with no current owner; remove or
  replace them together with the ticket 11 rewrite. The unregistered
  town-square, alley, grotto, monte-solaro and tavern Scene packages remain
  deletion candidates already listed above.

- 2026-08-17, ticket 12: done. 278 files removed in one commit, all of them
  tracked, so every removal is recoverable from Git; nothing untracked was
  deleted, because the worktree held none — `tmp/imagegen/` looked like scratch
  output but was tracked from the exploration checkpoint, and its five
  intermediate composites matched no retained asset by checksum.

  Removed: the unregistered `alley`, `grotto`, `monte-solaro`, `tavern` and
  `town-square` Scene packages with their Art Masters; the unregistered `key`
  Object; the orphaned `conversation` and `brother-elia-conversation`
  Sequences; the `adventure-text` fixture and the `aiano`, `boffe`,
  `charterhouse` and `fishermen-landing` art it opened; the Michele V1 and V2
  Runtime sheets, the whole `michele-v2` Art Master package, and the
  `-godmode-preview`, `-autosprite-preview` and `-luma-preview` stagings —
  the twelve Godmode duplicates were byte-identical to the retained sheets, as
  the `michele-v3` checksum table records; the unreferenced `resolve` sheets;
  the AutoSprite, Godmode and Luma candidate directories; the superseded
  `static-v2`, `static-v3` and `static-v4` Character stagings; the `host`
  Character art of the removed tavern; the unused `capri-pixel` font and its
  build script; the pre-rebuild harbour boat and winch subjects, the alternate
  quay exploration, the obsolete blocking diagram, the raster copies of the
  geometry and scale overlays and the stale Engine screenshots.

  Nothing that owns or sources a shipped asset was touched. The `v3-workwear-`
  sheets stay because the shipped `runtime-workwear-` adapters derive from
  them, and `art/characters/brother-elia/static-v2.png` stays because the
  cloister provenance records it as the byte-for-byte source of the shipped
  friar, which its SHA-256 confirms. Narrative Facts, Claims and Game Variables
  were each traced to a live user: none belonged only to an earlier route, so
  none were removed. Every retained file now has an owner: new inventories in
  the harbour provenance and the Raffaele README, a new Brother Elia
  provenance, and a purpose recorded for the wounded-sailor diagnostic.

  Art fell from 290 MiB to 68 MiB and `src/` from 52 MiB to 33 MiB. The four
  clean Backgrounds were inspected at full size and show no fragment, hole or
  leftover shadow where removed Scenery stood.

  Verification from the cleaned tree: `npm run build` and `npm run verify` in
  `examples/capri-1535` pass — 34 of 34 browser tests — and the root
  `npm run build` gate passes. The root Engine suite reports 309 to 311 passed
  with `test/multi-row-animation-sheet-browser.spec.ts` failing intermittently
  under parallel load; that file passes on its own, and this commit changes no
  file outside `examples/` and `tmp/`, so the flake is environmental and
  pre-existing.

  Left deliberately: `docs/adr/0006-classic-command-interface.md` still
  describes the `alley ↔ townSquare ↔ harbour ↔ grotto ↔ monteSolaro` map and
  the removed `art/scenes/tavern/` and `art/scenes/monte-solaro/` masters. It
  is already marked `status: superseded by ADR-0007`, and a decision record
  states what was decided then, so it was not rewritten. The example's
  `.scratch/vertical-slice/` research archive and the game-design handoff are
  history, not production artifacts, and stayed out of scope, as did every
  environment file and credential.

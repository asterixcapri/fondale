# 12 — Remove the legacy Example and close production

**What to build:** Finish the replacement by removing every obsolete or
disconnected Capri Example artifact whose verified successor exists. The
remaining Game Project, source art, Runtime media, tests and documentation form
one minimal, auditable four-Scene production package and still pass complete
verification from the cleaned tree.

**Blocked by:** 11 — Prove the complete Fondale demo.

**Status:** ready-for-agent

- [ ] Every deletion candidate is resolved against current imports, registries, tests, documentation and retained provenance.
- [ ] Disconnected legacy Scenes and their unused definitions, Art Masters and Runtime media are removed.
- [ ] Obsolete Objects, Sequences, Narrative Facts, Game Variables and tests belonging only to earlier routes are removed.
- [ ] Superseded Runtime PNGs and old Character versions are removed only after final replacements have passed verification.
- [ ] Abandoned AutoSprite, Godmode, preview, candidate, temporary composite and obsolete diagnostic outputs are removed.
- [ ] Untracked experimental binaries are deleted only after confirming they are not the sole source of a retained final asset.
- [ ] Every retained production Art Master and Runtime Asset has an owner or explicit documented provenance purpose.
- [ ] Clean Backgrounds contain no fragments, holes or obsolete shadows from removed Scenery.
- [ ] Searches find no stale import, identity, narrative claim or test expectation for removed content.
- [ ] Environment configuration, credentials and unrelated user work remain outside cleanup scope.
- [ ] The final inventory is materially smaller and contains no unexplained production duplicates.
- [ ] The package build and full browser verification pass again after all deletions.
- [ ] The handoff distinguishes Git-recoverable removals from permanently deleted untracked files.

## Comments

- 2026-08-17, during ticket 09: the obsolete `test/acceptance.spec.ts`
  (town-square route and Aiano/Boffe text presentations) and any fixture it
  owns are confirmed legacy test artifacts with no current owner; remove or
  replace them together with the ticket 11 rewrite. The unregistered
  town-square, alley, grotto, monte-solaro and tavern Scene packages remain
  deletion candidates already listed above.

# 05 — Set a Game Variable when a Narrative Fact is learned

**What to build:** An Author declares that a Character learning a given
Narrative Fact also sets a named Game Variable. This is the bridge between
free-form dialogue and the rest of the game: an Interaction Condition reads
Game Variables and Inventory, never Character Knowledge, so today a Player who
discovers something by typing accumulates knowledge the world cannot react to.
With this, asking the right question in your own words can open a Passage,
enable a Hotspot or make a Sequence eligible — through the same mechanisms an
Author already uses.

The Engine sets the variable; generated wording never does. It is committed in
the same atomic step as the `learn-narrative-fact` Game Operation, after
Disclosure has authorised the Fact and before any verbalisation is spoken. See
the spec's implementation decisions and ADR-0013.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] An Author may declare, per Narrative Fact, a Game Variable that is set when a Character learns it.
- [ ] The variable is committed atomically with the learning: either both land or neither does.
- [ ] The variable is set only after Disclosure authorised the Fact for communication, so an undisclosed secret can never open anything.
- [ ] A turn answered with a Cover Story records Testimony and leaves the variable untouched.
- [ ] A turn that fails, is cancelled, or is abandoned by leaving the Conversation commits neither the learning nor the variable.
- [ ] The resulting variable is an ordinary Game Variable: Interaction Conditions, Hotspots, Passages, Sequences and alternative eligibility react to it with no special casing.
- [ ] Learning the same Fact again is idempotent and does not produce a second conflicting change.
- [ ] A Fact learned through an authored path — a Game Operation on an alternative or in a Sequence — sets the variable too, so the two routes stay consistent.
- [ ] Authoring diagnostics reject a declaration naming an unknown Game Variable or an unknown Narrative Fact at startup.
- [ ] Save Snapshots validate and restore the resulting state exactly, with no new snapshot shape beyond existing variables and Character Knowledge.
- [ ] Deterministic Game Session tests cover the disclosed, withheld, cover-story, failed and cancelled cases, and a condition elsewhere in the Game Project reacting afterwards.
- [ ] `CONTEXT.md`, `docs/public/reference.md` and `docs/public/game-authoring.md` describe the declaration and its guarantees.
- [ ] Standard build and browser verification pass.

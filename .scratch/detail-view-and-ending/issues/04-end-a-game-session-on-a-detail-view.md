# 04 — End a Game Session on a Detail View

**What to build:** Let a Game Project say the story is over. A Game Operation
concludes the Game Session leaving a named Detail View presented; from that
moment the HUD withdraws and no Command is answered. A Player who reopens the
browser on a finished game finds its ending rather than an exhausted world, and
starting a new game leaves it cleanly behind.

**Blocked by:** 01 — Present and examine a Detail View; 03 — Carry the presented
Detail View through save and restore.

**Status:** claimed

- [ ] A Game Operation ends the Game Session and leaves a named Detail View presented.
- [ ] After the Ending no Command is accepted and the HUD withdraws.
- [ ] The Ending carries no image of its own; what remains presented is an ordinary Detail View.
- [ ] A Game Project may author more than one Ending, closing different outcomes on different Detail Views.
- [ ] The Ending is committed Game State and is carried by both the Save Snapshot and the Continuation State.
- [ ] Restoring a concluded Game Session presents its Ending rather than the world.
- [ ] Starting a new game leaves the Ending behind with no residue.
- [ ] Core Session tests cover refusal of Commands and the round-trip; a browser test reaches an Ending, reloads, and finds it still presented with the HUD withdrawn.

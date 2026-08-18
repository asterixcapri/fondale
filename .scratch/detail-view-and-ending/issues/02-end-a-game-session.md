# 02 — End a Game Session

**What to build:** Let a Game Project say the story is over, as decided in
ADR-0025. A Game Operation concludes the Game Session leaving a Detail View
presented; from that moment the Engine accepts no further Command and the HUD
withdraws. Restoring a concluded Game Session resumes at its Ending rather than
dropping the Player back into a world with nothing left to do.

**Blocked by:** 01 — Present Detail Views.

**Status:** ready-for-agent

- [ ] A Game Operation ends the Game Session and leaves a named Detail View presented.
- [ ] After the Ending no Command is accepted, and the HUD withdraws.
- [ ] The Ending is committed Game State and is carried by the Save Snapshot and the Continuation State.
- [ ] Restoring a concluded Game Session presents its Ending, not the world.
- [ ] The Ending carries no image of its own; what stays on screen is an ordinary Detail View.
- [ ] Starting a new game leaves the Ending behind cleanly.
- [ ] A browser test reaches an Ending, reloads the browser, and finds the Ending still presented.

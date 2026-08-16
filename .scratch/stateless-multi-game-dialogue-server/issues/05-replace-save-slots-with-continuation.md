# 05 — Replace Save Slots with Continuation

**What to build:** Complete the browser persistence migration by removing the
Player-managed Save Slot experience and making Continue and New Game the only
ordinary persistence choices. Preserve Save Snapshot validation as the hidden
mechanism behind Continuation State while removing named saves, historical
loads and reset-on-restore behavior from the Player-facing flow.

**Blocked by:** 04 — Continue Game State and dialogue after reload.

**Status:** ready-for-agent

- [ ] The Engine-owned HUD no longer presents named Save Slots or manual Save and Load controls.
- [ ] The browser no longer stores or reads the global named Save Slot collection for ordinary play.
- [ ] Continue uses only the current Project Identity-specific Continuation State.
- [ ] New Game is the only ordinary action that discards current progress and starts with a new provider session identity.
- [ ] The Player cannot restore an older Game State or create parallel save histories through the ordinary browser interface.
- [ ] Save Snapshot creation, validation and restoration remain available internally to Continuation State.
- [ ] Provider memory is recovered through continuation metadata and is not copied into canonical Game State.
- [ ] Starting or continuing a game never resets provider memory as a side effect of loading a Save Snapshot.
- [ ] Existing browser preferences remain separate from Continuation State.
- [ ] Public concepts, authoring guidance, migration guidance and reference material use Continuation State, Continue and New Game consistently.
- [ ] Removed Save Slot inputs, presentation facts and documentation leave no stale public references unless explicitly retained as historical migration notes.
- [ ] Browser verification covers the absence of manual save controls and the complete Continue/New Game experience.
- [ ] Standard architecture and documentation gates pass with the new ubiquitous language.

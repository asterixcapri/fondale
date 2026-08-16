# 05 — Replace Save Slots with Continuation

**What to build:** Complete the browser persistence migration by removing the
Player-managed Save Slot experience and making Continue and New Game the only
ordinary persistence choices. Preserve Save Snapshot validation as the hidden
mechanism behind Continuation State while removing named saves, historical
loads and reset-on-restore behavior from the Player-facing flow.

**Blocked by:** 04 — Continue Game State and dialogue after reload.

**Status:** ready-for-human

- [x] The Engine-owned HUD no longer presents named Save Slots or manual Save and Load controls.
- [x] The browser no longer stores or reads the global named Save Slot collection for ordinary play.
- [x] Continue uses only the current Project Identity-specific Continuation State.
- [x] New Game is the only ordinary action that discards current progress and starts with a new provider session identity.
- [x] The Player cannot restore an older Game State or create parallel save histories through the ordinary browser interface.
- [x] Save Snapshot creation, validation and restoration remain available internally to Continuation State.
- [x] Provider memory is recovered through continuation metadata and is not copied into canonical Game State.
- [x] Starting or continuing a game never resets provider memory as a side effect of loading a Save Snapshot.
- [x] Existing browser preferences remain separate from Continuation State.
- [x] Public concepts, authoring guidance, migration guidance and reference material use Continuation State, Continue and New Game consistently.
- [x] Removed Save Slot inputs, presentation facts and documentation leave no stale public references unless explicitly retained as historical migration notes.
- [x] Browser verification covers the absence of manual save controls and the complete Continue/New Game experience.
- [x] Standard architecture and documentation gates pass with the new ubiquitous language.

## Answer

Removed the named Save Slot storage adapter, HUD presentation, Options actions
and keyboard shortcuts from ordinary browser play. Continue and New Game now
remain the only Player-facing persistence choices, while validated Save
Snapshots stay available as the canonical payload inside Continuation State
and for advanced-host restoration. Restoring a snapshot no longer resets an
injected Dialogue Provider, so provider-owned memory remains external and is
recovered through continuation identity. Browser, Example, architecture and
public documentation verification now use the Continuation State vocabulary.

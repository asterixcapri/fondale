# 04 — Continue Game State and dialogue after reload

**What to build:** Persist one automatic Continuation State per Project Identity
that pairs the latest compatible Save Snapshot with the browser-owned provider
session identity. Present Continue and New Game at startup so a Player can
reload the browser and recover both canonical Game State and the corresponding
PostgreSQL Conversation context without a destructive provider reset.

**Blocked by:** 02 — Execute dialogue without resident session Providers; 03 — Make Dialogue Turns idempotent and cancellable.

**Status:** ready-for-human

- [x] A new Game Session creates one cryptographically random provider session identity.
- [x] The browser stores one Continuation State under a key derived from Project Identity.
- [x] Continuation State contains the latest Save Snapshot and provider session identity, while the Save Snapshot itself still contains only canonical Game State.
- [x] Stable committed progress schedules a debounced update of the Continuation State through the browser adapter rather than through individual Game Operations.
- [x] Automatic snapshot creation is passive and never cancels a pending Dialogue Turn.
- [x] A completed Dialogue Turn becomes eligible for automatic continuation only after the Engine commits its authorised outcome.
- [x] Failed, cancelled, abandoned and late Dialogue Turns do not appear as completed continuation progress.
- [x] A compatible Continuation State makes Continue available after a browser reload.
- [x] Continue validates and restores the Save Snapshot before constructing the HTTP Dialogue Provider with the retained session identity.
- [x] Continue uses a non-mutating readiness check and never resets the recovered provider memory merely to test connectivity.
- [x] After Continue, the next Conversation and Reflection calls use the retained session identity and recover their PostgreSQL history.
- [x] New Game replaces the current Continuation State and uses a fresh provider session identity.
- [x] A malformed or incompatible Continuation State never enters the Core and leaves New Game available.
- [x] Continuation States for two Project Identities on the same browser origin do not overwrite one another.
- [x] Low-level Dialogue Provider injection remains available to tests and advanced hosts without requiring browser persistence.
- [x] Browser tests exercise reload, Continue, New Game, compatibility failure and session identity reuse through observable behavior.

## Answer

Implemented browser-owned automatic Continuation State keyed by Project
Identity, pairing a validated Save Snapshot with its opaque provider session
identity. Stable Core progress is persisted passively after commit, while
pending provider work is neither saved nor cancelled. Browser startup now
offers Continue and New Game for compatible progress, uses a non-mutating
Dialogue Server readiness operation when continuing, and exposes only New Game
for malformed or incompatible data. Browser and transport verification cover
reload, identity reuse and replacement, Project isolation, accepted Dialogue
Turns, and the separation between canonical Game State and provider memory.

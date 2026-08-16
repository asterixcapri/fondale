# 04 — Continue Game State and dialogue after reload

**What to build:** Persist one automatic Continuation State per Project Identity
that pairs the latest compatible Save Snapshot with the browser-owned provider
session identity. Present Continue and New Game at startup so a Player can
reload the browser and recover both canonical Game State and the corresponding
PostgreSQL Conversation context without a destructive provider reset.

**Blocked by:** 02 — Execute dialogue without resident session Providers; 03 — Make Dialogue Turns idempotent and cancellable.

**Status:** ready-for-agent

- [ ] A new Game Session creates one cryptographically random provider session identity.
- [ ] The browser stores one Continuation State under a key derived from Project Identity.
- [ ] Continuation State contains the latest Save Snapshot and provider session identity, while the Save Snapshot itself still contains only canonical Game State.
- [ ] Stable committed progress schedules a debounced update of the Continuation State through the browser adapter rather than through individual Game Operations.
- [ ] Automatic snapshot creation is passive and never cancels a pending Dialogue Turn.
- [ ] A completed Dialogue Turn becomes eligible for automatic continuation only after the Engine commits its authorised outcome.
- [ ] Failed, cancelled, abandoned and late Dialogue Turns do not appear as completed continuation progress.
- [ ] A compatible Continuation State makes Continue available after a browser reload.
- [ ] Continue validates and restores the Save Snapshot before constructing the HTTP Dialogue Provider with the retained session identity.
- [ ] Continue uses a non-mutating readiness check and never resets the recovered provider memory merely to test connectivity.
- [ ] After Continue, the next Conversation and Reflection calls use the retained session identity and recover their PostgreSQL history.
- [ ] New Game replaces the current Continuation State and uses a fresh provider session identity.
- [ ] A malformed or incompatible Continuation State never enters the Core and leaves New Game available.
- [ ] Continuation States for two Project Identities on the same browser origin do not overwrite one another.
- [ ] Low-level Dialogue Provider injection remains available to tests and advanced hosts without requiring browser persistence.
- [ ] Browser tests exercise reload, Continue, New Game, compatibility failure and session identity reuse through observable behavior.

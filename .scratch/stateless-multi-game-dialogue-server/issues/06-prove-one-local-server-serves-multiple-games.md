# 06 — Prove one local server serves multiple games

**What to build:** Demonstrate the completed architecture through the ordinary
browser and Dialogue Server interfaces: multiple Game Projects and Game
Sessions share one local server and one configured model while retaining their
own Narrative Context, canonical continuation and Character-specific
PostgreSQL memory. Finish the example, operational guidance and repository
gates as one observable end-to-end proof.

**Blocked by:** 01 — Send Narrative Context with Dialogue Turns; 03 — Make Dialogue Turns idempotent and cancellable; 05 — Replace Save Slots with Continuation.

**Status:** ready-for-human

- [x] Two Game Projects using one Dialogue Server send and receive their own Narrative Context through the production HTTP protocol.
- [x] Concurrent Game Sessions of one Game Project use different provider session identities and never share Conversation or Reflection history.
- [x] Identically named Characters in different sessions or Game Projects never share visible history.
- [x] Browser reload and Continue recover the correct Game State and provider memory for each Project Identity.
- [x] New Game for one Project Identity does not disturb another project's Continuation State or PostgreSQL memory.
- [x] Restarting the Dialogue Server preserves accepted provider memory and subsequent dialogue continuity.
- [x] The canonical Example declares Narrative Context and uses the ordinary Dialogue Server URL without project-specific server environment configuration.
- [x] Local development guidance shows PostgreSQL, one Dialogue Server and one or more browser Game Projects as independently started processes.
- [x] Documentation states that the current target is local multi-game operation, not a secure public multi-tenant platform.
- [x] Language configuration, localisation, authentication, quotas, billing, public tenancy and production retention remain explicitly out of scope.
- [x] Standard build, type checking, architecture checks, documentation checks and browser verification pass without PostgreSQL or a live model.
- [x] Explicit PostgreSQL integration verification proves stateless recovery, isolation, reset and idempotency.
- [x] The opt-in live dialogue suite continues to exercise the real model without becoming a standard repository gate.

## Answer

Proved the completed local architecture supporting multiple Game Projects at
the browser HTTP and public Dialogue Server seams. Two Game Projects now
exercise one Dialogue Server URL
with distinct Narrative Contexts and isolated random provider identities, while
PostgreSQL verification observes identically named Characters retaining only
their own session history. Existing continuation, restart, reset, idempotency
and live-model suites complete the proof. Operator guidance now describes one
PostgreSQL process, one Dialogue Server and any number of browser Game Projects,
and states the local-only deployment and security, tenancy, localisation and
retention boundaries explicitly.

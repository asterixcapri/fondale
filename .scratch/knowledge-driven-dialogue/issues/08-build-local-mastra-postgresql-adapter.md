# 08 — Build the local Mastra and PostgreSQL adapter

**What to build:** Provide the Example with a local Node.js Dialogue Provider
adapter that uses Mastra and PostgreSQL for durable conversational continuity,
while a deterministic model proves storage, thread isolation and reset without
network cost or OpenRouter credentials.

**Blocked by:** 05 — Make Dialogue Turns atomic and cancellable.

**Status:** ready-for-human

- [x] The live adapter runs in a local Node.js TypeScript process outside the Vite browser bundle and implements only Fondale's Dialogue Provider interface.
- [x] Mastra manages conversation memory and `@mastra/pg` persists it in local PostgreSQL.
- [x] Fondale's package has no runtime dependency on Mastra, PostgreSQL, OpenRouter or the adapter's transport.
- [x] Provider credentials and database configuration remain server-side and no secret is exposed through a `VITE_` variable or browser response.
- [x] Only visible Player and Character messages enter conversational memory; structured interpretation and Engine payloads do not appear as visible transcript messages.
- [x] Threads are isolated by Game Session, Character and dialogue mode so unrelated Conversations and Reflection cannot share history.
- [x] Provider reset deletes or invalidates every thread for the targeted Game Session before acknowledging completion.
- [x] Cancellation and failed turns do not leave a half-turn that contaminates the next request.
- [x] A deterministic model adapter verifies structured interpretation, verbalisation, durable continuation and reset against PostgreSQL.
- [x] Local setup, PostgreSQL prerequisites, startup and cleanup are documented without prescribing a deployment platform.
- [x] Standard build and browser verification do not require PostgreSQL, a running adapter or external credentials.
- [x] Adapter integration verification passes independently of the standard deterministic suite.

## Comments

- Implemented test-first in the Capri 1535 Example with a separate local Node.js
  transport, Mastra Memory and `@mastra/pg`. The deterministic model verifies
  structured interpretation, bounded durable context, thread isolation, exact
  visible Lines, lifecycle cancellation and reset against PostgreSQL.
- Final verification passed: adapter integration 9/9, root build and all 235
  Playwright tests, packaged Capri 1535 Example build and all 7 Playwright tests.
- Two-axis code review completed after corrections with 0 Standards findings
  and 0 Spec findings.

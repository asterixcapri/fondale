# 08 — Build the local Mastra and PostgreSQL adapter

**What to build:** Provide the Example with a local Node.js Dialogue Provider
adapter that uses Mastra and PostgreSQL for durable conversational continuity,
while a deterministic model proves storage, thread isolation and reset without
network cost or OpenRouter credentials.

**Blocked by:** 05 — Make Dialogue Turns atomic and cancellable.

**Status:** ready-for-agent

- [ ] The live adapter runs in a local Node.js TypeScript process outside the Vite browser bundle and implements only Fondale's Dialogue Provider interface.
- [ ] Mastra manages conversation memory and `@mastra/pg` persists it in local PostgreSQL.
- [ ] Fondale's package has no runtime dependency on Mastra, PostgreSQL, OpenRouter or the adapter's transport.
- [ ] Provider credentials and database configuration remain server-side and no secret is exposed through a `VITE_` variable or browser response.
- [ ] Only visible Player and Character messages enter conversational memory; structured interpretation and Engine payloads do not appear as visible transcript messages.
- [ ] Threads are isolated by Game Session, Character and dialogue mode so unrelated Conversations and Reflection cannot share history.
- [ ] Provider reset deletes or invalidates every thread for the targeted Game Session before acknowledging completion.
- [ ] Cancellation and failed turns do not leave a half-turn that contaminates the next request.
- [ ] A deterministic model adapter verifies structured interpretation, verbalisation, durable continuation and reset against PostgreSQL.
- [ ] Local setup, PostgreSQL prerequisites, startup and cleanup are documented without prescribing a deployment platform.
- [ ] Standard build and browser verification do not require PostgreSQL, a running adapter or external credentials.
- [ ] Adapter integration verification passes independently of the standard deterministic suite.

## Comments

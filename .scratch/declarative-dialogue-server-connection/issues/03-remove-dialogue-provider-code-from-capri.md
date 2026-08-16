# 03 — Remove Dialogue Provider code from Capri

**What to build:** Cut the Capri Example over to the declarative Dialogue
Server URL. Remove every Provider import, implementation, factory and session
identity decision from its runtime source. Move its deterministic free-form
dialogue behavior into test-owned HTTP support so the acceptance build follows
the same browser transport path as production without reaching PostgreSQL or a
model.

The game continues to own Narrative Facts, Character Knowledge, Disclosure,
Cover Stories, authored alternatives, Sequences and portrayal declarations.

**Blocked by:** 02 — Declare a Dialogue Server URL at browser startup.

**Status:** ready-for-agent

- [ ] Capri runtime source declares only the Dialogue Server URL for dialogue infrastructure.
- [ ] Capri runtime source contains no `DialogueProvider` or `HttpDialogueProvider` reference.
- [ ] The local `FakeDialogueProvider` is removed from Capri `src/`.
- [ ] Scripted prologue interpretation and wording used only by acceptance are owned by test fixtures.
- [ ] Standard acceptance reaches a deterministic test-owned HTTP adapter and requires no database, network or model.
- [ ] The ordinary build still explains an unreachable server without exposing credentials or database details.
- [ ] The opt-in live fixture still reaches the real Dialogue Server and can observe its isolated PostgreSQL memory.
- [ ] Capri has no Hono, PostgreSQL client, Mastra model or Dialogue Server implementation dependency in runtime dependencies.
- [ ] The Example separation gate enforces the absence of Provider and backend implementation code from game source.
- [ ] Capri type checking and production build pass.

## Comments

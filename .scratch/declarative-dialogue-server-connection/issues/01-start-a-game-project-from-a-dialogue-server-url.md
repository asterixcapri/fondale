# 01 — Start a Game Project from a Dialogue Server URL

**What to build:** Let an Author connect a Game Project to generated dialogue
by declaring a Dialogue Server URL at browser startup. Fondale owns the HTTP
adapter, the transient Game Session identity, the initial connection check and
the adapter supplied to the running Game Session. The Author does not construct
or import a Dialogue Provider.

Keep low-level Dialogue Provider injection available for deterministic Engine
tests and advanced hosts. This ticket expands the startup interface without
requiring existing callers to migrate yet.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] A Game Project requiring generated dialogue starts successfully when the browser startup declaration supplies a Dialogue Server URL.
- [x] Each independently started game receives a cryptographically random Game Session identity.
- [x] Interpretation, verbalisation, Reflection, cancellation and reset cross the existing HTTP protocol through the declared URL.
- [x] Restoring a Save Snapshot resets provider-owned memory before the restored Game Session continues.
- [x] An unreachable Dialogue Server produces an actionable environment failure without exposing credentials, database configuration or internal server errors.
- [x] Supplying both a server URL and a low-level Dialogue Provider produces a precise environment diagnostic.
- [x] A Game Project requiring generated dialogue still reports a precise diagnostic when neither form is supplied.
- [x] A Game Project without a Dialogue Profile starts without a URL or Dialogue Provider.
- [x] Existing low-level Dialogue Provider injection remains behaviorally compatible for Engine tests and advanced hosts.
- [x] Browser tests exercise the URL declaration through startup and observable HTTP behavior rather than adapter internals.
- [x] Public documentation distinguishes the ordinary URL declaration from low-level Provider injection.
- [x] Standard type checking, package build and browser verification pass without PostgreSQL or a model.

## Answer

`startGame` now accepts `dialogueServerUrl`, owns the `HttpDialogueProvider`,
creates an isolated UUID-backed Game Session identity and checks the connection
with an initial reset. Its public diagnostics cover ambiguous, missing and
unreachable connections without preserving server-side failure details.

Browser coverage observes reset, interpretation, verbalisation, Reflection,
cancellation and restore reset at the HTTP seam. Low-level Provider injection
remains unchanged for tests and advanced hosts, and the public authoring and
reference documentation distinguish the two startup forms. `npm run build` and
the isolated-port `npm run verify` suite (300 tests) pass without PostgreSQL or
a model.

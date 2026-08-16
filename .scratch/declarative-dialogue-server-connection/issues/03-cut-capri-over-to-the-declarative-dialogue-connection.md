# 03 — Cut Capri over to the declarative dialogue connection

**What to build:** Make Capri consume the completed startup and deployment
interfaces as an ordinary game. Its dialogue infrastructure declaration names
only the Dialogue Server URL; its runtime source contains no Provider factory,
implementation, protocol handling, backend configuration or Game Session
identity decision.

Move deterministic acceptance behavior behind the HTTP seam into test-owned
support. The standard game build therefore follows the same connection path as
production while its tests still require no PostgreSQL, network or model.

**Blocked by:** 01 — Start a Game Project from a Dialogue Server URL; 02 — Run the Dialogue Server independently.

**Status:** resolved

- [x] Capri declares only the Dialogue Server URL for generated-dialogue infrastructure.
- [x] Capri runtime source contains no Dialogue Provider or HTTP adapter import, implementation, factory or protocol handling.
- [x] Capri owns Narrative Facts, Character Knowledge, Disclosure, Cover Stories, authored alternatives, Sequences and portrayal exactly as before.
- [x] The local fake Dialogue Provider and scripted deterministic dialogue behavior are removed from game runtime source.
- [x] Standard browser acceptance answers the production HTTP protocol through test-owned deterministic support.
- [x] Standard verification requires no database, external network, model or model credential.
- [x] The ordinary game reports an unreachable Dialogue Server with actionable instructions and no secret or backend detail.
- [x] The opt-in live verification still reaches the independently started Dialogue Server, model and PostgreSQL memory.
- [x] Legacy game-owned server startup, Compose and private-environment surfaces are removed after the cutover.
- [x] The Example separation gate rejects Provider, server, database-client and model implementation code in game runtime source.
- [x] The architecture record and public documentation state that the Engine sends authorised turn material and the server never loads the Game Project.
- [x] Documentation shows PostgreSQL, Dialogue Server and browser game as three independently started processes.
- [x] Root package build and isolated-port browser verification pass.
- [x] Dialogue Server unit and explicit PostgreSQL integration verification pass.
- [x] Capri type checking and production build pass; dialogue-specific browser behavior passes through the HTTP seam.
- [x] Unrelated in-progress Capri content and its stale acceptance expectations remain untouched and are reported separately.

## Answer

Capri now supplies only `dialogueServerUrl` to `startGame`. Fondale owns the
HTTP adapter, Game Session identity, connection check, cancellation and memory
reset. The Example's scripted dialogue moved behind the production HTTP seam
into Playwright-owned support; ordinary and acceptance builds therefore follow
the same startup path. The standard Save/Load controls reset the same server
session before restoring play.

The Example no longer vendors or depends on the Dialogue Server, Mastra or its
PostgreSQL client, and no longer owns server lifecycle aliases. Its separation
gate enforces those boundaries. Documentation now presents PostgreSQL, Node and
the browser game as three separately started processes and records that the
server receives authorised turn material rather than loading a Game Project.

Root build, the 300-test isolated browser suite, Dialogue Server unit tests,
seven PostgreSQL integration tests, Capri type checking, production build and
the dialogue-specific Capri browser tests pass. Five unrelated Capri acceptance
expectations remain stale against the already in-progress Scene, art and HUD
content changes; this ticket did not edit those expectations or their content.

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

**Status:** claimed

- [ ] Capri declares only the Dialogue Server URL for generated-dialogue infrastructure.
- [ ] Capri runtime source contains no Dialogue Provider or HTTP adapter import, implementation, factory or protocol handling.
- [ ] Capri owns Narrative Facts, Character Knowledge, Disclosure, Cover Stories, authored alternatives, Sequences and portrayal exactly as before.
- [ ] The local fake Dialogue Provider and scripted deterministic dialogue behavior are removed from game runtime source.
- [ ] Standard browser acceptance answers the production HTTP protocol through test-owned deterministic support.
- [ ] Standard verification requires no database, external network, model or model credential.
- [ ] The ordinary game reports an unreachable Dialogue Server with actionable instructions and no secret or backend detail.
- [ ] The opt-in live verification still reaches the independently started Dialogue Server, model and PostgreSQL memory.
- [ ] Legacy game-owned server startup, Compose and private-environment surfaces are removed after the cutover.
- [ ] The Example separation gate rejects Provider, server, database-client and model implementation code in game runtime source.
- [ ] The architecture record and public documentation state that the Engine sends authorised turn material and the server never loads the Game Project.
- [ ] Documentation shows PostgreSQL, Dialogue Server and browser game as three independently started processes.
- [ ] Root package build and isolated-port browser verification pass.
- [ ] Dialogue Server unit and explicit PostgreSQL integration verification pass.
- [ ] Capri type checking and production build pass; dialogue-specific browser behavior passes through the HTTP seam.
- [ ] Unrelated in-progress Capri content and its stale acceptance expectations remain untouched and are reported separately.

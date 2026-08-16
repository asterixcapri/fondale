# 02 — Run the Dialogue Server independently

**What to build:** Give the Dialogue Server package complete ownership of its
development entry point, private environment template and PostgreSQL Compose
definition. A developer starts PostgreSQL explicitly with Docker Compose and
starts only the Node.js Dialogue Server with the package's `npm run dev`.

Preserve a working path for the existing Capri integration while this expansion
lands, so the repository remains verifiable before the game migrates to the new
browser startup declaration.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] The Dialogue Server package provides an `npm run dev` command that runs its source entry point with server-side environment loading.
- [x] The server development command never starts, stops, recreates or inspects Docker Compose.
- [x] PostgreSQL is started independently with `docker compose up -d` from server-owned infrastructure.
- [x] The PostgreSQL Compose definition and private environment template are owned outside the Capri game.
- [x] Database credentials, model credentials and server configuration never use browser-exposed environment variables.
- [x] Missing database configuration fails before the server listens, and an unavailable database produces a clear server-side startup failure.
- [x] The server continues to load no Game Project and no game files.
- [x] The built `fondale-dialogue-server` executable remains the production entry point.
- [x] The existing Capri live integration remains runnable during the migration without restoring backend ownership to the game.
- [x] Server documentation presents Docker Compose, server development and production startup as separate operations.
- [x] Unit verification requires no Docker or PostgreSQL, while PostgreSQL-backed verification remains an explicit integration command.
- [x] Package build, server unit verification and explicit PostgreSQL integration verification pass.

## Answer

The Dialogue Server workspace now owns its Node-only `npm run dev`, private
environment template and PostgreSQL Compose definition. Startup probes the
configured PostgreSQL storage before opening the HTTP port and reports a clear
server-side failure when it is unavailable. The built executable remains the
production entry point, while Capri's temporary development alias delegates to
the server workspace.

The package build and 24 unit tests pass without PostgreSQL. Seven explicit
PostgreSQL integration tests pass against the independently running database,
and the isolated-port repository browser suite passes all 300 tests.

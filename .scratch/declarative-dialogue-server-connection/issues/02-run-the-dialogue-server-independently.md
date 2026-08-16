# 02 — Run the Dialogue Server independently

**What to build:** Give the Dialogue Server package complete ownership of its
development entry point, private environment template and PostgreSQL Compose
definition. A developer starts PostgreSQL explicitly with Docker Compose and
starts only the Node.js Dialogue Server with the package's `npm run dev`.

Preserve a working path for the existing Capri integration while this expansion
lands, so the repository remains verifiable before the game migrates to the new
browser startup declaration.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] The Dialogue Server package provides an `npm run dev` command that runs its source entry point with server-side environment loading.
- [ ] The server development command never starts, stops, recreates or inspects Docker Compose.
- [ ] PostgreSQL is started independently with `docker compose up -d` from server-owned infrastructure.
- [ ] The PostgreSQL Compose definition and private environment template are owned outside the Capri game.
- [ ] Database credentials, model credentials and server configuration never use browser-exposed environment variables.
- [ ] Missing database configuration fails before the server listens, and an unavailable database produces a clear server-side startup failure.
- [ ] The server continues to load no Game Project and no game files.
- [ ] The built `fondale-dialogue-server` executable remains the production entry point.
- [ ] The existing Capri live integration remains runnable during the migration without restoring backend ownership to the game.
- [ ] Server documentation presents Docker Compose, server development and production startup as separate operations.
- [ ] Unit verification requires no Docker or PostgreSQL, while PostgreSQL-backed verification remains an explicit integration command.
- [ ] Package build, server unit verification and explicit PostgreSQL integration verification pass.

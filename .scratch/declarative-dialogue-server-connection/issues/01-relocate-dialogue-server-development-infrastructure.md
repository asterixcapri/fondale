# 01 — Relocate Dialogue Server development infrastructure

**What to build:** Move the PostgreSQL Compose definition and the private
server environment template out of the Capri Example and into the Dialogue
Server's development/deployment area. Add `npm run dev` to the
`@asterixcapri/fondale-dialogue-server` workspace so it starts only the Node.js
TypeScript entry point using that server-side environment.

After this ticket, the documented commands are independently runnable:
`docker compose up -d` starts PostgreSQL and `npm run dev` in the server
workspace starts Node. The npm command never invokes Docker.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] The Compose definition is no longer owned by the Capri game directory.
- [ ] The server environment template is no longer owned by the Capri game directory.
- [ ] The server workspace provides an `npm run dev` command that runs its source entry point.
- [ ] `npm run dev` loads only server-side variables and never exposes a `VITE_` secret.
- [ ] `npm run dev` does not start, stop, recreate or inspect Docker Compose.
- [ ] A missing or unavailable PostgreSQL configuration fails clearly from the server process.
- [ ] The built `fondale-dialogue-server` executable remains the production entry point.
- [ ] Server README instructions show the separate Compose and npm commands from their correct directories.
- [ ] Unit verification does not require Docker or PostgreSQL; integration verification remains explicit.

## Comments

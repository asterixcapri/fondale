# 04 — Document and prove the independent dialogue processes

**What to build:** Complete the public explanation and repository verification
for the agreed deployment model. Update ADR-0020, package READMEs and Example
instructions so they consistently describe PostgreSQL, Dialogue Server and
browser game as three independently started processes with three explicit
owners.

Run the relevant repository, server and Example gates through the public seams;
do not repair unrelated in-progress Capri content or rewrite acceptance
expectations to hide those changes.

**Blocked by:** 01, 02, 03.

**Status:** ready-for-agent

- [ ] ADR-0020 states that the Dialogue Server never loads a Game Project and receives authorised turn material from the Engine.
- [ ] Documentation shows `docker compose up -d`, server `npm run dev` and game `npm run dev` as separate commands.
- [ ] No documentation claims that npm starts PostgreSQL or that browser JavaScript starts Node.
- [ ] The Dialogue Server package documentation owns database, model and private environment setup.
- [ ] The Example documentation owns only game authoring, its public server URL and game startup.
- [ ] `npm run build` passes for both published packages.
- [ ] Root browser verification passes on an isolated port.
- [ ] Dialogue Server unit and explicit PostgreSQL integration verification pass.
- [ ] Capri production build and dialogue-specific acceptance verification pass.
- [ ] Any unrelated Capri acceptance failures are reported with concrete evidence and remain outside the change.

## Comments

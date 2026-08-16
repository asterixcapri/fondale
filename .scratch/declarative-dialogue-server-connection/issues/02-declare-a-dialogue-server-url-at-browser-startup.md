# 02 — Declare a Dialogue Server URL at browser startup

**What to build:** Deepen Fondale's browser startup interface so an ordinary
game declares `dialogueServer: { url }` instead of constructing a Dialogue
Provider. The browser module owns `HttpDialogueProvider`, the transient Game
Session identity, initial reachability/reset behavior and injection into the
existing Game Session.

Keep the low-level `dialogueProvider` seam for deterministic Engine tests and
custom technical hosts. A caller supplying both forms receives a precise
environment diagnostic.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Browser startup accepts a Dialogue Server URL without exposing Provider construction to the caller.
- [ ] Each independently started game receives a cryptographically random Game Session identity.
- [ ] Dialogue Turn cancellation and provider reset retain their current behavior through the URL path.
- [ ] Restoring a Save Snapshot resets provider-owned memory before the restored Game Session runs.
- [ ] A Game Project requiring generated dialogue reports an actionable diagnostic when no URL or provider is supplied.
- [ ] Supplying both a URL and a low-level provider reports a precise environment diagnostic.
- [ ] A Game Project without Dialogue Profiles starts without dialogue infrastructure.
- [ ] Existing low-level provider tests remain valid rather than being duplicated through implementation details.
- [ ] Public reference documentation distinguishes the ordinary URL declaration from the advanced Provider seam.
- [ ] Root type checking, build and isolated-port browser verification pass.

## Comments

# 03 — Carry the presented Detail View through save and restore

**What to build:** Make examining something survive leaving. The presented
Detail View is committed Game State, so a Player who saves while looking at a
close-up, closes the browser and comes back finds the same close-up, with the
world and the Player Character untouched beneath it.

**Blocked by:** 01 — Present and examine a Detail View.

**Status:** ready-for-agent

- [ ] The presented Detail View is part of committed Game State.
- [ ] A Save Snapshot carries it and restores it exactly, including which one is presented.
- [ ] Restoring into a presented Detail View leaves the Player Character in its own Scene, Ground Point and Facing.
- [ ] Restoring into a presented Detail View is not an arrival and starts no arrival Sequence.
- [ ] The Continuation State carries it, so reloading the browser returns to the same close-up.
- [ ] A Save Snapshot naming an unknown Detail View is refused by validation with a clear message.
- [ ] Core Session tests cover the round-trip; a browser test covers the reload, following the prior art for continuation.

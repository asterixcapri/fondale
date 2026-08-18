# 14 — Close the prologue on the sailor's death

**What to build:** Make the prologue end instead of stopping. Today the sailor
loses consciousness, the Player is returned to free roam, and the strongest beat
of the demo waits behind an Inventory chore nobody is prompted to perform; when
the bundle is finally opened, the last Narration is followed by nothing. The
finale is rebuilt as one continuous beat: the sailor gives the bundle, Michele
opens it and reads it aloud across several Lines, and the sailor dies as the
reading ends. Michele answers the death with a single gesture, and the demo
closes on a final card.

This changes the canonical outcome recorded in ticket 10 and in the spec, which
state that the sailor's survival remains unresolved. Update both so the
documents agree with the shipped ending; leave his identity and his history
unresolved as before.

**Blocked by:** 13 — Repaint the drifting boat at a declared scale exception.

**Status:** ready-for-agent

- [ ] Opening the bundle follows the handoff without an unmotivated free-roam gap, while the gesture remains the Player's own act.
- [ ] Michele reads the fragment across several authored Lines rather than one summarising Line.
- [ ] The last thing he reads contradicts the accepted account of the ship's loss, so the prologue closes on an open question rather than a restatement.
- [ ] The contradiction is committed as its own Narrative Fact, learned only through the reading.
- [ ] The sailor dies as the reading ends, and the death is committed once through explicit Game Operations.
- [ ] The sailor has a newly produced dead Appearance: one static Runtime image at the repainted deck scale, in the same dusk light, with no presentation variants.
- [ ] Michele answers the death with a single authored beat that closes on his act rather than on Narration.
- [ ] The closing composition settles on the sailor, not on the horizon, and reads correctly against the repainted vessel.
- [ ] A final card Scene follows, built from existing Engine Capability as a Scene whose Background carries the closing text, with no Walkable Region, Hotspot or placed Character.
- [ ] The Player is never returned to free roam beside the dead sailor.
- [ ] Ordinary playback and Sequence skipping commit identical canonical Game State.
- [ ] Knowledge-Driven Dialogue and Reflection report the new Facts under the correct Disclosure and offer no puzzle effect.
- [ ] The spec and ticket 10 are updated so no document still promises an unresolved survival.
- [ ] Both browser acceptance paths still complete the prologue and converge on the same canonical outcome.

# 14 — Close the prologue on the sailor's death

**What to build:** Make the prologue end instead of stopping. Today the sailor
loses consciousness, the Player is returned to free roam, and the strongest beat
of the demo waits behind an Inventory chore nobody is prompted to perform; when
the bundle is finally opened, the last Narration is followed by nothing.

The finale becomes one continuous beat. The sailor gives Michele the oilskin
bundle, and the encounter opens a Detail View of the opened bundle: the broken
seal of the *Santa Marta* and a torn fragment of her registry, seen close while
Michele kneels over them. The Player reads by examining them. The seal names his
father's ship; the fragment records her unloading grain at Amalfi in June 1534,
eight months after the wreck that supposedly took her. The sailor dies as the
reading ends, Michele answers with one gesture, and the Game Session concludes on
a closing Detail View.

**Blocked by:** `detail-view-and-ending` 01 — Present Detail Views; 02 — End a
Game Session.

**Status:** ready-for-agent

- [ ] The handoff opens the bundle's Detail View without an unmotivated free-roam gap.
- [ ] Its Hotspots are the broken seal and the registry fragment, each examinable on its own and in either order.
- [ ] Examining them delivers the reading across several authored Lines rather than one summarising Line.
- [ ] The reading establishes the ship's name, the accepted date of the wreck, and the later date that contradicts it, without the Player having to read the painted artwork.
- [ ] The contradiction is committed as its own Narrative Fact, learned only through the reading.
- [ ] The sailor dies once the reading is complete, committed once through explicit Game Operations.
- [ ] The sailor has a newly produced dead Appearance: one static Runtime image at the corrected deck scale, in the same dusk light, with no presentation variants.
- [ ] Michele answers the death with a single authored beat that closes on his act rather than on Narration.
- [ ] The Game Session ends on a closing Detail View, and the Player is never returned to free roam beside the dead sailor.
- [ ] Ordinary playback and Sequence skipping commit identical canonical Game State.
- [ ] Knowledge-Driven Dialogue and Reflection report the new Facts under the correct Disclosure and offer no puzzle effect.
- [ ] The spec and ticket 10 are updated so no document still promises an unresolved survival.
- [ ] Both browser acceptance paths still complete the prologue and converge on the same canonical outcome.

## Comments

- 2026-08-17: the close-up artwork is already produced and waiting at
  `output/imagegen/seal-closeup-v2.png` — a cold-dusk painting of the opened
  oilskin, the broken wax seal and the registry fragment. Fit it to the
  Logical Resolution rather than regenerating it.

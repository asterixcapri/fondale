# 05 — Close the Capri 1535 prologue on the sailor's death

**What to build:** Prove the new Engine capabilities by finishing the demo with
them. Today the wounded sailor loses consciousness, the Player is returned to
free roam, and the strongest beat of the prologue waits behind an Inventory
chore nobody is prompted to perform; when the bundle is finally opened, the last
Narration is followed by nothing.

The finale becomes one continuous beat. The sailor gives Michele the oilskin
bundle, and the encounter presents a Detail View of the opened bundle: the
broken seal of the *Santa Marta* and a torn fragment of her registry, seen close
while Michele kneels over them. The Player reads by examining them, in either
order. The seal names his father's ship; the fragment records her unloading
grain at Amalfi in June 1534, eight months after the wreck that supposedly took
her. The Detail View is dismissed so the Player watches the sailor die, Michele
answers with a single line, and the Game Session ends on a closing Detail View.

The demo's own documentation still promises that the sailor's survival remains
unresolved. Update it to match the shipped ending, and leave his identity and
his history unresolved as before.

**Blocked by:** 04 — End a Game Session on a Detail View.

**Status:** ready-for-agent

- [ ] The handoff presents the bundle's Detail View without an unmotivated free-roam gap.
- [ ] Its Hotspots are the broken seal and the registry fragment, each examinable on its own and in either order.
- [ ] Examining them delivers the reading across several authored Lines rather than one summarising Line.
- [ ] The reading establishes the ship's name, the accepted date of the wreck and the later date that contradicts it, without the Player having to read the painted artwork.
- [ ] The contradiction is committed as its own Narrative Fact, learned only through the reading.
- [ ] The Detail View is dismissed before the death, so the Player watches it happen in the world.
- [ ] The sailor dies once the reading is complete, committed once through explicit Game Operations.
- [ ] The sailor has a newly produced dead Appearance: one static Runtime image at the corrected deck scale, in the same dusk light, with no presentation variants.
- [ ] Michele answers the death with a single authored beat that closes on his act rather than on Narration.
- [ ] The Game Session ends on a closing Detail View, and the Player is never returned to free roam beside the dead sailor.
- [ ] Ordinary playback and Sequence skipping commit identical canonical Game State.
- [ ] Knowledge-Driven Dialogue and Reflection report the new Facts under the correct Disclosure and offer no puzzle effect.
- [ ] Both browser acceptance paths still complete the prologue and converge on the same canonical outcome.

## Comments

- 2026-08-18: the close-up artwork already exists outside the repository at
  `output/imagegen/seal-closeup-v2.png` — a cold-dusk painting of the opened
  oilskin, the broken wax seal and the registry fragment. Fit it to the Logical
  Resolution rather than regenerating it. `output/` is ignored by Git, so the
  file lives only on the authoring machine until this ticket brings it in.
- 2026-08-18: the wounded sailor's Runtime image was refitted to `0.65` earlier,
  so the dead Appearance must be produced at that corrected deck scale.

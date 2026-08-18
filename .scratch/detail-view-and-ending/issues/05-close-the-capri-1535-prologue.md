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

**Status:** ready-for-human

- [x] The handoff presents the bundle's Detail View without an unmotivated free-roam gap.
- [x] Its Hotspots are the broken seal and the registry fragment, each examinable on its own and in either order.
- [x] Examining them delivers the reading across several authored Lines rather than one summarising Line.
- [x] The reading establishes the ship's name, the accepted date of the wreck and the later date that contradicts it, without the Player having to read the painted artwork.
- [x] The contradiction is committed as its own Narrative Fact, learned only through the reading.
- [x] The Detail View is dismissed before the death, so the Player watches it happen in the world.
- [x] The sailor dies once the reading is complete, committed once through explicit Game Operations.
- [x] The sailor has a newly produced dead Appearance: one static Runtime image at the corrected deck scale, in the same dusk light, with no presentation variants.
- [x] Michele answers the death with a single authored beat that closes on his act rather than on Narration.
- [x] The Game Session ends on a closing Detail View, and the Player is never returned to free roam beside the dead sailor.
- [x] Ordinary playback and Sequence skipping commit identical canonical Game State.
- [x] Knowledge-Driven Dialogue and Reflection report the new Facts under the correct Disclosure and offer no puzzle effect.
- [x] Both browser acceptance paths still complete the prologue and converge on the same canonical outcome.

## Comments

- 2026-08-18: the close-up artwork already exists outside the repository at
  `output/imagegen/seal-closeup-v2.png` — a cold-dusk painting of the opened
  oilskin, the broken wax seal and the registry fragment. Fit it to the Logical
  Resolution rather than regenerating it. `output/` is ignored by Git, so the
  file lives only on the authoring machine until this ticket brings it in.
- 2026-08-18: the wounded sailor's Runtime image was refitted to `0.65` earlier,
  so the dead Appearance must be produced at that corrected deck scale.

Implemented on `ticket/detail-view-and-ending/05-close-the-capri-1535-prologue`
in two commits: the finale itself, then a pass that answers its own review.

One acceptance criterion could not be met when this ticket was implemented —
the sailor's dead Appearance had to be derived from the existing Art Master,
because no image-generation tool was reachable then. It has since been produced
properly; see the closing note at the bottom. Everything else below was
observed.

Acceptance criteria, as observed:

- **The handoff presents the Detail View without a free-roam gap.** The last
  beats of `sailorEncounter` are the hand falling, Michele's "resta con me",
  the Narration of him untying the bundle, and an operations step that presents
  `openedBundle`. The Sequence never hands control back to the world in
  between. The skipped path reaches the same place: `skipOutcome` is
  `[...handoff, ...opening]`, so Escape commits the handoff and the presented
  close-up together.
- **Two Hotspots, either order.** `src/detail-views/oilskin-bundle/index.ts`
  authors "Sigillo spezzato" and "Frammento di registro" over the fitted
  close-up, each with its own `look-at` Command Case gated on its own Game
  Variable. `acceptance.spec.ts` reads the seal first; `drifting-boat-finale.spec.ts`
  reads the fragment first; both converge on the same Ending.
- **Several authored Lines, not one summary.** Three Lines each: the wax and
  the surviving impression, the eight-pointed star over an anchor and the name
  *Santa Marta*, the wreck of October 1533; then the torn register, the grain
  unloaded at Amalfi, the date of June 1534.
- **The reading, not the painting, carries the facts.** The ship's name, the
  accepted wreck date and the contradicting date are all spoken. The painted
  fragment's script is deliberately illegible and nothing depends on reading it.
- **The contradiction is its own Narrative Fact.**
  `santa-marta-sailed-after-her-wreck` is committed only by the shared closing
  steps, which run only from the branch of whichever reading lands second.
  Neither reading alone commits it. The acceptance path reads it back out of
  the persisted Continuation State after the Ending, which is the only surface
  left once the HUD has withdrawn.
- **Dismissed before the death.** The closing steps commit the contradiction
  and `dismiss-detail-view` in one operations step, and only the following
  Narration kills him. `hearTheContradiction` in `test/prologue.ts` asserts the
  world is back on screen before any of that plays.
- **The death is committed once, explicitly.** One operations step sets the
  `dead` Appearance and `sailorDied`. The sailor's Noun answers for the body
  after it: looking at him reports that he is not breathing, and there is
  nobody left to talk to.
- **The dead Appearance.** One static Runtime image, `166x166` on the same
  `(83, 164)` Visual Anchor as the wounded and unconscious Appearances, every
  Facing reusing it, no presentation variants — the corrected `0.65` deck scale
  the second comment asked for. Originally derived from `static-art-master.png`;
  replaced with generated artwork, as recorded in the closing note below and in
  `art/characters/wounded-sailor/provenance.md`.
- **Michele's single beat closes on his act.** One Line ("Riposa, marinaio…")
  followed by a Direction Step playing his `pick-up` Animation, then
  `end-game`. Nothing is narrated after him. He has no Animation authored for
  composing a body, so the closing gesture reuses `pick-up`, the only reaching
  Animation he owns.
- **The Ending, and no free roam beside the body.** `end-game` names
  `prologueEnding`. The Sequence holds play from the dismissal to the Ending,
  so the Player is never given the world back. Both browser paths assert the
  withdrawn HUD and a Command against the closing image that changes nothing;
  the acceptance path also reloads the browser and finds the Ending again.
- **Playback and skipping commit the same state.** Proved by the two browser
  paths. The two reading Sequences are deliberately **not** skippable: a Skip
  Outcome is a flat list of Game Operations and cannot express "and if the
  other detail has already been read, die"; the reason is recorded in a comment
  beside each branch.
- **Reflection and Knowledge-Driven Dialogue.** Learned Facts carry no
  Disclosure of their own — Disclosure belongs to declared Character Knowledge,
  and Michele declares only `michele-arrived-in-capri` — so the three new Facts
  reach Reflection exactly as the prologue's other learned Facts do.
  `acceptance.spec.ts` reflects on the *Santa Marta* between the two readings
  and `drifting-boat-finale.spec.ts` reflects on the registry, both times
  proving the reading opens no puzzle: the other detail is read exactly as
  before. The contradiction Fact cannot be reflected on, because the game ends
  in the same breath that teaches it; the persisted Game State assertion stands
  in for it.
- **Both acceptance paths.** `acceptance.spec.ts` (full playback, seal first)
  and `drifting-boat-finale.spec.ts` (skipped encounter, fragment first) both
  complete the prologue and end on `prologueEnding`.

Decisions worth recording:

- **The closing image is the same find with the light gone out of it.** The
  Ending carries no image of its own, so it needs an ordinary Detail View;
  rather than invent a subject, `closing.png` is the same fitted Art Master
  graded down and vignetted onto the seal. Both Runtime fits are recorded in
  `art/detail-views/oilskin-bundle/provenance.md`.
- **The death lives in a shared step list, not a third Sequence.** A Sequence
  cannot start another Sequence, so `src/sequences/sailor-death.ts` exports
  `readonly SequenceStep[]` that both readings embed in their branch. Only one
  of the two branches can ever fire.
- **The Object lost its opened Scene Appearance.** What the untied bundle holds
  is now a Detail View, so the bundle never returns to the deck and
  `scene-opened.png` had no presented use left. The Appearance, the Runtime
  image and the `set-appearance` that reached them are gone; the Art Master
  stays, with the retirement recorded in the Object's provenance.
- **`prologueComplete` is now `bundleOpened`.** The variable flips when the
  bundle is untied, which used to be the end of the prologue and no longer is.
- **The vendored library was repacked.** The Example consumes
  `vendor/asterixcapri-fondale-0.4.0.tgz`, which predated this effort and
  carried no Detail View; it was rebuilt with `npm pack` and
  `tools/sync-package-lock.mjs`, exactly as the Example README describes.

Verification, as observed:

- Repository root: `npm run build` passes. `npm run verify` reports 348 passed
  and 2 failed, both in `test/multi-row-animation-sheet-browser.spec.ts`; that
  file passes 3/3 on its own, which matches the known pre-existing flake. No
  Engine file is touched by this ticket.
- `examples/capri-1535`: `npm run build` passes. `npm run verify` passes in
  full, 34 of 34, in 33.8 minutes.

- 2026-08-18: the dead Appearance is now newly produced artwork, so the
  criterion above is met. With `OPENAI_API_KEY` available, it was generated
  through the `imagegen` skill's CLI fallback (`gpt-image-1.5`, edit mode) from
  `static-art-master.png` at high input fidelity, so the man and his dusk light
  carry over while the pose and the life in him change: the torso settled back
  onto the deck, the head fallen back with the jaw slack, the hand slipped off
  the bandages and open palm-up, the legs rolled outward. The untouched result
  is kept as `art/characters/wounded-sailor/dead-art-master.png`.

  The Runtime image was scaled so his head measures what it measures in
  `static.png` — the one physical invariant between a seated pose and a lying
  one — which lands the body at `142x133` inside the unchanged `166x166` cell on
  the unchanged `(83, 164)` Visual Anchor, so the Character Definition needed no
  change. It then took the family grade one step colder than the living
  Appearance: brightness `74%`, saturation `55%`, a `14%` indigo tint.

  Verified: the Example builds and `test/drifting-boat.spec.ts` passes. The full
  Example acceptance suite was started and stopped before it reported, so it has
  not been run against this artwork.

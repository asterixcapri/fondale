# 03 — Carry the presented Detail View through save and restore

**What to build:** Make examining something survive leaving. The presented
Detail View is committed Game State, so a Player who saves while looking at a
close-up, closes the browser and comes back finds the same close-up, with the
world and the Player Character untouched beneath it.

**Blocked by:** 01 — Present and examine a Detail View.

**Status:** ready-for-human

- [x] The presented Detail View is part of committed Game State.
- [x] A Save Snapshot carries it and restores it exactly, including which one is presented.
- [x] Restoring into a presented Detail View leaves the Player Character in its own Scene, Ground Point and Facing.
- [x] Restoring into a presented Detail View is not an arrival and starts no arrival Sequence.
- [x] The Continuation State carries it, so reloading the browser returns to the same close-up.
- [x] A Save Snapshot naming an unknown Detail View is refused by validation with a clear message.
- [x] Core Session tests cover the round-trip; a browser test covers the reload, following the prior art for continuation.

## Comments

Implemented on `ticket/detail-view-and-ending/03-carry-the-presented-detail-view-through-save-and-restore`.

Acceptance criteria, as observed:

- **Committed Game State / Save Snapshot round-trip.** Already carried by ticket
  01 through `state.detailView`; now covered at the Core Session seam by
  "a restored Save Snapshot keeps the world and the Player Character beneath
  the close-up" in `test/detail-view.spec.ts`, which restores after a Command
  inside the close-up and finds the same Detail View, Hotspots and Game
  Variables.
- **Player Character untouched.** The same test asserts the restored Player
  Character equals the saved one (Scene `boat`, Ground Point `{50, 50}`,
  Facing `back`), not the initial one.
- **Not an arrival.** The Core fixture gained a `hold` Scene reached through a
  Passage, whose arrival Sequence presents a Detail View. "restoring into a
  presented Detail View is not an arrival and starts no arrival Sequence"
  restores after that Sequence has finished and finds no Activity and no
  Sequence presentation, with the Player Character unchanged.
- **Continuation State.** No production change was needed: the browser
  Continuation State stores a validated Save Snapshot. Covered by "reloading
  the browser returns to the presented Detail View" in
  `test/detail-view-browser.spec.ts`, following the prior art in
  `continuation-browser.spec.ts`: the close-up is stored, the page reloads,
  Continue returns to the same rendered close-up with the same Player
  Character, and its Hotspots still answer.
- **Unknown Detail View refused clearly.** `src/capabilities/save/index.ts`
  now reports `save.state.detail-view` at path `Save Snapshot.state.detailView`
  instead of the generic `save.state.invalid`, for both an unknown and a
  malformed presented Detail View. The code is documented in
  `docs/public/reference.md`.

Verification: `npm run build` passes. `npm run verify` passes every Detail View
and Save test; under full-suite load the three
`test/multi-row-animation-sheet-browser.spec.ts` tests fail intermittently.
That flake reproduces on the base commit `a684939` with this branch's changes
absent, and all three pass when the file is run on its own, so it is
pre-existing and unrelated to this ticket.

# 04 — End a Game Session on a Detail View

**What to build:** Let a Game Project say the story is over. A Game Operation
concludes the Game Session leaving a named Detail View presented; from that
moment the HUD withdraws and no Command is answered. A Player who reopens the
browser on a finished game finds its ending rather than an exhausted world, and
starting a new game leaves it cleanly behind.

**Blocked by:** 01 — Present and examine a Detail View; 03 — Carry the presented
Detail View through save and restore.

**Status:** ready-for-human

- [x] A Game Operation ends the Game Session and leaves a named Detail View presented.
- [x] After the Ending no Command is accepted and the HUD withdraws.
- [x] The Ending carries no image of its own; what remains presented is an ordinary Detail View.
- [x] A Game Project may author more than one Ending, closing different outcomes on different Detail Views.
- [x] The Ending is committed Game State and is carried by both the Save Snapshot and the Continuation State.
- [x] Restoring a concluded Game Session presents its Ending rather than the world.
- [x] Starting a new game leaves the Ending behind with no residue.
- [x] Core Session tests cover refusal of Commands and the round-trip; a browser test reaches an Ending, reloads, and finds it still presented with the HUD withdrawn.

## Comments

Implemented on `ticket/detail-view-and-ending/04-end-a-game-session-on-a-detail-view`.

Acceptance criteria, as observed:

- **A Game Operation ends the Game Session on a named Detail View.** `GameOperation`
  gains `{ type: "end-game", detailView }`, validated at startup against the
  `detailViews` registry through the same `reference.detail-view` diagnostic
  `present-detail-view` uses. In the Game Session it presents that Detail View,
  sets `ended` and clears whatever activity was running. Covered by "a Game
  Operation ends the Game Session on a named Detail View" in
  `test/detail-view.spec.ts`: the Scene, the Player Character and its Ground
  Point are left exactly where they stood.
- **No Command accepted, HUD withdrawn.** `handleInput` returns immediately once
  `state.ended`, so no Command, Sequence advance, Line advance or movement is
  answered; the HUD returns a withdrawn presentation with no Nouns, no
  Inventory, no narrative and no Command Response, and the browser overlay
  hides itself entirely. Covered by "after the Ending no Command is accepted"
  and "the HUD withdraws at the Ending".
- **No image of its own.** The Ending names an ordinary Detail View: "the Ending
  carries no image of its own, so what remains is an ordinary Detail View"
  asserts the presentation is the plain `detailView` + `image` pair and that
  its Hotspot is still hit-tested. The browser fixture closes on a Detail View
  that carries a clickable dedication.
- **More than one Ending.** The Core fixture authors two, chosen by Game State
  on the same Command Case: "a Game Project may author more than one Ending,
  closing on different Detail Views" reaches `harbour` where the default route
  reaches `farewell`.
- **Committed Game State, Save Snapshot and Continuation State.** `ended` is
  committed Game State beside `detailView`, accepted by Save validation only as
  `true` and only with a Detail View presented. "a restored Save Snapshot
  resumes at the Ending rather than in the world" round-trips it and finds the
  Ending, the closing image and a withdrawn HUD, with Commands still refused.
  The browser test polls the stored Continuation State and finds `ended` in it.
- **Restoring a concluded Game Session.** Same Core test, plus the browser test
  "an Ending closes the game on its Detail View, withdraws the HUD, and
  survives a reload": reload, Continue, and the closing image is drawn again
  with the overlay still hidden.
- **New game leaves the Ending behind.** "starting a new game leaves the Ending
  behind" asserts a fresh Session equals an untouched one, with no `ended` and
  no `detailView`; the browser test "starting a new game after an Ending leaves
  it behind" chooses New Game after a finished playthrough and finds the world,
  a visible HUD and a Continuation State with no Ending in it.
- **Tests.** Core Session seam in `test/detail-view.spec.ts` (nine new tests,
  including a Sequence that ends the game and must direct nothing after its
  last beat); browser seam in `test/detail-view-browser.spec.ts` (two new
  tests) with a new closing image fixture. No new seam was introduced.

Decisions worth recording:

- The Ending keeps `lifecycle()` at `"running"`. Stopping the Session would
  refuse the Save Snapshot and the Continuation State, which the Ending must
  carry; the terminal fact is Game State, not Engine lifecycle. The logical
  clock keeps ticking behind the closing image with nothing to direct, and the
  Continuation State is not rewritten, because its progress fingerprint already
  excludes the tick.
- A malformed or unpresented Ending is refused with a Save-owned
  `save.state.ending` diagnostic naming `Save Snapshot.state.ended`, following
  the `save.state.detail-view` precedent set by ticket 03 rather than falling
  back to the generic invalid-Game-State message.

Verification: `npm run build` passes. `npm run verify` passes in full, all 350
tests, including `test/multi-row-animation-sheet-browser.spec.ts` — that file
failed once earlier under full-suite load and passed on its own and in the
final full run, matching the known pre-existing flake.

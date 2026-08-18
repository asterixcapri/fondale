# 02 — Detail View Hotspots do everything a Command Case does

**What to build:** Make a Detail View a place where the game can actually
happen, not just talk. Examining an area may teach a Narrative Fact, set a Game
Variable, start a Sequence or open a Conversation; areas appear and disappear
with Game State; and the Player may use a selected Inventory Object on an area —
a key in a lock, a tessera in a mechanism. Because every Game Operation travels
one shared path, presenting a Detail View must also work from a Command Case and
from a Skip Outcome without any dedicated code.

**Blocked by:** 01 — Present and examine a Detail View.

**Status:** ready-for-human

- [x] An area's Command Case may answer with a Line or a Command Response.
- [x] An area's Command Case may run Game Operations, and they commit exactly once.
- [ ] An area's Command Case may start a Sequence, including one that opens a Conversation.
- [x] Area Hotspots honour conditions on Game State, appearing and withdrawing as it changes.
- [x] A selected Inventory Object may be used on an area, with the same first-Noun semantics used in a Scene.
- [x] Unsupported combinations answer with authored feedback and mutate no Game State.
- [x] Presenting a Detail View works from a Command Case in the world, after its Approach Point walk, with no code specific to that route.
- [x] Presenting a Detail View works from a Sequence's Skip Outcome and commits the same state as ordinary playback.
- [x] Core Session tests cover each of these paths.

## Comments

Implemented on branch
`ticket/detail-view-and-ending/02-detail-view-hotspots-do-everything-a-command-case-does`.

**The headline finding: no Engine change was needed.** Ticket 01 routed a
Detail View Command through `Interaction.immediateInput` into the same
`resolveCommandDefinition` and `applyOperations` path a Scene Hotspot uses, and
Game Project validation already walks every Detail View Hotspot Noun. Every
behaviour this ticket asks for therefore fell out of that one shared path, and
the work here is the coverage that proves it — nine Core Session tests in
`test/detail-view.spec.ts`, driven through a new `mechanism` Detail View — plus
one sentence of reference documentation. A behaviour that had needed new code
would have meant the shared path was not shared; none did.

**Acceptance criteria, as observed**

- *A Line or a Command Response* — the `Cord` area answers with a Line: the
  committed activity is `{ type: "line", line: { character: "player", … } }`,
  no `movement-started` is emitted, and `advance-line` clears it. Command
  Responses were already covered by ticket 01 and are re-asserted throughout.
- *Game Operations commit exactly once* — the `Hollow` area gives the coin and
  sets a Game Variable in one Case. Committing it twice would either duplicate
  the coin in the Inventory or fail the Session, the Object no longer being in
  the Scene; the Inventory reads `["knife", "coin"]` and the lifecycle stays
  `running`.
- *Start a Sequence — partial* — the `Ring` area starts `callTheSailor`, which
  narrates while the close-up is still presented and then dismisses it. The
  Conversation half of the criterion is **not** reachable today: the Engine has
  no Game Operation and no Sequence step that opens a Conversation, which only
  `talk-to` on a Character Hotspot does (`openConversation` in
  `game-session`), and a handoff needs a Conversation already open. The test
  therefore proves the Sequence hands back a world in which an ordinary
  `talk-to` opens one. Adding an operation that opens a Conversation is a
  design decision this ticket did not carry, so it is flagged rather than
  invented.
- *Conditions appearing and withdrawing* — `Plate` is authored `when`
  `mechanismOpen` is false and `Hollow` when it is true; unlocking withdraws
  the first from the HUD Nouns and from `hitTest`, and admits the second.
- *A selected Inventory Object, with Scene first-Noun semantics* — the same
  authored Command Case is placed on a Scene Hotspot and on the `Lock` area,
  and two Sessions are run side by side: identical Command Response, identical
  committed `command`, `variables` and `inventory`; only the world route emits
  `movement-started`. The close-up advertises "Use Knife with Lock".
- *Unsupported combinations* — `push` on the `Lock`, and the knife used on the
  `Cord`, both answer the authored fallback and leave committed Game State
  identical but for the reset Command.
- *Presenting from a Command Case in the world, after the Approach Point walk*
  — `movement-started` and `movement-finished` both name the Approach Point,
  nothing is presented until the walk finishes, and the Player Character ends
  facing as authored.
- *Presenting from a Skip Outcome* — a skippable Sequence presents the
  `registry` Detail View at its end and through its Skip Outcome; the committed
  Game State of the skipped Session equals that of the played one, tick aside.
- *Core Session tests cover each path* — `test/detail-view.spec.ts` now holds
  15 tests, all passing.

**Verification**

- `npm run build` passes, including the architecture and documentation gates.
- `npm run verify`: 331 passed, 2 failed (an earlier full run: 330 passed, 3
  failed) — every failure in `test/multi-row-animation-sheet-browser.spec.ts`,
  which passes in isolation and failed identically on the base commit during
  ticket 01. Pre-existing timing flake, not a regression.

**Notes for the next tickets**

- The `sailor` Character with a small dialogue profile now exists in the Core
  Session fixture, for the Conversation observation above.
- Nothing here touches save and restore (ticket 03) or the Ending (ticket 04).

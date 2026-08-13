# 02 — Present authored alternatives in a Conversation

**What to build:** An Author declares authored alternatives on a Character's
Dialogue Profile. When the Player resolves Talk To against that Character, the
Conversation presents those alternatives and the free-form input field
together, and keeps both available for as long as the Conversation is the
dominant Game Activity. Selecting an alternative speaks the exact authored
language and commits the Game Operations the Author attached to it, without
reaching a Dialogue Provider at all. Typing still opens an ordinary Dialogue
Turn. Neither path is gated: both are there from the moment the Conversation
opens.

This is the tracer bullet for the whole feature — the first ticket after which
a Player can see and use both channels in one screen. See the spec and
ADR-0017.

**Blocked by:** 01 — Share alternative eligibility across capabilities.

**Status:** ready-for-human

- [x] A Character's Dialogue Profile may declare authored alternatives, each with its displayed phrase, an optional eligibility condition and its authored outcome.
- [x] Opening a Conversation presents the eligible alternatives together with the free-form input field.
- [x] Eligibility is evaluated against committed Game State, and ineligible alternatives are hidden rather than presented as unavailable.
- [x] At most six eligible alternatives are presented at once, consistent with Choice.
- [x] Selecting an alternative produces its exact authored language, with no Dialogue Provider call, no provider memory write and no model cost.
- [x] The selected phrase is pronounced by the Player Character unless the Author marked it unspoken, consistent with Choice.
- [x] Game Operations attached to an alternative commit atomically when it is selected.
- [x] The Player may alternate freely between selecting alternatives and typing within a single Conversation, in either order and repeatedly.
- [x] Behaviour when an alternative is selected while a Dialogue Turn is pending is decided explicitly — either refused until the turn settles, or cancelling that turn under the existing cancellation policy — and covered by a test; the two must not race.
- [x] Authoring diagnostics reject invalid alternative shapes, invalid conditions and over-long eligible sets at startup, with codes and paths consistent with existing dialogue diagnostics.
- [x] Characters without authored alternatives, and Sequences with Choices, are behaviourally unchanged.
- [x] Deterministic Game Session tests cover presentation, eligibility, selection without provider involvement, alternation between the two channels, and committed Game Operations.
- [x] A browser test confirms the alternatives list and the input field are visible at the same time and both usable, including by keyboard alone.
- [x] `CONTEXT.md`, `docs/public/reference.md` and `docs/public/game-authoring.md` describe the combined presentation.
- [x] Standard build and browser verification pass.

## Comments

Implemented. An Author declares `alternatives` on a Character's Dialogue
Profile; each `ConversationAlternativeDefinition` carries its displayed `text`,
an optional `when`, an optional `spoken` flag and the exact `response`, plus
optional `operations`. The Dialogue capability owns the definition, its startup
diagnostics and the `alternatives(character, conditionMatches)` query, which
reuses the shared eligibility rules extracted in ticket 01 — so the limit and
the hiding of ineligible entries are literally the same rules a Choice applies.

Game Session presents them on `ConversationPresentation.alternatives` and
resolves a `select-alternative` input by setting the ordinary two-phase
conversation Line directly: the phrase as the Player Character (unless
`spoken: false`), then the authored answer from the Character. No provider is
reached, which the deterministic tests assert through `threadKeys()`.

Two decisions worth recording:

- **Pending Dialogue Turn: refused, not cancelling.** A selection made while a
  turn is pending is ignored until the turn settles, which is the existing
  "a pending turn blocks a second turn" rule rather than a new cancellation
  path. Covered by a test.
- **An alternative cannot start a Sequence.** `start-sequence` in an
  alternative's `operations` is rejected at startup
  (`definition.conversation-alternative.sequence`). Without it, that operation
  replaced the Conversation activity through a back door, swallowing the
  authored answer and leaving nothing to close or resume it. Directing a
  Sequence properly is ticket 03; this diagnostic holds the boundary until then
  and should be revisited there.

The browser renderer draws the list inside the dialogue form, above the input
field. Reaching it by keyboard exposed an existing defect: the frame's Tab
shortcut (reveal hotspots) swallowed Tab for every dialogue-form control except
the input itself, trapping focus in the list. The keydown guard now yields to
the whole dialogue form rather than only its input field.

`CONTEXT.md` already described the combined presentation, so it was left
unchanged; `reference.md` and `game-authoring.md` gained the new type, the
diagnostics and the authoring prose.

Verification: `npm run build` passes; `npm run verify` reports 249 passed. As
noted in ticket 01, run it with `FONDALE_TEST_PORT=5199` when another dev
server holds port 5173.

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

**Status:** ready-for-agent

- [ ] A Character's Dialogue Profile may declare authored alternatives, each with its displayed phrase, an optional eligibility condition and its authored outcome.
- [ ] Opening a Conversation presents the eligible alternatives together with the free-form input field.
- [ ] Eligibility is evaluated against committed Game State, and ineligible alternatives are hidden rather than presented as unavailable.
- [ ] At most six eligible alternatives are presented at once, consistent with Choice.
- [ ] Selecting an alternative produces its exact authored language, with no Dialogue Provider call, no provider memory write and no model cost.
- [ ] The selected phrase is pronounced by the Player Character unless the Author marked it unspoken, consistent with Choice.
- [ ] Game Operations attached to an alternative commit atomically when it is selected.
- [ ] The Player may alternate freely between selecting alternatives and typing within a single Conversation, in either order and repeatedly.
- [ ] Behaviour when an alternative is selected while a Dialogue Turn is pending is decided explicitly — either refused until the turn settles, or cancelling that turn under the existing cancellation policy — and covered by a test; the two must not race.
- [ ] Authoring diagnostics reject invalid alternative shapes, invalid conditions and over-long eligible sets at startup, with codes and paths consistent with existing dialogue diagnostics.
- [ ] Characters without authored alternatives, and Sequences with Choices, are behaviourally unchanged.
- [ ] Deterministic Game Session tests cover presentation, eligibility, selection without provider involvement, alternation between the two channels, and committed Game Operations.
- [ ] A browser test confirms the alternatives list and the input field are visible at the same time and both usable, including by keyboard alone.
- [ ] `CONTEXT.md`, `docs/public/reference.md` and `docs/public/game-authoring.md` describe the combined presentation.
- [ ] Standard build and browser verification pass.

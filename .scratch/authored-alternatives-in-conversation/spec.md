# Spec — Authored alternatives inside a Conversation

**Status:** ready-for-agent

## Problem Statement

An Author who gives a Character a Dialogue Profile today trades away authored
dialogue for free-form dialogue. Resolving Talk To against such a Character
opens a Conversation, and from that moment the Player faces an empty input
field: the authored questions, their exact answers and their branching live in
a Sequence, which is a different Game Activity and cannot be presented at the
same time.

This hurts both sides of the exchange. The Player meets the free-form field at
its weakest moment — before learning any Narrative Fact, with nothing to ask
about and no indication of what this Character can discuss — so a Character
that is in fact well modelled reads as one that does not understand. The Author,
in turn, loses the exact language that carries puzzle-critical information and
their best-written lines, because the only way to keep them is to withhold the
Dialogue Profile altogether.

## Solution

A Conversation presents authored alternatives and the free-form input field
together, for its whole duration. The Player sees the questions the Author
wrote and, beneath them, a field in which to type anything else.

Selecting an authored alternative yields exact authored language and never
reaches a Dialogue Provider. Typing opens an ordinary Dialogue Turn, restricted
as it already is to the Narrative Facts the speaking Character actually knows.
Both paths are available from the moment the Conversation opens and remain
available at every point within it; the Player moves between them freely, and
no unlock gates either.

The authored alternatives do the teaching that an empty field cannot: they show
the Player that this Character is worth talking to and what is worth asking, so
the free-form field is discovered as an extension of a conversation already
under way. Puzzle-critical wording therefore stays authored, exact and free of
model cost, while free-form dialogue covers exploration around it.

## User Stories

1. As an Author, I want to give a Character both authored alternatives and a Dialogue Profile, so that I no longer choose between exact language and free-form investigation.
2. As an Author, I want authored alternatives to be declared on the Character rather than inside a Sequence, so that they belong to the Conversation that presents them.
3. As an Author, I want an authored alternative to yield the exact wording I wrote, so that a puzzle-critical instruction reaches the Player unaltered.
4. As an Author, I want an authored alternative to reach no Dialogue Provider, so that my authored dialogue costs nothing and cannot fail on a network error.
5. As an Author, I want an authored alternative to be able to hand control to a Sequence, so that a question can open a scene with several Lines, Choices, Motions and Camera direction.
6. As an Author, I want a Conversation to resume after such a Sequence completes, so that the Player can keep questioning a Character about what they have just seen.
7. As an Author, I want an authored alternative to carry Game Operations, so that asking the right question can set a Game Variable and advance a puzzle.
8. As an Author, I want authored alternatives to honour eligibility conditions, so that a question about the winch handle appears only once the Player could know of it.
9. As an Author, I want ineligible alternatives to be hidden rather than disabled, so that the list never reveals what the Player Character has not yet discovered.
10. As an Author, I want to decide per alternative whether it is consumed once asked, so that pivotal questions are asked once while reference questions stay repeatable.
11. As an Author, I want a startup Authoring Diagnostic when an alternative names an unknown Sequence, so that a typo fails at start rather than mid-Conversation.
12. As an Author, I want a startup Authoring Diagnostic when an alternative's condition or shape is invalid, so that authoring mistakes surface with the rest of validation.
13. As an Author, I want existing Characters without authored alternatives to behave exactly as before, so that adopting this feature is optional.
14. As an Author, I want existing Sequences and their Choices to behave exactly as before, so that my directed scenes are untouched.
15. As an Author, I want the combined presentation documented in the public reference and authoring guide, so that I can adopt it without reading Engine source.
16. As a Player, I want to see the questions the game offers as soon as I talk to a Character, so that I know what this conversation is about.
17. As a Player, I want a text field available at the same time, so that I can ask something the game did not anticipate.
18. As a Player, I want to move between clicking and typing at any point, so that I am never locked into one way of talking.
19. As a Player, I want a clicked question answered immediately and identically every time, so that authored answers feel dependable.
20. As a Player, I want a typed question answered only from what that Character actually knows, so that the fiction stays coherent.
21. As a Player, I want no part of the conversation to be locked behind progress, so that I never wonder whether I am allowed to talk yet.
22. As a Player, I want the input field to step aside while a scene plays, so that I am not invited to type over a Character's performance.
23. As a Player, I want the input field back when the scene ends, so that I can follow up on what I just learned.
24. As a Player, I want my pending typed question to survive until it is answered or cancelled, so that a slow provider does not lose my turn.
25. As a Player, I want saving and loading to restore the Conversation exactly as I left it, including which authored alternatives remain, so that my progress is never quietly altered.
26. As a Player, I want to reach Reflection unchanged, so that consulting what my Character knows works as before.
27. As a Player using the keyboard alone, I want to select an authored alternative and reach the input field, so that the Conversation is fully operable without a mouse.
28. As a Player, I want the Conversation to close cleanly when I leave it, so that no dialogue state lingers.
29. As a Player of the Example, I want a Character offering both paths without installing a database, so that the feature is visible in a fresh checkout.
30. As an Author, I want to declare that learning a Narrative Fact also sets a Game Variable, so that something the Player discovers by typing can advance the game.
31. As an Author, I want that variable set in the same atomic commit as the learning itself, so that no Save Snapshot can hold a Character who knows something the world has not registered.
32. As an Author, I want the variable set only after Disclosure authorised the Fact, so that a secret a Character refused to reveal can never open a puzzle.
33. As an Author, I want the variable to be an ordinary Game Variable, so that Hotspots, Passages, Sequences and eligibility conditions react to it with the mechanisms I already use.
34. As a Player, I want the world to notice what I discovered by asking in my own words, so that free-form conversation is a real way of playing rather than decoration.
35. As a contributor, I want deterministic Game Session tests covering both paths and their alternation, so that a regression in either is caught without a model.

## Implementation Decisions

**Where alternatives are declared.** Authored alternatives belong to the
Character's Dialogue Profile, alongside knowledge, Cover Stories, Relationships
and handoffs. They are a property of the Character being talked to, not of a
Sequence, because the Conversation — not a Sequence — presents them.

**What an alternative carries.** An authored alternative names its displayed
phrase, an optional eligibility condition, the authored steps or the Sequence
it directs, and whether it is consumed once asked. It reuses the semantics
already defined for Choice wherever they apply: eligibility evaluated against
committed Game State, ineligible alternatives hidden rather than shown
disabled, at most six eligible at once, and the selected phrase pronounced by
the Player Character unless explicitly silent.

**Presentation, not a second Activity.** The Conversation remains a single
dominant Game Activity that now presents two affordances. Authored
alternatives do not introduce a new Game Activity, and the Engine does not
enter a Sequence merely to answer an authored alternative with one Line. A
Sequence becomes dominant only when an alternative directs one, exactly as an
authored handoff does today; while it holds direction of play, the free-form
field is not presented.

**No unlock.** A Character's Dialogue Profile stays unconditional. Whether
free-form dialogue is available is decided by the presence of a Dialogue
Profile alone, as today — see ADR-0017 for why a conditional profile was
rejected.

**Authored answers bypass the provider entirely.** Selecting an authored
alternative produces its authored language and Game Operations directly. No
interpretation, no verbalisation, no provider memory write. This keeps
ADR-0013's guarantee intact from the other direction: authored text is never
laundered through a model.

**Learning a Narrative Fact may set a Game Variable.** An Author may declare
that a Character learning a given Narrative Fact also sets a named Game
Variable. Without this, knowledge acquired through free-form dialogue stays
invisible to the rest of the game: an Interaction Condition reads Game
Variables and Inventory, never Character Knowledge, so a Player who discovers
something by typing could never make the world respond. With it, free-form
dialogue advances play instead of merely accumulating knowledge.

The declaration is authored and the Engine performs it: the variable is set in
the same atomic commit as the `learn-narrative-fact` Game Operation, after
Disclosure has authorised the Fact and before any verbalisation is spoken. A
Fact that is not disclosable cannot be selected, so it cannot open anything.
Generated wording decides nothing here — it never has, and this does not change
that; what changes is that the Engine's own decision may now carry a Game
Variable with it. Recorded as an extension of ADR-0013's boundary rather than a
breach of it.

Setting the variable through this route is indistinguishable, to the rest of
the game, from setting it any other way: Interaction Conditions, Sequences,
Hotspots and Passages are untouched. Authored alternatives may also carry
Game Operations directly, so an Author may advance a puzzle from either path.

**Interaction with a pending Dialogue Turn.** A pending turn already blocks a
second turn. Selecting an authored alternative while a turn is pending must be
either refused until the turn settles, or treated as leaving the turn and
cancelling it under the existing cancellation policy. The decision belongs to
implementation but must be explicit and covered by a test; silently racing the
two is not acceptable.

**Consumption is Game State.** Which alternatives have been consumed is
canonical: it validates and restores in a Save Snapshot alongside the
Conversation continuation, and changes only through a Game Operation.

**Modules touched.** The dialogue capability gains the authored-alternative
definition, its validation and its eligibility evaluation; the game-session
capability presents alternatives within the Conversation, resolves a selection,
and routes an alternative that directs a Sequence; the save capability
validates and restores consumed-alternative state; the browser renderer draws
the list above the existing input field and suppresses the field while a
Sequence is dominant. The public API surface gains the new authoring types.

**Glossary and decisions.** `CONTEXT.md` already records the extended
Conversation definition. ADR-0017 records the decision and supersedes the
assumption in ADR-0014 that the two paths alternate rather than coexist.

## Testing Decisions

A good test here exercises external behaviour through the highest available
seam: an authored Game Project in, observable Conversation presentation, Game
Operations and Game State out. It never asserts on interpretation prompts,
provider call shapes or renderer internals. The Fake Dialogue Provider stays
the only dialogue dependency in the standard suite; no test in `npm run build`
or `npm run verify` may require PostgreSQL, a network or a model.

**Primary seam — Game Session** (`test/knowledge-driven-dialogue.spec.ts`,
using `createTestSession`). This is prior art for exactly this shape of test
and covers: alternatives present when a Conversation opens; eligibility
filtering and hiding; selecting an alternative yielding authored language with
no provider call; alternation between authored selection and free-form input
within one Conversation; an alternative directing a Sequence and the
Conversation resuming; consumption behaviour in both variants; Game Operations
committed by a selection; and Save Snapshot validation and restoration via
`validateTestSaveSnapshot`. It also covers the knowledge-to-variable link: a
Fact learned through a free-form turn setting its declared Game Variable in the
same commit; a Fact withheld by Disclosure or answered with a Cover Story
leaving the variable untouched; a failed or cancelled turn committing neither;
and an Interaction Condition elsewhere in the Game Project reacting to the
variable afterwards.

**Secondary seam — browser** (`test/knowledge-driven-dialogue-browser.spec.ts`
over `test/fixtures/knowledge-driven-dialogue.ts`). Reserved for what the
session seam cannot observe: list and input field visible simultaneously, the
field suppressed while a Sequence is dominant and restored afterwards, and
keyboard operability. Prior art is the existing Reflection browser test, which
drives the same fixture through the HUD.

**Lowest seam — dialogue capability** (`src/capabilities/dialogue/index.spec.ts`)
for startup Authoring Diagnostics only, consistent with how the other dialogue
diagnostics are already tested there.

## Out of Scope

- Reconciling the two paths. A typed question that matches an authored
  alternative is answered by the model; the Engine does not redirect it to the
  authored answer. Authoring is expected to keep puzzle-critical and
  well-crafted material in authored alternatives. Recorded in ADR-0017 as a
  possible later evolution.
- Model-generated suggested questions. Alternatives are authored; a generated
  list would carry authorial authority it has not earned and could name
  entities that do not exist.
- Any change to Disclosure, Cover Stories, Testimony, Trust, Relationships or
  Reflection.
- Any change to how a Dialogue Turn is interpreted, verbalised, cancelled or
  committed.
- Conditional Dialogue Profiles, and any other mechanism gating access to
  free-form dialogue.
- Converting the canonical Example's existing Sequences to this model.

## Further Notes

The canonical Example runs `FakeDialogueProvider` with an effectively empty
verbalisation map, so a Character given a Dialogue Profile answers nothing
without the local adapter. Before the Example demonstrates this feature, decide
whether it ships curated fake verbalisations — feasible now that authored
alternatives narrow the predictable input set — or keeps free-form dialogue
behind `?dialogue=local`. Left open deliberately: it is an Example decision,
not an Engine one, and does not block this work.

During the live OpenRouter spike a generated Line named a sacristan, an entity
absent from the fixture and from the whole repository. Interpretation is
constrained by a closed structured output and independently re-checked by the
Engine, but verbalisation is free text validated only for non-emptiness, so a
model may still introduce incidental entities in its wording. This spec does
not address that; it is worth a separate ticket, and it strengthens the case
for keeping load-bearing language authored.

# Testing

## What testing a Fondale game means

You test a game the way a Player plays it: activate the thing with this label,
answer the alternative that reads like that, let play settle, then assert what
the world became.

`@asterixcapri/fondale/testing` runs the whole game with no renderer and no
wall clock. It is the same session the browser adapter drives — the game, not a
model of it — so a test proves the real puzzle chain, not a rehearsal of it.

This is the second published entry point, and the only one a shipped game never
imports.

## How you write one

```ts
import { expect, test } from "vitest";
import { startCoreSession } from "@asterixcapri/fondale/testing";
import { activateNoun, carriedObjects, pressOn } from "@asterixcapri/fondale/testing";
import { project } from "../src/game";

test("the flask can be collected once the nets are moved", () => {
  const session = startCoreSession(project);

  activateNoun(session, "Fishing nets");
  pressOn(session);
  activateNoun(session, "Oil flask");
  pressOn(session);

  expect(carriedObjects(session)).toContain("oilFlask");
});
```

`startCoreSession` takes the Game Project, an optional low-level
`dialogueProvider`, and an optional unknown `restored` Save Snapshot validated
exactly as `startGame` validates one. It returns a `CoreSession`: the same
session the browser adapter drives, accepting the `CoreInput` values a Player
produces, emitting `CoreEffect` values through `takeEffects`, and answering
`hitTest` with a `CoreWorldTarget`.

The helpers below are the vocabulary you should normally use. Reach for the raw
session only when a test needs an input the vocabulary does not name.

### Driving play

`activateNoun` activates the Noun carrying a Label, `primary` or `secondary`,
and settles. `selectObject` takes a carried Object in hand and
`deselectObject` puts it back; neither toggles, so selecting twice cannot
quietly put an Object down and deselecting twice cannot pick it up. `walkTo`
walks the Player Character to a Scene Space point.

`advanceActivity` advances whatever is presented. `chooseAlternative` answers
the alternative that reads like the given text, whether a Conversation or a
Sequence choice is offering it. `skipSequence` skips a running Sequence and
`leaveActivity` leaves an open Conversation or Reflection — both the way Escape
does.

`ask` puts one free-form question to an open Conversation and returns the
answer.

### Waiting correctly

`settle` advances simulated time until advancing further would change nothing,
and **fails rather than hangs**: a game that never comes to rest is a defect,
and a test that waits forever reports nothing.

`atRest` reports that state directly — a queued input the session has yet to
handle appears in no other way.

`pressOn` advances through everything presented until play is idle. It stops at
anything waiting for what to say next — a Conversation, a Reflection, or a
Sequence Choice — rather than for permission to continue, so a test answers it
and presses on again. `advanceToLine` presses on until a Line contains the
given substance, matched on substance rather than on a whole authored sentence.
`stepUntil` advances until a condition holds.

### Reading the world

`revealedNouns` lists the Labels currently reachable — the single most useful
assertion about a Scene, because it is exactly what a Player can see to do.

`presentedLine` returns the `PresentedLine` the Player is reading: its `kind`,
`speaker`, `text`, and for a choice its `alternatives`. `carriedObjects` and
`presentedDetailView` read what is carried and which close-up is presented.
`snapshot` returns the whole `GameState`.

### Dialogue in tests

Pass `FakeDialogueProvider` as the `dialogueProvider`. It maps exact Player
formulations to declared Narrative Fact IDs, and authorised facts, Claims or
Response Strategies to responses. No network, no model, no credentials, and no
timing to wait on: it can hold a turn pending and release it when the test says
so.

## Values and rules

The testing vocabulary knows nothing about any particular game. It addresses
Nouns by their visible Labels and alternatives by their visible text, which is
why a test reads like a walkthrough and breaks when the game stops being
playable — not when an internal name changes.

A Scene is not runnable on its own: it needs a Player Character, an initial
Scene, and everything its Nouns reference. To drive one Scene in isolation,
move the Player's starting point in the real project rather than building a
stand-in project that will drift.

Nothing here draws anything. Presentation belongs to an adapter, so these tests
run in an ordinary test runner with no browser.

## Example

[`test/recipes.spec.ts`](../recipes/game.ts) plays the recipe game from the
quay to the Ending using only Labels a Player can read: collect the lantern,
light it, cross into the storeroom, answer the Choice, and reach the notice.

## See also

[Project](project.md) · [Interaction](interaction.md) · [Dialogue](dialogue.md) · [Save](save.md)

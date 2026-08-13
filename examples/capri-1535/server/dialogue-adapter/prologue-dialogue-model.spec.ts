import assert from "node:assert/strict";
import { test } from "node:test";

import { PrologueDialogueModel } from "./prologue-dialogue-model";

const signal = new AbortController().signal;
const model = new PrologueDialogueModel();
const candidates = [
  { id: "winch-lacks-its-handle", proposition: "L'argano del porto è fermo." },
  { id: "cloister-pulley-is-jammed", proposition: "La carrucola del pozzo è bloccata." },
];

test("a typed question is read as one of the Facts the Character was offering", async () => {
  assert.deepEqual(
    await model.interpret(
      { playerInput: "Che cos'ha la carrucola?", speaker: "michele", listener: "brotherElia", candidates },
      [],
      signal,
    ),
    { factId: "cloister-pulley-is-jammed" },
  );
});

test("a question outside the offered Facts is read as no relevant Fact", async () => {
  assert.deepEqual(
    await model.interpret(
      { playerInput: "Chi ha vinto la corsa?", speaker: "michele", listener: "brotherElia", candidates },
      [],
      signal,
    ),
    { factId: null, reason: "no-relevant-fact" },
  );
  // A Fact the Character never offered stays unreachable, however plainly it is named.
  assert.deepEqual(
    await model.interpret(
      {
        playerInput: "Dov'è l'ampolla?",
        speaker: "michele",
        listener: "brotherElia",
        candidates,
      },
      [],
      signal,
    ),
    { factId: null, reason: "no-relevant-fact" },
  );
});

test("verbalisation dresses only what the Engine authorised", async () => {
  assert.equal(
    await model.verbalize({
      playerInput: "Che cos'ha la carrucola?",
      speaker: "brotherElia",
      listener: "michele",
      strategy: "answer",
      fact: candidates[1],
      profile: {},
    }, [], signal),
    "La carrucola del pozzo è bloccata e il secchio non risale.",
  );
  assert.equal(
    await model.verbalize({
      playerInput: "Che cosa nascondi?",
      speaker: "raffaele",
      listener: "michele",
      strategy: "evade",
      profile: {},
    }, [], signal),
    "Il mare è largo, e le domande sono tante.",
  );
});

test("Reflection is composed from the Character Knowledge it was given", async () => {
  assert.equal(
    (await model.reflect(
      { playerInput: "Che cosa so?", character: "michele", facts: candidates, testimonies: [], relationships: [] },
      [],
      signal,
    )).summary,
    "Quello che so: L'argano del porto è fermo. La carrucola del pozzo è bloccata.",
  );
  assert.equal(
    (await model.reflect(
      { playerInput: "Che cosa so?", character: "michele", facts: [], testimonies: [], relationships: [] },
      [],
      signal,
    )).summary,
    "Non ho ancora scoperto niente che valga la pena ripensare.",
  );
});

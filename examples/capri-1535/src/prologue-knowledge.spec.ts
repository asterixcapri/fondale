import assert from "node:assert/strict";
import { test } from "node:test";

import {
  composePrologueReflection,
  readPrologueQuestion,
  speakPrologueResponse,
} from "./prologue-knowledge";

const candidates = [
  { id: "winch-lacks-its-handle", proposition: "L'argano del porto è fermo." },
  { id: "cloister-pulley-is-jammed", proposition: "La carrucola del pozzo è bloccata." },
];

test("a typed question is read as one of the Facts the Character was offering", () => {
  assert.deepEqual(
    readPrologueQuestion("Che cos'ha la carrucola?", candidates),
    { factId: "cloister-pulley-is-jammed" },
  );
});

test("a question outside the offered Facts is read as no relevant Fact", () => {
  assert.deepEqual(
    readPrologueQuestion("Chi ha vinto la corsa?", candidates),
    { factId: null, reason: "no-relevant-fact" },
  );
  // A Fact the Character never offered stays unreachable, however plainly it is named.
  assert.deepEqual(
    readPrologueQuestion("Dov'è l'ampolla?", candidates),
    { factId: null, reason: "no-relevant-fact" },
  );
});

test("verbalisation dresses only what the Engine authorised", () => {
  assert.equal(
    speakPrologueResponse({
      playerInput: "Che cos'ha la carrucola?",
      speaker: "brotherElia",
      listener: "michele",
      strategy: "answer",
      fact: candidates[1]!,
      profile: {},
    }),
    "La carrucola del pozzo è bloccata e il secchio non risale.",
  );
  assert.equal(
    speakPrologueResponse({
      playerInput: "Che cosa nascondi?",
      speaker: "raffaele",
      listener: "michele",
      strategy: "evade",
      profile: {},
    }),
    "Il mare è largo, e le domande sono tante.",
  );
});

test("Reflection is composed from the Character Knowledge it was given", () => {
  assert.equal(
    composePrologueReflection(candidates),
    "Quello che so: L'argano del porto è fermo. La carrucola del pozzo è bloccata.",
  );
  assert.equal(
    composePrologueReflection([]),
    "Non ho ancora scoperto niente che valga la pena ripensare.",
  );
});

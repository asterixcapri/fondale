import { type GameOperation, type SequenceDefinition } from "fondale";

const outcome: readonly GameOperation[] = [{
  type: "set-variable",
  variable: "wellFreed",
  value: true,
}, {
  type: "set-variable",
  variable: "wellLubricated",
  value: false,
}, {
  type: "set-appearance",
  target: { kind: "scenery", scene: "cloister", scenery: "well" },
  appearance: "freed",
}, {
  type: "place-object",
  object: "winchHandle",
  scene: "cloister",
  groundPoint: { x: 855, y: 620 },
  appearance: "loose",
}];

export const freeWell = ({
  scene: "cloister",
  skippable: true,
  skipOutcome: outcome,
  steps: [{
    type: "direction",
    directions: [{
      type: "animation",
      subject: { kind: "character", character: "michele" },
      animation: "mechanism-use",
    }, {
      type: "animation",
      subject: { kind: "scenery", scenery: "well" },
      animation: "freeing",
      startAfter: { direction: 0, cue: "contact" },
    }],
  }, {
    type: "operations",
    operations: outcome,
  }, {
    type: "line",
    character: "brotherElia",
    text: "Ecco: il secchio è risalito e la manovella è libera. Puoi prenderla.",
  }],
} satisfies SequenceDefinition);

import { type SequenceDefinition } from "fondale";

export const prologueConclusion = ({
  steps: [{
    type: "narration",
    text: "Sotto la torre, oltre gli scogli, una piccola barca alla deriva avanza senza vela e senza timoniere.",
  }, {
    type: "line",
    character: "michele",
    text: "Quella barca non dovrebbe essere qui.",
  }, {
    type: "operations",
    operations: [{
      type: "learn-narrative-fact",
      character: "michele",
      factId: "drifting-boat-sighting",
    }],
  }],
} satisfies SequenceDefinition);

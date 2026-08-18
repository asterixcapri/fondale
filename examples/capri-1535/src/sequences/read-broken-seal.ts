import { type SequenceDefinition } from "@asterixcapri/fondale";

import { sailorDeath } from "./sailor-death";

/** Half of the discovery: the seal names the ship. */
export const readBrokenSeal = ({
  scene: "driftingBoat",
  steps: [
    {
      type: "line",
      character: "michele",
      text: "La ceralacca è spezzata in due, ma l'impronta tiene ancora.",
    },
    {
      type: "line",
      character: "michele",
      text: "Una stella a otto punte sopra un'ancora. Il sigillo della Santa Marta.",
    },
    {
      type: "line",
      character: "michele",
      text:
        "La nave su cui si imbarcò mio padre. Perduta nell'ottobre del 1533, con tutti "
        + "gli uomini a bordo.",
    },
    {
      type: "operations",
      operations: [{
        type: "learn-narrative-fact",
        character: "michele",
        factId: "seal-belongs-to-the-santa-marta",
      }],
    },
    {
      // Whichever reading lands second continues into the closing beat. This
      // is also why neither Sequence is skippable: a Skip Outcome is a flat
      // list of Game Operations and cannot answer "was the other one read?".
      type: "branch",
      cases: [{ when: { variable: "registryRead", equals: true }, steps: sailorDeath }],
      fallback: [],
    },
  ],
} satisfies SequenceDefinition);

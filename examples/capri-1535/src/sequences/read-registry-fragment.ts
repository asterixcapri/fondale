import { type SequenceDefinition } from "@asterixcapri/fondale";

import { sailorDeath } from "./sailor-death";

/** The other half: the registry dates the same ship after she was lost. */
export const readRegistryFragment = ({
  scene: "driftingBoat",
  steps: [
    {
      type: "line",
      character: "michele",
      text: "Un pezzo di registro, strappato di netto. La grafia è sbiadita; i numeri no.",
    },
    {
      type: "line",
      character: "michele",
      text: "«Santa Marta, grano scaricato ad Amalfi». E accanto la data.",
    },
    {
      type: "line",
      character: "michele",
      text: "Giugno del 1534.",
    },
    {
      type: "operations",
      operations: [{
        type: "learn-narrative-fact",
        character: "michele",
        factId: "registry-records-amalfi-in-june-1534",
      }],
    },
    {
      type: "branch",
      cases: [{ when: { variable: "sealRead", equals: true }, steps: sailorDeath }],
      fallback: [],
    },
  ],
} satisfies SequenceDefinition);

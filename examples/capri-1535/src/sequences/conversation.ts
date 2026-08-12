import { type SequenceDefinition } from "@asterixcapri/fondale";

export const conversation = ({
  steps: [
    { type: "narration", text: "La vecchia serratura sbarra la strada verso il porto." },
    {
      type: "choice",
      alternatives: [
        {
          text: "Troverò il modo di passare.",
          when: { variable: "promiseMade", equals: false },
          steps: [
            {
              type: "operations",
              operations: [
                { type: "set-variable", variable: "promiseMade", value: true },
                {
                  type: "set-appearance",
                  target: { kind: "character", character: "michele" },
                  appearance: "determined",
                },
              ],
            },
            {
              type: "line",
              character: "michele",
              text: "La chiave dev'essere qui vicino.",
            },
          ],
        },
      ],
      fallback: { text: "Ricordo la promessa che ho fatto.", steps: [] },
    },
  ],
} satisfies SequenceDefinition);

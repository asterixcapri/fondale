import { defineSequence } from "@asterixcapri/fondale";

export const conversation = defineSequence({
  steps: [
    { type: "line", text: "The old lock guards the road to the harbour." },
    {
      type: "choice",
      alternatives: [
        {
          text: "I will find a way through.",
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
            { type: "line", character: "michele", text: "The key must be nearby." },
          ],
        },
      ],
      fallback: { text: "I remember what I promised.", steps: [] },
    },
  ],
});

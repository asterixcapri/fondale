import { defineSequence } from "@asterixcapri/fondale";

export const lookoutConclusion = defineSequence({
  steps: [
    {
      type: "line",
      text: "Dal parapetto, il mare sembra una strada che non ha ancora scelto dove portarlo.",
    },
    {
      type: "branch",
      cases: [
        {
          when: { variable: "raffaeleImpressed", equals: true },
          steps: [
            {
              type: "line",
              character: "michele",
              text: "Raffaele dovrà ammettere che quelle monete me le sono guadagnate.",
            },
          ],
        },
      ],
      fallback: [
        {
          type: "line",
          character: "michele",
          text: "Raffaele detrarrà sicuramente il prezzo della mia battuta dalle monete.",
        },
      ],
    },
  ],
});

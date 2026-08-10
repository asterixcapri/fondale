import { defineSequence } from "@asterixcapri/fondale";

export const monteSolaroConclusion = defineSequence({
  steps: [{
    type: "narration", text: "Da Monte Solaro, il mare sembra una strada che non ha ancora scelto dove portarlo.",
  }, {
    type: "branch",
    cases: [{ when: { variable: "raffaeleImpressed", equals: true }, steps: [{
      type: "line", character: "michele", text: "Raffaele dovrà ammettere che quelle monete me le sono guadagnate.",
    }] }],
    fallback: [{
      type: "line", character: "michele", text: "Raffaele detrarrà il prezzo della mia battuta dalle monete.",
    }],
  }],
});

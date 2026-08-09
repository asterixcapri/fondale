import { defineSequence } from "@asterixcapri/fondale";

export const greeting = defineSequence({
  steps: [
    { type: "line", text: "A finite conversation begins." },
    {
      type: "choice",
      alternatives: [{
        text: "Continue",
        when: { variable: "ready", equals: true },
        steps: [{ type: "line", text: "The eligible branch continues." }],
      }],
      fallback: { text: "Leave", steps: [] },
    },
  ],
});

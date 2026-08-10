import { defineSequence } from "@asterixcapri/fondale";

export const greeting = defineSequence({
  steps: [
    { type: "line", character: "player", text: "The tide is turning." },
    { type: "narration", text: "A finite conversation begins." },
    {
      type: "choice",
      alternatives: [{
        text: "Continue",
        when: { variable: "ready", equals: true },
        steps: [{ type: "narration", text: "The eligible branch continues." }],
      }],
      fallback: { text: "Leave", steps: [] },
    },
  ],
});

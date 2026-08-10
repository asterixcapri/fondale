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

export const harbourArrival = defineSequence({
  scene: "harbour",
  skippable: true,
  skipOutcome: [
    { type: "set-variable", variable: "arrived", value: true },
    {
      type: "set-appearance",
      target: { kind: "scenery", scene: "harbour", scenery: "boat" },
      appearance: "landed",
    },
  ],
  steps: [
    {
      type: "direct",
      directions: [{ type: "camera", mode: "cut", point: { x: 300, y: 100 } }],
    },
    {
      type: "direct",
      directions: [
        { type: "animation", subject: { kind: "character", character: "player" }, animation: "signal" },
        {
          type: "animation",
          subject: { kind: "scenery", scenery: "boat" },
          animation: "rocking",
          startAfter: { direction: 0, cue: "wave" },
        },
        {
          type: "motion",
          subject: { kind: "scenery", scenery: "boat" },
          path: [{ x: 40, y: 90 }, { x: 260, y: 140 }],
          duration: 2,
          startAfter: { direction: 0, cue: "wave" },
        },
        { type: "camera", mode: "follow", subject: { kind: "scenery", scenery: "boat" } },
      ],
    },
    { type: "operations", operations: [{ type: "set-variable", variable: "arrived", value: true }] },
  ],
});

import { defineSequence, type GameOperation } from "@asterixcapri/fondale";

const outcome: readonly GameOperation[] = [
  { type: "set-variable", variable: "boatReady", value: true },
  {
    type: "set-appearance",
    target: { kind: "scenery", scene: "harbour", scenery: "winch" },
    appearance: "repaired",
  },
  {
    type: "place-object",
    object: "winchHandle",
    scene: "harbour",
    groundPoint: { x: 552, y: 210 },
    appearance: "installed",
  },
];

export const winchInstallation = defineSequence({
  scene: "harbour",
  skippable: true,
  skipOutcome: outcome,
  steps: [
    {
      type: "direct",
      directions: [
        {
          type: "animation",
          subject: { kind: "character", character: "michele" },
          animation: "use-winch",
        },
        {
          type: "animation",
          subject: { kind: "scenery", scenery: "winch" },
          animation: "engaging",
          startAfter: { direction: 0, cue: "contact" },
        },
      ],
    },
    { type: "operations", operations: outcome },
    { type: "line", character: "michele", text: "La manovella gira. Il gozzo per la torre può salpare." },
  ],
});

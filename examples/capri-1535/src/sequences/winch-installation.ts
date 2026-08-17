import { type SequenceDefinition, type GameOperation } from "@asterixcapri/fondale";

const outcome: readonly GameOperation[] = [
  { type: "set-variable", variable: "winchRepaired", value: true },
  { type: "set-variable", variable: "raffaeleConfrontationReady", value: true },
  {
    type: "set-appearance",
    target: { kind: "scenery", scene: "harbour", scenery: "winch" },
    appearance: "withHandle",
  },
  {
    type: "place-object",
    object: "winchHandle",
    scene: "harbour",
    groundPoint: { x: 1642, y: 650 },
    appearance: "installed",
  },
];

export const winchInstallation = ({
  scene: "harbour",
  skippable: true,
  skipOutcome: outcome,
  steps: [
    {
      type: "direction",
      directions: [
        {
          type: "animation",
          subject: { kind: "character", character: "michele" },
          animation: "mechanism-use",
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
    {
      type: "line",
      character: "michele",
      text: "La manovella è al suo posto. L'argano gira e il gozzo per la torre può salpare.",
    },
  ],
} satisfies SequenceDefinition);

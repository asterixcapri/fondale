import { type SequenceDefinition, type GameOperation } from "fondale";

const outcome: readonly GameOperation[] = [
  { type: "set-variable", variable: "boatLanded", value: true },
  {
    type: "set-appearance",
    target: { kind: "scenery", scene: "coastalFortification", scenery: "arrivingBoat" },
    appearance: "landed",
  },
];

export const boatArrival = ({
  scene: "coastalFortification",
  skippable: true,
  skipOutcome: outcome,
  steps: [
    {
      type: "direction",
      directions: [
        {
          type: "animation",
          subject: { kind: "scenery", scenery: "arrivingBoat" },
          animation: "rocking",
        },
        {
          type: "motion",
          subject: { kind: "scenery", scenery: "arrivingBoat" },
          path: [{ x: 40, y: 500 }, { x: 60, y: 508 }],
          duration: 0.2,
        },
        { type: "camera", mode: "cut", point: { x: 80, y: 470 } },
      ],
    },
    {
      type: "direction",
      directions: [
        {
          type: "animation",
          subject: { kind: "scenery", scenery: "arrivingBoat" },
          animation: "rocking",
        },
        {
          type: "motion",
          subject: { kind: "scenery", scenery: "arrivingBoat" },
          path: [{ x: 60, y: 508 }, { x: 100, y: 530 }],
          duration: 0.8,
        },
        {
          type: "camera",
          mode: "move",
          from: { x: 80, y: 470 },
          to: { x: 150, y: 540 },
          duration: 0.8,
        },
      ],
    },
    {
      type: "direction",
      directions: [
        {
          type: "animation",
          subject: { kind: "scenery", scenery: "arrivingBoat" },
          animation: "rocking",
        },
        {
          type: "motion",
          subject: { kind: "scenery", scenery: "arrivingBoat" },
          path: [{ x: 100, y: 530 }, { x: 110, y: 535 }],
          duration: 0.25,
        },
        { type: "camera", mode: "hold", point: { x: 150, y: 540 }, duration: 0.25 },
      ],
    },
    {
      type: "direction",
      directions: [
        {
          type: "animation",
          subject: { kind: "scenery", scenery: "arrivingBoat" },
          animation: "rocking",
        },
        {
          type: "motion",
          subject: { kind: "scenery", scenery: "arrivingBoat" },
          path: [{ x: 110, y: 535 }, { x: 140, y: 548 }, { x: 170, y: 560 }],
          duration: 2,
        },
        {
          type: "camera",
          mode: "follow",
          subject: { kind: "scenery", scenery: "arrivingBoat" },
        },
      ],
    },
    { type: "operations", operations: outcome },
  ],
} satisfies SequenceDefinition);

import { type SequenceDefinition } from "fondale";

/**
 * The first opening of the storeroom: narration, a Line, and a Choice.
 *
 * It is skippable, so it declares the outcome a skip must still commit — the
 * world ends the same whether the Player watched it or not.
 */
export const firstLight = ({
  scene: "storeroom",
  skippable: true,
  skipOutcome: [{ type: "set-variable", variable: "sawTheStoreroom", value: true }],
  steps: [
    { type: "narration", text: "The lantern finds the far wall before your eyes do." },
    { type: "line", character: "player", text: "Someone kept this place in order." },
    {
      type: "choice",
      alternatives: [
        {
          text: "Call out.",
          steps: [{ type: "line", character: "player", text: "Is anyone here?" }],
        },
        {
          text: "Say nothing.",
          spoken: false,
          steps: [{ type: "narration", text: "You keep the question to yourself." }],
        },
      ],
      fallback: { text: "Go on.", steps: [] },
    },
    {
      type: "direction",
      directions: [
        { type: "motion", subject: { kind: "character", character: "player" }, path: [{ x: 640, y: 560 }] },
      ],
    },
    { type: "operations", operations: [{ type: "set-variable", variable: "sawTheStoreroom", value: true }] },
  ],
} satisfies SequenceDefinition);

/** Every later opening of the quay: one line, and out of the way. */
export const backOutside = ({
  scene: "quay",
  steps: [{ type: "narration", text: "The air off the water is colder than it was." }],
} satisfies SequenceDefinition);

import { type SequenceDefinition } from "fondale";

/**
 * The opening of the game.
 *
 * The quay is the initial Scene, so the Scene Opening that stages this Sequence
 * is the start of the game itself: it holds the Scene before the Player has a
 * single frame of control. The case that names it carries a condition on
 * `cameAshore`, and this Sequence raises that Variable as its *first*
 * operation rather than its last — a Sequence interrupted by a Save is not
 * resumed, and an opening interrupted that way is not marked consumed, so
 * raising it up front is what an author controls.
 */
export const firstMorning = ({
  scene: "quay",
  skippable: true,
  skipOutcome: [{ type: "set-variable", variable: "cameAshore", value: true }],
  steps: [
    { type: "operations", operations: [{ type: "set-variable", variable: "cameAshore", value: true }] },
    { type: "narration", text: "First light. The boats are out, and the quay is yours." },
    { type: "line", character: "keeper", text: "Late again. There is work down by the crate." },
  ],
} satisfies SequenceDefinition);

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
        // The last alternative carries no condition, so the Player is never
        // left without an answer to pick.
        { text: "Go on.", steps: [] },
      ],
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

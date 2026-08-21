import { type SequenceDefinition } from "fondale";

/**
 * The opening of the game.
 *
 * The harbour is the initial Scene, so the Scene Opening that stages this
 * Sequence is the start of the game itself: it holds the quay before Michele is
 * anybody's to move. The case that names it is conditioned on `harbourDawnSeen`,
 * and this Sequence raises that Variable as its first operation rather than its
 * last — an opening interrupted by a Save is not resumed and is not marked
 * consumed, so raising it up front is what an author controls.
 */
export const harbourDawn = ({
  scene: "harbour",
  skippable: true,
  skipOutcome: [{ type: "set-variable", variable: "harbourDawnSeen", value: true }],
  steps: [
    {
      type: "operations",
      operations: [{ type: "set-variable", variable: "harbourDawnSeen", value: true }],
    },
    {
      type: "narration",
      text: "Capri, 1535. Il porto lavora da prima dell'alba, e l'argano è fermo da giorni.",
    },
    {
      type: "line",
      character: "michele",
      text: "Un'altra giornata di reti. Vediamo chi paga, oggi.",
    },
  ],
} satisfies SequenceDefinition);

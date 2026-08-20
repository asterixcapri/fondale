import { type GameOperation } from "fondale";

/**
 * What Michele takes away from an authored answer, whatever path brought him
 * to it. Authored alternatives and Sequences carry these beside their wording,
 * so knowledge clicked for and knowledge typed for reach Reflection alike.
 */
export const micheleLearns = (...factIds: readonly string[]): readonly GameOperation[] =>
  factIds.map((factId): GameOperation => ({
    type: "learn-narrative-fact",
    character: "michele",
    factId,
  }));

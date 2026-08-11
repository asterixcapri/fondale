import type { GameState } from "../game-session";
import type { InteractionCondition } from "../game-project";

/** Pure availability rules shared by runtime decisions and save validation. */
export function conditionMatchesState(
  condition: InteractionCondition | undefined,
  state: GameState,
): boolean {
  if (!condition) return true;
  if ("variable" in condition) return state.variables[condition.variable] === condition.equals;
  return state.inventory.objects.includes(condition.hasObject);
}

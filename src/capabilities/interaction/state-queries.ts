import type { InteractionCondition } from "./index";

/** The immutable state facts needed to evaluate every Interaction Condition. */
export interface InteractionConditionStateView {
  readonly variables: Readonly<Record<string, boolean>>;
  readonly inventory: { readonly objects: readonly string[] };
}

/** Pure availability rules shared by runtime decisions and save validation. */
export function conditionMatchesState(
  condition: InteractionCondition | undefined,
  state: InteractionConditionStateView,
): boolean {
  if (!condition) return true;
  if ("variable" in condition) return state.variables[condition.variable] === condition.equals;
  return state.inventory.objects.includes(condition.hasObject);
}

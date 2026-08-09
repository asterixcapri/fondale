import type { GameState } from "./core";
import type { HotspotDefinition, InteractionCondition } from "../public/definitions";

/** Pure availability rules shared by runtime decisions and save validation. */
export function conditionMatchesState(
  condition: InteractionCondition | undefined,
  state: GameState,
): boolean {
  if (!condition) return true;
  if ("variable" in condition) return state.variables[condition.variable] === condition.equals;
  return state.inventory.objects.includes(condition.hasObject);
}

export function hotspotAvailableInState(
  hotspot: HotspotDefinition,
  state: GameState,
): boolean {
  if (!conditionMatchesState(hotspot.when, state)) return false;
  if (hotspot.target.kind !== "object") return true;
  const location = state.objects[hotspot.target.object]?.location;
  return location?.kind === "scene" && location.scene === state.currentScene;
}

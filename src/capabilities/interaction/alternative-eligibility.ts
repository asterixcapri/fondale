import type { InteractionCondition } from "./index";

/** An authored alternative seen only through the condition that gates it. */
export interface ConditionalAlternative {
  readonly when?: InteractionCondition;
}

/** The most alternatives that may be eligible at once, wherever they are offered. */
export const maximumEligibleAlternatives = 6;

/**
 * The indexes of the alternatives eligible against the latest committed Game
 * State, in authored order. Ineligible alternatives are absent rather than
 * marked, so a caller cannot accidentally offer one as unavailable.
 */
export function eligibleAlternativeIndexes(
  alternatives: readonly ConditionalAlternative[],
  conditionMatches: (condition?: InteractionCondition) => boolean,
): number[] {
  return alternatives.flatMap((alternative, index) =>
    conditionMatches(alternative.when) ? [index] : [],
  );
}

/**
 * Whether an authored set could ever exceed the limit, judged at startup with
 * no Game State to hand. Conditions over the same Game Variable are the one
 * exclusion the rule can prove; every other alternative is counted as though it
 * were always eligible.
 */
export function exceedsEligibleAlternativeLimit(
  alternatives: readonly ConditionalAlternative[],
): boolean {
  return maximumSimultaneouslyEligible(alternatives) > maximumEligibleAlternatives;
}

function maximumSimultaneouslyEligible(
  alternatives: readonly ConditionalAlternative[],
): number {
  let simultaneouslyEligible = 0;
  const variableCases = new Map<string, { true: number; false: number }>();
  for (const alternative of alternatives) {
    const condition = alternative.when;
    if (!condition || "hasObject" in condition) {
      simultaneouslyEligible += 1;
      continue;
    }
    const counts = variableCases.get(condition.variable) ?? { true: 0, false: 0 };
    counts[String(condition.equals) as "true" | "false"] += 1;
    variableCases.set(condition.variable, counts);
  }
  for (const counts of variableCases.values()) {
    simultaneouslyEligible += Math.max(counts.true, counts.false);
  }
  return simultaneouslyEligible;
}

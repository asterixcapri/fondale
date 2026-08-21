import type { AuthoringDiagnostic, GameOperation } from "../game-project";
import type { Line } from "../sequence";
import type { CommandResponse, InteractionCondition } from "./index";

/**
 * @internal The outcome shape the rules below police, and nothing more. It is
 * deliberately NOT a base type: every container declares its own case in full,
 * because they do not agree on what an outcome is — a Conversation requires a
 * Sequence, a Branch produces further Sequence steps, and neither can be
 * spelled here. What they share is behaviour, not structure: read from the top,
 * first eligible one applies, and the rules in this file say the rest.
 */
export interface InteractionCase {
  readonly when?: InteractionCondition;
  readonly line?: Line;
  readonly response?: CommandResponse;
  readonly operations?: readonly GameOperation[];
  readonly sequence?: string;
}

/**
 * @internal Reports the two rules every Interaction Case obeys: it declares at
 * most one outcome, counting a `start-sequence` Game Operation as the Sequence
 * it starts, and it declares at least one.
 */
export function validateInteractionCaseOutcome(
  candidate: InteractionCase,
  path: string,
  diagnostics: AuthoringDiagnostic[],
): void {
  const sequenceOutcomes = (candidate.sequence ? 1 : 0) +
    (candidate.operations?.filter(({ type }) => type === "start-sequence").length ?? 0);
  const outcomeCount = Number(candidate.line !== undefined) +
    Number(candidate.response !== undefined) + sequenceOutcomes;
  if (outcomeCount > 1) {
    diagnostics.push({
      code: "definition.command-case.textual-outcome",
      family: "definition", owner: "interaction",
      path,
      message: "An Interaction Case can declare only one textual outcome: Line, Command Response, or Sequence.",
    });
  }
  if (!declaresTextualOutcome(candidate) && !(candidate.operations?.length)) {
    diagnostics.push({
      code: "definition.command-case.empty",
      family: "definition", owner: "interaction",
      path,
      message: "An Interaction Case must produce a Line, Command Response, Game Operation, or Sequence.",
    });
  }
}

/**
 * @internal Reports the ordering rule every list read from the top obeys: at
 * most one entry carries no Interaction Condition, and it comes last. An
 * unconditional entry placed above another is always an authoring error,
 * whatever the container — it wins every time, so everything below it is dead.
 *
 * Whether such an entry is *required* is a separate question, asked by
 * `validateUnconditionalVariantExists`, because the containers disagree on it:
 * a Verb must answer, a Scene need not react.
 */
export function validateUnconditionalVariantLast(
  values: readonly { readonly when?: unknown }[],
  path: string,
  variantName: string,
  diagnostics: AuthoringDiagnostic[],
): void {
  const unconditional = unconditionalIndexes(values);
  if (unconditional.length > 1 ||
      (unconditional.length === 1 && unconditional[0] !== values.length - 1)) {
    diagnostics.push({
      code: "definition.conditional-fallback",
      family: "definition", owner: "interaction",
      path,
      message: `${variantName} variants allow at most one unconditional variant, and it must come last.`,
    });
  }
}

/**
 * @internal Reports the coverage rule, for the containers that require an
 * answer whatever the state: one entry carries no Interaction Condition. It
 * says nothing about position — `validateUnconditionalVariantLast` owns that —
 * so a container composes the two rules it needs and no others.
 */
export function validateUnconditionalVariantExists(
  values: readonly { readonly when?: unknown }[],
  path: string,
  variantName: string,
  diagnostics: AuthoringDiagnostic[],
): void {
  if (unconditionalIndexes(values).length === 0) {
    diagnostics.push({
      code: "definition.conditional-fallback",
      family: "definition", owner: "interaction",
      path,
      message: `${variantName} variants require one unconditional variant, which answers whatever the state.`,
    });
  }
}

/**
 * @internal The pair of rules a list read from the top by the Engine obeys when
 * it must always answer: exactly one unconditional variant, in final position.
 */
export function validateConditionalFallbackOrder(
  values: readonly { readonly when?: unknown }[],
  path: string,
  variantName: string,
  diagnostics: AuthoringDiagnostic[],
): void {
  const before = diagnostics.length;
  validateUnconditionalVariantLast(values, path, variantName, diagnostics);
  if (diagnostics.length === before) {
    validateUnconditionalVariantExists(values, path, variantName, diagnostics);
  }
}

/**
 * @internal The same coverage rule for a list the Player is offered all at once
 * rather than one the Engine reads from the top: the entries carrying no
 * Interaction Condition are the last ones, and there is at least one, so the
 * list always has something to offer. Several of them are allowed here, unlike
 * in `validateUnconditionalVariantLast`, because the Player sees them together
 * and none of them hides the others.
 */
export function validateConditionalFallbackTail(
  values: readonly { readonly when?: unknown }[],
  path: string,
  variantName: string,
  diagnostics: AuthoringDiagnostic[],
): void {
  const unconditional = unconditionalIndexes(values);
  if (unconditional.length === 0 || unconditional[0] !== values.length - unconditional.length) {
    diagnostics.push({
      code: "definition.conditional-fallback",
      family: "definition", owner: "interaction",
      path,
      message:
        `${variantName} variants require an unconditional variant in the final position, after every conditional one.`,
    });
  }
}

/**
 * The positions, in authored order, of the entries carrying no condition. Every
 * rule below asks only whether a condition is present, never what it says, so
 * the parameter is deliberately structural: a container whose selector is a
 * condition of its own — a Scene Entrance, say — can project onto this shape.
 */
function unconditionalIndexes(
  values: readonly { readonly when?: unknown }[],
): number[] {
  return values.flatMap((value, index) => value.when === undefined ? [index] : []);
}

/**
 * @internal Whether an Interaction Case answers the Player in words of its own,
 * as opposed to only changing state. A Sequence started through a Game
 * Operation is not counted: the rule that reads this asks what the case itself
 * declares.
 */
export function declaresTextualOutcome(candidate: InteractionCase): boolean {
  return Boolean(candidate.line || candidate.response || candidate.sequence);
}

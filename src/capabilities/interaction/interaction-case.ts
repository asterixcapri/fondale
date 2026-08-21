import type { AuthoringDiagnostic, GameOperation } from "../game-project";
import type { Line } from "../sequence";
import type { CommandResponse, InteractionCondition } from "./index";

/**
 * @internal The shape every conditional reaction shares, whatever selects it:
 * an optional Interaction Condition, at most one outcome, and Game Operations
 * alongside. A container adds only its selector — a Verb on a Noun, a Scene
 * Entrance on a Scene, nothing inside a Sequence or a Conversation.
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
      message: "A Command Case can declare only one textual outcome: Line, Command Response, or Sequence.",
    });
  }
  if (!declaresTextualOutcome(candidate) && !(candidate.operations?.length)) {
    diagnostics.push({
      code: "definition.command-case.empty",
      family: "definition", owner: "interaction",
      path,
      message: "A Command Case must produce a Line, Command Response, Game Operation, or Sequence.",
    });
  }
}

/**
 * @internal Reports the ordering rule shared by every list read from the top:
 * exactly one entry carries no Interaction Condition, and it comes last, so
 * that no default hides the entries below it.
 */
export function validateConditionalFallbackOrder(
  values: readonly { readonly when?: InteractionCondition }[],
  path: string,
  variantName: string,
  diagnostics: AuthoringDiagnostic[],
): void {
  const unconditional = unconditionalIndexes(values);
  if (unconditional.length !== 1 || unconditional[0] !== values.length - 1) {
    diagnostics.push({
      code: "definition.conditional-fallback",
      family: "definition", owner: "interaction",
      path,
      message: `${variantName} variants require exactly one unconditional fallback in the final position.`,
    });
  }
}

/**
 * @internal The same ordering rule for a list the Player is offered all at once
 * rather than one the Engine reads from the top: the entries carrying no
 * Interaction Condition are the last ones, and there is at least one, so the
 * list always has something to offer. Several of them are allowed here, unlike
 * in `validateConditionalFallbackOrder`, because the Player sees them together
 * and none of them hides the others.
 */
export function validateConditionalFallbackTail(
  values: readonly { readonly when?: InteractionCondition }[],
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
        `${variantName} variants require an unconditional fallback in the final position, after every conditional one.`,
    });
  }
}

/** The positions, in authored order, of the entries carrying no condition. */
function unconditionalIndexes(
  values: readonly { readonly when?: InteractionCondition }[],
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

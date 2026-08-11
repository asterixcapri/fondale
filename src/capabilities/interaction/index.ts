import type { GameOperation, InteractionCondition, Line } from "../game-project";
import { AuthoringError, type AuthoringDiagnostic } from "../game-project";
export { conditionMatchesState, hotspotAvailableInState } from "./state-queries";

/** The semantic actions available to authored Commands. */
export const commandVerbs = [
  "open",
  "pick-up",
  "push",
  "close",
  "look-at",
  "pull",
  "give",
  "talk-to",
  "use",
] as const;

export type CommandVerb = (typeof commandVerbs)[number];
export type Verb = CommandVerb | "walk-to";

/** One state-dependent player-facing name, with an unconditional final variant. */
export interface NounLabel {
  readonly text: string;
  readonly when?: InteractionCondition;
}

/** One state-dependent Preferred Verb, with an unconditional final variant. */
export interface PreferredVerbCase {
  readonly verb: Verb;
  readonly when?: InteractionCondition;
}

/** One state-dependent Verb for a selected Inventory Object. */
export interface SelectedObjectVerbCase {
  readonly verb: "give" | "use";
  readonly when?: InteractionCondition;
}

/** Neutral explanatory text produced by a resolved Command. */
export interface CommandResponse {
  readonly text: string;
}

/** An ordered specific resolution with at most one textual outcome. */
export interface CommandCase {
  readonly verb: CommandVerb;
  readonly firstNoun?: string;
  readonly when?: InteractionCondition;
  readonly line?: Line;
  readonly response?: CommandResponse;
  readonly operations?: readonly GameOperation[];
  readonly sequence?: string;
}

/** A local guaranteed resolution used after all specific Command Cases. */
export interface CommandFallback {
  readonly response: CommandResponse;
  readonly operations?: readonly GameOperation[];
  readonly sequence?: string;
}

/** The common interaction definition used by every world and Inventory Noun. */
export interface NounDefinition {
  readonly labels: readonly NounLabel[];
  readonly preferredVerbs: readonly PreferredVerbCase[];
  readonly secondaryVerbs?: readonly PreferredVerbCase[];
  readonly objectVerbs?: readonly SelectedObjectVerbCase[];
  readonly cases: readonly CommandCase[];
  readonly fallbacks?: Readonly<Partial<Record<CommandVerb, CommandFallback>>>;
}

/** Creates and freezes one locally valid Noun Definition. */
export function defineNoun(input: NounDefinition): NounDefinition {
  const diagnostics: AuthoringDiagnostic[] = [];
  validateConditionalFallback(input.labels, "labels", "Noun Label", diagnostics);
  validateConditionalFallback(
    input.preferredVerbs,
    "preferredVerbs",
    "Preferred Verb",
    diagnostics,
  );
  if (input.secondaryVerbs) {
    validateConditionalFallback(
      input.secondaryVerbs,
      "secondaryVerbs",
      "Secondary Verb",
      diagnostics,
    );
  }
  if (input.objectVerbs) {
    validateConditionalFallback(
      input.objectVerbs,
      "objectVerbs",
      "Selected Object Verb",
      diagnostics,
    );
  }
  input.labels.forEach((label, index) => {
    if (!label.text.trim()) {
      diagnostics.push({
        code: "definition.noun-label.text",
        family: "definition", owner: "interaction",
        path: `labels[${index}].text`,
        message: "A Noun Label cannot be empty.",
      });
    }
  });
  input.cases.forEach((candidate, index) => {
    if (candidate.verb === "give" && candidate.firstNoun === undefined) {
      diagnostics.push({
        code: "definition.command-case.arity",
        family: "definition", owner: "interaction",
        path: `cases[${index}].firstNoun`,
        message: "Give Command Cases always require a first Noun.",
      });
    } else if (candidate.verb !== "give" && candidate.verb !== "use" && candidate.firstNoun !== undefined) {
      diagnostics.push({
        code: "definition.command-case.arity",
        family: "definition", owner: "interaction",
        path: `cases[${index}].firstNoun`,
        message: `The '${candidate.verb}' Verb is unary and cannot declare a first Noun.`,
      });
    }
    const sequenceOutcomes = (candidate.sequence ? 1 : 0) +
      (candidate.operations?.filter(({ type }) => type === "start-sequence").length ?? 0);
    const outcomeCount = Number(candidate.line !== undefined) +
      Number(candidate.response !== undefined) + sequenceOutcomes;
    if (outcomeCount > 1) {
      diagnostics.push({
        code: "definition.command-case.textual-outcome",
        family: "definition", owner: "interaction",
        path: `cases[${index}]`,
        message: "A Command Case can declare only one textual outcome: Line, Command Response, or Sequence.",
      });
    }
    if (!candidate.line && !candidate.response && !(candidate.operations?.length) && !candidate.sequence) {
      diagnostics.push({
        code: "definition.command-case.empty",
        family: "definition", owner: "interaction",
        path: `cases[${index}]`,
        message: "A Command Case must produce a Line, Command Response, Game Operation, or Sequence.",
      });
    }
    if (
      !candidate.line &&
      !candidate.response &&
      !candidate.sequence &&
      candidate.operations?.some(({ type }) =>
        type === "collect-target-object" ||
        type === "place-selected-object" ||
        type === "consume-selected-object"
      )
    ) {
      diagnostics.push({
        code: "definition.command-case.object-feedback",
        family: "definition", owner: "interaction",
        path: `cases[${index}]`,
        message: "A Command Case that moves or consumes an Object must provide a Line, Command Response, or Sequence.",
      });
    }
    if (candidate.line && !candidate.line.character.trim()) {
      diagnostics.push({
        code: "definition.line.character",
        family: "definition", owner: "interaction",
        path: `cases[${index}].line.character`,
        message: "A Line requires a Character.",
      });
    }
    if (candidate.line && !candidate.line.text.trim()) {
      diagnostics.push({
        code: "definition.line.text",
        family: "definition", owner: "interaction",
        path: `cases[${index}].line.text`,
        message: "A Line cannot be empty.",
      });
    }
    validateCommandResponse(candidate.response, `cases[${index}].response`, diagnostics);
  });
  for (const [verb, fallback] of Object.entries(input.fallbacks ?? {})) {
    validateCommandResponse(fallback.response, `fallbacks.${verb}.response`, diagnostics);
  }
  if (diagnostics.length > 0) throw new AuthoringError(diagnostics);
  const cloned = structuredClone(input);
  return deepFreeze({
    ...cloned,
    cases: cloned.cases.map((candidate, index) => {
      const sourceLine = input.cases[index]?.line;
      return sourceLine
        ? {
            ...candidate,
            line: {
              ...sourceLine,
              ...(sourceLine.audio instanceof URL ? { audio: new URL(sourceLine.audio.href) } : {}),
            },
          }
        : candidate;
    }),
  });
}

/** @internal Collects semantic Command Response diagnostics for composed definitions. */
export function validateCommandResponse(
  response: CommandResponse | undefined,
  path: string,
  diagnostics: AuthoringDiagnostic[],
): void {
  if (!response) return;
  if (!response.text.trim()) {
    diagnostics.push({
      code: "definition.command-response.text",
      family: "definition", owner: "interaction",
      path: `${path}.text`,
      message: "A Command Response cannot be empty.",
    });
  }
  if ("speaker" in response || "presentation" in response) {
    diagnostics.push({
      code: "definition.command-response.semantic",
      family: "definition", owner: "interaction",
      path,
      message: "A Command Response cannot declare a speaker or presentation.",
    });
  }
}

export interface CommandLexicon {
  readonly verbs: Readonly<Record<CommandVerb, string>>;
  readonly inventory: {
    readonly select: string;
    readonly deselect: string;
  };
  readonly patterns: {
    readonly unary: string;
    readonly give: string;
    readonly use: string;
  };
}

/** Creates and freezes the localized labels and sentence patterns for Commands. */
export function defineCommandLexicon(input: CommandLexicon): CommandLexicon {
  const diagnostics: AuthoringDiagnostic[] = [];
  for (const verb of commandVerbs) {
    if (!input.verbs[verb]?.trim()) {
      diagnostics.push({
        code: "definition.command-lexicon.label",
        family: "definition", owner: "interaction",
        path: `verbs.${verb}`,
        message: `The Command Lexicon needs a non-empty label for '${verb}'.`,
      });
    }
  }
  validatePattern(input.inventory.select, ["{noun}"], "inventory.select", diagnostics);
  validatePattern(input.inventory.deselect, ["{noun}"], "inventory.deselect", diagnostics);
  validatePattern(input.patterns.unary, ["{verb}", "{noun}"], "patterns.unary", diagnostics);
  validatePattern(input.patterns.give, ["{verb}", "{first}", "{second}"], "patterns.give", diagnostics);
  validatePattern(input.patterns.use, ["{verb}", "{first}", "{second}"], "patterns.use", diagnostics);
  if (diagnostics.length > 0) throw new AuthoringError(diagnostics);
  return deepFreeze(structuredClone(input));
}

/** @internal */
export interface InteractionStateView {
  readonly variables: Readonly<Record<string, boolean>>;
  readonly inventory: { readonly objects: readonly string[] };
}

/** @internal */
export interface ResolvedInteraction {
  readonly operations: readonly GameOperation[];
  readonly response?: CommandResponse;
  readonly line?: Line;
}

/** Interaction-owned selection of a Command Case or fallback. */
export function resolveCommandDefinition(input: {
  readonly noun: NounDefinition;
  readonly verb: CommandVerb;
  readonly firstNoun?: string;
  readonly state: InteractionStateView;
  readonly projectFallbacks?: Readonly<Partial<Record<CommandVerb, CommandResponse>>>;
}): ResolvedInteraction | undefined {
  const { noun, verb, firstNoun, state, projectFallbacks } = input;
  if (firstNoun && !state.inventory.objects.includes(firstNoun)) {
    const response = noun.fallbacks?.[verb]?.response ?? projectFallbacks?.[verb];
    return response ? { operations: [], response } : undefined;
  }
  const candidate = noun.cases.find((value) =>
    value.verb === verb &&
    value.firstNoun === firstNoun &&
    conditionMatches(value.when, state)
  );
  const fallback = candidate ? undefined : noun.fallbacks?.[verb];
  const resolution = candidate ?? fallback;
  if (!resolution) {
    const response = projectFallbacks?.[verb];
    return response ? { operations: [], response } : undefined;
  }
  return {
    operations: [
      ...(resolution.operations ?? []),
      ...(resolution.sequence
        ? [{ type: "start-sequence" as const, sequence: resolution.sequence }]
        : []),
    ],
    ...(resolution.response ? { response: resolution.response } : {}),
    ...("line" in resolution && resolution.line ? { line: resolution.line } : {}),
  };
}

export function conditionalValue<T extends { readonly when?: InteractionCondition }>(
  values: readonly T[],
  state: InteractionStateView,
): T {
  return values.find((value) => conditionMatches(value.when, state)) ?? values.at(-1)!;
}

export function conditionalOptionalValue<T extends { readonly when?: InteractionCondition }>(
  values: readonly T[] | undefined,
  state: InteractionStateView,
): T | undefined {
  return values?.find((value) => conditionMatches(value.when, state)) ?? values?.at(-1);
}

export function contextualVerb(
  noun: NounDefinition,
  action: "primary" | "secondary",
  selectedObject: string | undefined,
  state: InteractionStateView,
): Verb | undefined {
  if (selectedObject) {
    return action === "primary"
      ? conditionalOptionalValue(noun.objectVerbs, state)?.verb ?? "use"
      : conditionalValue(noun.preferredVerbs, state).verb;
  }
  return action === "primary"
    ? conditionalValue(noun.preferredVerbs, state).verb
    : conditionalOptionalValue(noun.secondaryVerbs, state)?.verb;
}

export function preferredFirstNoun(
  noun: NounDefinition,
  verb: Verb,
  selectedObject: string | undefined,
  state: InteractionStateView,
): string | undefined {
  if (!selectedObject || verb === "walk-to") return undefined;
  if (verb === "give") return selectedObject;
  if (verb !== "use") return undefined;
  return noun.cases.some((candidate) =>
    candidate.verb === "use" &&
    candidate.firstNoun === selectedObject &&
    conditionMatches(candidate.when, state)
  ) ? selectedObject : undefined;
}

function conditionMatches(
  condition: InteractionCondition | undefined,
  state: InteractionStateView,
): boolean {
  if (!condition) return true;
  if ("variable" in condition) return state.variables[condition.variable] === condition.equals;
  return state.inventory.objects.includes(condition.hasObject);
}

function validateConditionalFallback(
  values: readonly { readonly when?: InteractionCondition }[],
  path: string,
  name: string,
  diagnostics: AuthoringDiagnostic[],
): void {
  const unconditional = values
    .map((value, index) => value.when === undefined ? index : -1)
    .filter((index) => index >= 0);
  if (unconditional.length !== 1 || unconditional[0] !== values.length - 1) {
    diagnostics.push({
      code: "definition.conditional-fallback",
      family: "definition", owner: "interaction",
      path,
      message: `${name} variants require exactly one unconditional fallback in the final position.`,
    });
  }
}

function validatePattern(
  pattern: string,
  placeholders: readonly string[],
  path: string,
  diagnostics: AuthoringDiagnostic[],
): void {
  if (!pattern.trim() || placeholders.some((placeholder) => !pattern.includes(placeholder))) {
    diagnostics.push({
      code: "definition.command-lexicon.pattern",
      family: "definition", owner: "interaction",
      path,
      message: `The sentence pattern must contain ${placeholders.join(", ")}.`,
    });
  }
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

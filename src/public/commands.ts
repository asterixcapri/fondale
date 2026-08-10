import type { GameOperation, InteractionCondition } from "./definitions";
import { AuthoringError, type AuthoringDiagnostic } from "./diagnostics";

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

/** Player-perceivable text produced by a resolved Command. */
export interface CommandResponse {
  readonly text: string;
  readonly presentation?: "speech" | "narration";
  readonly speaker?: string;
}

/** An ordered specific resolution for a Command addressed to this Noun. */
export interface CommandCase {
  readonly verb: CommandVerb;
  readonly firstNoun?: string;
  readonly when?: InteractionCondition;
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
        family: "definition",
        path: `labels[${index}].text`,
        message: "A Noun Label cannot be empty.",
      });
    }
  });
  input.cases.forEach((candidate, index) => {
    if (candidate.verb === "give" && candidate.firstNoun === undefined) {
      diagnostics.push({
        code: "definition.command-case.arity",
        family: "definition",
        path: `cases[${index}].firstNoun`,
        message: "Give Command Cases always require a first Noun.",
      });
    } else if (candidate.verb !== "give" && candidate.verb !== "use" && candidate.firstNoun !== undefined) {
      diagnostics.push({
        code: "definition.command-case.arity",
        family: "definition",
        path: `cases[${index}].firstNoun`,
        message: `The '${candidate.verb}' Verb is unary and cannot declare a first Noun.`,
      });
    }
    if (!candidate.response && !(candidate.operations?.length) && !candidate.sequence) {
      diagnostics.push({
        code: "definition.command-case.empty",
        family: "definition",
        path: `cases[${index}]`,
        message: "A Command Case must produce a Command Response, Game Operation, or Sequence.",
      });
    }
    if (
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
        family: "definition",
        path: `cases[${index}]`,
        message: "A Command Case that moves or consumes an Object must provide a Command Response or Sequence.",
      });
    }
  });
  if (diagnostics.length > 0) throw new AuthoringError(diagnostics);
  return deepFreeze(structuredClone(input));
}

export interface CommandLexicon {
  readonly verbs: Readonly<Record<CommandVerb, string>>;
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
        family: "definition",
        path: `verbs.${verb}`,
        message: `The Command Lexicon needs a non-empty label for '${verb}'.`,
      });
    }
  }
  validatePattern(input.patterns.unary, ["{verb}", "{noun}"], "patterns.unary", diagnostics);
  validatePattern(input.patterns.give, ["{verb}", "{first}", "{second}"], "patterns.give", diagnostics);
  validatePattern(input.patterns.use, ["{verb}", "{first}", "{second}"], "patterns.use", diagnostics);
  if (diagnostics.length > 0) throw new AuthoringError(diagnostics);
  return deepFreeze(structuredClone(input));
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
      family: "definition",
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
      family: "definition",
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

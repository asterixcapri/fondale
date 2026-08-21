import type { GameOperation } from "../game-project";
import type { AuthoringDiagnostic } from "../game-project";
import type { Line } from "../sequence";
import type {
  Facing,
  HotspotDefinition,
  HotspotTarget,
  ObjectState,
  Point,
  WorldTarget,
} from "../world";
import { conditionMatchesState } from "./state-queries";
import {
  declaresTextualOutcome,
  validateConditionalFallbackOrder,
  validateInteractionCaseOutcome,
  validateUnconditionalVariantLast,
} from "./interaction-case";
export { conditionMatchesState };
export {
  eligibleAlternativeIndexes,
  exceedsEligibleAlternativeLimit,
  maximumEligibleAlternatives,
  type ConditionalAlternative,
} from "./alternative-eligibility";
export {
  validateConditionalFallbackOrder,
  validateConditionalFallbackTail,
  validateInteractionCaseOutcome,
  validateUnconditionalVariantExists,
  validateUnconditionalVariantLast,
  type InteractionCase,
} from "./interaction-case";

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

/** A proposition over the latest committed state used by Interaction policy. */
export type InteractionCondition =
  | { readonly variable: string; readonly equals: boolean }
  | { readonly hasObject: string };

/** Authored consequences that change Inventory membership or Object lifecycle. */
export type InventoryOperation =
  | { readonly type: "collect-target-object" }
  | { readonly type: "give-object-to-player"; readonly object: string }
  | {
      readonly type: "place-selected-object";
      readonly groundPoint: Point;
      readonly appearance?: string;
    }
  | {
      readonly type: "place-object";
      readonly object: string;
      readonly scene: string;
      readonly groundPoint: Point;
      readonly appearance?: string;
    }
  | { readonly type: "consume-selected-object" };

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

/**
 * An Interaction Case selected by a Verb against one or two Nouns. The last
 * case of a Verb carrying neither a first Noun nor an Interaction Condition is
 * that Verb's default: it answers every Command the cases above it do not.
 */
export interface CommandCase {
  readonly verb: CommandVerb;
  readonly firstNoun?: string;
  readonly when?: InteractionCondition;
  readonly line?: Line;
  readonly response?: CommandResponse;
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
}

/** Reports every local Noun Definition Authoring Diagnostic without a Game Project. */
export function validateNounDefinition(
  input: NounDefinition,
  path = "",
): readonly AuthoringDiagnostic[] {
  const diagnostics: AuthoringDiagnostic[] = [];
  validateConditionalFallbackOrder(input.labels, childPath(path, "labels"), "Noun Label", diagnostics);
  validateConditionalFallbackOrder(
    input.preferredVerbs,
    childPath(path, "preferredVerbs"),
    "Preferred Verb",
    diagnostics,
  );
  if (input.secondaryVerbs) {
    validateConditionalFallbackOrder(
      input.secondaryVerbs,
      childPath(path, "secondaryVerbs"),
      "Secondary Verb",
      diagnostics,
    );
  }
  if (input.objectVerbs) {
    validateConditionalFallbackOrder(
      input.objectVerbs,
      childPath(path, "objectVerbs"),
      "Selected Object Verb",
      diagnostics,
    );
  }
  input.labels.forEach((label, index) => {
    if (!label.text.trim()) {
      diagnostics.push({
        code: "definition.noun-label.text",
        family: "definition", owner: "interaction",
        path: childPath(path, `labels[${index}].text`),
        message: "A Noun Label cannot be empty.",
      });
    }
  });
  input.cases.forEach((candidate, index) => {
    if (candidate.verb === "give" && candidate.firstNoun === undefined && candidate.when !== undefined) {
      diagnostics.push({
        code: "definition.command-case.arity",
        family: "definition", owner: "interaction",
        path: childPath(path, `cases[${index}].firstNoun`),
        message: "Give Command Cases require a first Noun unless they are the Verb's default.",
      });
    } else if (candidate.verb !== "give" && candidate.verb !== "use" && candidate.firstNoun !== undefined) {
      diagnostics.push({
        code: "definition.command-case.arity",
        family: "definition", owner: "interaction",
        path: childPath(path, `cases[${index}].firstNoun`),
        message: `The '${candidate.verb}' Verb is unary and cannot declare a first Noun.`,
      });
    }
    validateInteractionCaseOutcome(candidate, childPath(path, `cases[${index}]`), diagnostics);
    if (
      !declaresTextualOutcome(candidate) &&
      candidate.operations?.some(({ type }) =>
        type === "collect-target-object" ||
        type === "place-selected-object" ||
        type === "consume-selected-object"
      )
    ) {
      diagnostics.push({
        code: "definition.command-case.object-feedback",
        family: "definition", owner: "interaction",
        path: childPath(path, `cases[${index}]`),
        message: "A Command Case that moves or consumes an Object must provide a Line, Command Response, or Sequence.",
      });
    }
    if (candidate.line && !candidate.line.character.trim()) {
      diagnostics.push({
        code: "definition.line.character",
        family: "definition", owner: "interaction",
        path: childPath(path, `cases[${index}].line.character`),
        message: "A Line requires a Character.",
      });
    }
    if (candidate.line && !candidate.line.text.trim()) {
      diagnostics.push({
        code: "definition.line.text",
        family: "definition", owner: "interaction",
        path: childPath(path, `cases[${index}].line.text`),
        message: "A Line cannot be empty.",
      });
    }
    validateCommandResponse(candidate.response, childPath(path, `cases[${index}].response`), diagnostics);
  });
  validateCommandCaseOrder(input.cases, childPath(path, "cases"), diagnostics);
  return diagnostics;
}


/**
 * @internal Whether a case is the default of its Verb: it names no first Noun
 * and carries no Interaction Condition, so it answers every Command with that
 * Verb the cases above it do not.
 */
function isVerbDefault(candidate: CommandCase): boolean {
  return candidate.firstNoun === undefined && candidate.when === undefined;
}

/**
 * @internal The case that answers a Verb when nothing more specific applies.
 * A Noun declares it as the last case of that Verb; where it declares none,
 * the Game Project's Command Fallback answers instead.
 */
function defaultCommandCase(
  noun: NounDefinition,
  verb: CommandVerb,
): CommandCase | undefined {
  return noun.cases.findLast((candidate) => candidate.verb === verb && isVerbDefault(candidate));
}

/**
 * @internal Applies the shared ordering rule to every selector a Noun declares
 * — one Verb against one first Noun — so that no case is hidden by an
 * unconditional one above it. A selector that declares no unconditional case is
 * left alone: its Verb is answered by the Game Project's Command Fallback, and
 * the coverage rule reports the Verb that has neither.
 */
function validateCommandCaseOrder(
  cases: readonly CommandCase[],
  path: string,
  diagnostics: AuthoringDiagnostic[],
): void {
  const selectors = new Map<string, CommandCase[]>();
  for (const candidate of cases) {
    const selector = `${candidate.verb} ${candidate.firstNoun ?? ""}`;
    const declared = selectors.get(selector);
    if (declared) declared.push(candidate);
    else selectors.set(selector, [candidate]);
  }
  for (const group of selectors.values()) {
    // Only the ordering rule: a Verb left with no unconditional case is not an
    // error here, because the Game Project's Command Fallbacks may answer it.
    // `definition.command.silent` is what refuses a Verb no one answers.
    validateUnconditionalVariantLast(group, path, `'${group[0]!.verb}' Command Case`, diagnostics);
  }
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

/** @internal The named definitions needed to validate Interaction-owned references. */
export interface InteractionReferenceView {
  readonly variables: ReadonlySet<string>;
  readonly objects: ReadonlySet<string>;
  readonly sequences: ReadonlySet<string>;
  readonly commandFallbacks?: Readonly<Partial<Record<CommandVerb, CommandResponse>>>;
}

/** @internal The composed definitions needed for Interaction-wide invariants. */
export interface InteractionCompositionView {
  readonly commandLexicon?: CommandLexicon;
  readonly detailViews?: Readonly<Record<string, {
    readonly hotspots?: readonly { readonly noun: NounDefinition }[];
  }>>;
  readonly scenes: Readonly<Record<string, {
    readonly scenery?: Readonly<Record<string, { readonly noun?: NounDefinition }>>;
    readonly hotspots?: readonly HotspotDefinition[];
    readonly passages?: readonly { readonly noun: NounDefinition }[];
  }>>;
  readonly characters: Readonly<Record<string, { readonly noun?: NounDefinition }>>;
  readonly objects: Readonly<Record<string, { readonly noun?: NounDefinition }>>;
}

/** Validates Interaction invariants that span composed World definitions. */
export function validateInteractionComposition(
  view: InteractionCompositionView,
): readonly AuthoringDiagnostic[] {
  const diagnostics: AuthoringDiagnostic[] = [];
  const missingOwnerNounPaths = new Set<string>();
  for (const [sceneId, scene] of Object.entries(view.scenes)) {
    for (const hotspot of scene.hotspots ?? []) {
      if (hotspot.target.kind === "background") continue;
      const owner = hotspot.target.kind === "character"
        ? view.characters[hotspot.target.character]
        : hotspot.target.kind === "object"
          ? view.objects[hotspot.target.object]
          : scene.scenery?.[hotspot.target.scenery];
      if (!owner || owner.noun) continue;
      const ownerPath = hotspot.target.kind === "character"
        ? `characters.${hotspot.target.character}.noun`
        : hotspot.target.kind === "object"
          ? `objects.${hotspot.target.object}.noun`
          : `scenes.${sceneId}.scenery.${hotspot.target.scenery}.noun`;
      if (missingOwnerNounPaths.has(ownerPath)) continue;
      missingOwnerNounPaths.add(ownerPath);
      diagnostics.push({
        code: "definition.hotspot.target-noun.required",
        family: "definition",
        owner: "interaction",
        path: ownerPath,
        message: "A target referenced by a Hotspot must own a Noun Definition.",
      });
    }
  }
  const hasNouns = Object.values(view.detailViews ?? {})
      .some(({ hotspots }) => (hotspots?.length ?? 0) > 0) ||
    Object.values(view.characters).some(({ noun }) => noun !== undefined) ||
    Object.values(view.objects).some(({ noun }) => noun !== undefined) ||
    Object.values(view.scenes).some((scene) =>
      Object.values(scene.scenery ?? {}).some(({ noun }) => noun !== undefined) ||
      scene.hotspots?.some((hotspot) => hotspot.target.kind === "background") ||
      (scene.passages?.length ?? 0) > 0
    );
  if (hasNouns && !view.commandLexicon) {
    diagnostics.push({
      code: "definition.command-lexicon.required",
      family: "definition",
      owner: "interaction",
      path: "commandLexicon",
      message: "A Game Project with Nouns must define a Command Lexicon.",
    });
  }
  return diagnostics;
}

/** Validates one Interaction Condition against the composed Game Project names. */
export function validateInteractionConditionReference(
  condition: InteractionCondition | undefined,
  path: string,
  view: InteractionReferenceView,
): readonly AuthoringDiagnostic[] {
  if (!condition) return [];
  if ("variable" in condition && !view.variables.has(condition.variable)) {
    return [interactionReference(
      "reference.variable",
      path,
      `Game Variable '${condition.variable}' does not exist.`,
    )];
  }
  if ("hasObject" in condition && !view.objects.has(condition.hasObject)) {
    return [interactionReference(
      "reference.object",
      path,
      `Object '${condition.hasObject}' does not exist.`,
    )];
  }
  return [];
}

/** Validates the references and guaranteed outcomes owned by one Noun Definition. */
export function validateNounReferences(
  noun: NounDefinition,
  path: string,
  view: InteractionReferenceView,
): readonly AuthoringDiagnostic[] {
  const diagnostics: AuthoringDiagnostic[] = [];
  const conditionalVariants: readonly {
    readonly segment: string;
    readonly values: readonly { readonly when?: InteractionCondition }[];
  }[] = [
    { segment: "labels", values: noun.labels },
    { segment: "preferredVerbs", values: noun.preferredVerbs },
    { segment: "secondaryVerbs", values: noun.secondaryVerbs ?? [] },
    { segment: "objectVerbs", values: noun.objectVerbs ?? [] },
  ];
  conditionalVariants.forEach(({ segment, values }) => {
    values.forEach((value, index) => diagnostics.push(...validateInteractionConditionReference(
      value.when,
      `${path}.${segment}[${index}].when`,
      view,
    )));
  });
  noun.cases.forEach((candidate, index) => {
    const candidatePath = `${path}.cases[${index}]`;
    diagnostics.push(...validateInteractionConditionReference(
      candidate.when,
      `${candidatePath}.when`,
      view,
    ));
    if (candidate.firstNoun !== undefined && !view.objects.has(candidate.firstNoun)) {
      diagnostics.push(interactionReference(
        "reference.object",
        `${candidatePath}.firstNoun`,
        `Object '${candidate.firstNoun}' does not exist.`,
      ));
    }
    if (candidate.sequence !== undefined && !view.sequences.has(candidate.sequence)) {
      diagnostics.push(interactionReference(
        "reference.sequence",
        `${candidatePath}.sequence`,
        `Sequence '${candidate.sequence}' does not exist.`,
      ));
    }
  });
  for (const verb of commandVerbs) {
    if (defaultCommandCase(noun, verb) || view.commandFallbacks?.[verb]) continue;
    diagnostics.push({
      code: "definition.command.silent",
      family: "definition",
      owner: "interaction",
      path: `${path}.cases`,
      message:
        `Noun '${path}' needs an unconditional '${verb}' Command Case or a global '${verb}' Command Fallback.`,
    });
  }
  return diagnostics;
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

/** Reports every local Command Lexicon Authoring Diagnostic without a Game Project. */
export function validateCommandLexicon(
  input: CommandLexicon,
  path = "",
): readonly AuthoringDiagnostic[] {
  const diagnostics: AuthoringDiagnostic[] = [];
  for (const verb of commandVerbs) {
    if (!input.verbs[verb]?.trim()) {
      diagnostics.push({
        code: "definition.command-lexicon.label",
        family: "definition", owner: "interaction",
        path: childPath(path, `verbs.${verb}`),
        message: `The Command Lexicon needs a non-empty label for '${verb}'.`,
      });
    }
  }
  validatePattern(input.inventory.select, ["{noun}"], childPath(path, "inventory.select"), diagnostics);
  validatePattern(input.inventory.deselect, ["{noun}"], childPath(path, "inventory.deselect"), diagnostics);
  validatePattern(input.patterns.unary, ["{verb}", "{noun}"], childPath(path, "patterns.unary"), diagnostics);
  validatePattern(input.patterns.give, ["{verb}", "{first}", "{second}"], childPath(path, "patterns.give"), diagnostics);
  validatePattern(input.patterns.use, ["{verb}", "{first}", "{second}"], childPath(path, "patterns.use"), diagnostics);
  return diagnostics;
}

/** @internal */
export interface InteractionStateView {
  readonly currentScene: string;
  readonly variables: Readonly<Record<string, boolean>>;
  readonly inventory: { readonly objects: readonly string[] };
  readonly command: CommandState;
}

/** @internal The committed Command currently being constructed by the Player. */
export interface CommandState {
  readonly verb: Verb;
  readonly firstNoun: null | { readonly kind: "object"; readonly object: string };
}

/** @internal The Interaction-owned meaning retained while the Player approaches a Noun. */
export type PlayerIntent =
  | { readonly kind: "move" }
  | {
      readonly kind: "interaction";
      readonly scene: string;
      readonly hotspot: number;
      readonly command?: PendingCommand;
    }
  | {
      readonly kind: "passage-command";
      readonly scene: string;
      readonly passage: number;
      readonly command: PendingCommand;
    }
  | { readonly kind: "passage"; readonly scene: string; readonly passage: number };

/** @internal */
export interface PendingCommand {
  readonly verb: CommandVerb;
  readonly firstNoun?: string;
  /** Keeps the Player's prior Command State after this convenient input resolves. */
  readonly preserveState?: boolean;
}

/** @internal Interaction-owned predicates used when Save validates restored state. */
export interface InteractionSaveValidation {
  isVerb(value: unknown): value is Verb;
  isCommandVerb(value: unknown): value is CommandVerb;
  isCommandState(value: unknown, inventory: readonly string[]): value is CommandState;
  isPendingCommand(value: unknown, inventory: readonly string[]): value is PendingCommand;
  conditionMatches(
    condition: InteractionCondition | undefined,
    state: InteractionStateView,
  ): boolean;
}

export const interactionSaveValidation: InteractionSaveValidation = Object.freeze({
  isVerb(value: unknown): value is Verb {
    return value === "walk-to" || isSaveCommandVerb(value);
  },
  isCommandVerb(value: unknown): value is CommandVerb {
    return isSaveCommandVerb(value);
  },
  isCommandState(value: unknown, inventory: readonly string[]): value is CommandState {
    if (!isRecord(value) || !hasExactKeys(value, ["verb", "firstNoun"]) ||
        !(value.verb === "walk-to" || isSaveCommandVerb(value.verb))) return false;
    if (value.firstNoun === null) return true;
    return isRecord(value.firstNoun) &&
      hasExactKeys(value.firstNoun, ["kind", "object"]) &&
      value.firstNoun.kind === "object" &&
      typeof value.firstNoun.object === "string" &&
      inventory.includes(value.firstNoun.object);
  },
  isPendingCommand(value: unknown, inventory: readonly string[]): value is PendingCommand {
    if (!isRecord(value) || !hasExactKeys(value, ["verb"], ["firstNoun", "preserveState"]) ||
        !isSaveCommandVerb(value.verb) ||
        (value.preserveState !== undefined && typeof value.preserveState !== "boolean")) return false;
    return value.firstNoun === undefined ||
      typeof value.firstNoun === "string" && inventory.includes(value.firstNoun);
  },
  conditionMatches(condition: InteractionCondition | undefined, state: InteractionStateView) {
    return conditionMatchesState(condition, state);
  },
});

function isSaveCommandVerb(value: unknown): value is CommandVerb {
  return typeof value === "string" && commandVerbs.some((verb) => verb === value);
}

/** @internal The Game Activity state needed to resume a Player Intent after World movement. */
export interface PlayerIntentState {
  readonly type: "player-intent";
  readonly animationStartedTick: number;
  readonly destination: Point;
  readonly finalFacing?: Facing;
  readonly fast?: true;
  readonly intent: PlayerIntent;
}

/** @internal */
export interface InteractionProjectView {
  readonly scenes?: Readonly<Record<string, {
    readonly scenery?: Readonly<Record<string, { readonly noun?: NounDefinition }>>;
  }>>;
  readonly characters?: Readonly<Record<string, { readonly noun?: NounDefinition }>>;
  readonly objects: Readonly<Record<string, {
    readonly noun?: NounDefinition;
    readonly inventoryAppearance?: URL | string;
  }>>;
  readonly commandFallbacks?: Readonly<Partial<Record<CommandVerb, CommandResponse>>>;
}

/** @internal The committed Object and Command facts changed by Inventory consequences. */
export interface InventoryLifecycleState {
  readonly currentScene: string;
  readonly objects: Readonly<Record<string, Readonly<ObjectState>>>;
  readonly inventory: { readonly objects: readonly string[] };
  readonly command: CommandState;
}

/** @internal Context retained while applying one Inventory consequence. */
export interface InventoryOperationContext {
  readonly target: HotspotTarget;
  readonly firstNounObject?: string;
}

/** @internal Capability interfaces consulted without duplicating their policy. */
export interface InventoryAuthorities {
  readonly canPlaceObject: (scene: string, point: Point) => boolean;
  readonly objectHasAppearance: (object: string, appearance: string) => boolean;
}

/** @internal Authoring context in which one Inventory operation is declared. */
export interface InventoryOperationValidationContext {
  readonly target?: HotspotTarget;
  readonly scenes?: readonly string[];
}

/** @internal Validation interfaces supplied by World and Animation. */
export interface InventoryOperationValidationAuthorities {
  readonly objects: ReadonlySet<string>;
  readonly scenes: ReadonlySet<string>;
  readonly validatePlacement: (
    scenes: readonly string[],
    point: Point,
    path: string,
  ) => readonly AuthoringDiagnostic[];
  readonly validateObjectAppearance: (
    object: string,
    appearance: string,
    path: string,
  ) => readonly AuthoringDiagnostic[];
}

/** Reports whether a Game Operation belongs to the Inventory lifecycle. */
export function isInventoryOperation(operation: GameOperation): operation is InventoryOperation {
  return operation.type === "collect-target-object" ||
    operation.type === "give-object-to-player" ||
    operation.type === "place-selected-object" ||
    operation.type === "place-object" ||
    operation.type === "consume-selected-object";
}

/** Validates one authored Inventory consequence through capability-owned interfaces. */
export function validateInventoryOperation(
  operation: InventoryOperation,
  path: string,
  context: InventoryOperationValidationContext,
  authorities: InventoryOperationValidationAuthorities,
): readonly AuthoringDiagnostic[] {
  const diagnostics: AuthoringDiagnostic[] = [];
  if (operation.type === "collect-target-object") {
    if (context.target?.kind !== "object") {
      diagnostics.push({
        code: "definition.operation.collect-target",
        family: "definition",
        owner: "interaction",
        path,
        message: "collect-target-object requires an Object Hotspot target.",
      });
    }
    return diagnostics;
  }
  if (operation.type === "give-object-to-player") {
    if (!authorities.objects.has(operation.object)) {
      diagnostics.push(interactionReference(
        "reference.object",
        `${path}.object`,
        `Object '${operation.object}' does not exist.`,
      ));
    }
    return diagnostics;
  }
  if (operation.type === "place-selected-object") {
    diagnostics.push(...authorities.validatePlacement(
      context.scenes ?? [...authorities.scenes],
      operation.groundPoint,
      `${path}.groundPoint`,
    ));
    return diagnostics;
  }
  if (operation.type === "consume-selected-object") return diagnostics;

  if (!authorities.objects.has(operation.object)) {
    diagnostics.push(interactionReference(
      "reference.object",
      `${path}.object`,
      `Object '${operation.object}' does not exist.`,
    ));
  }
  if (!authorities.scenes.has(operation.scene)) {
    diagnostics.push(interactionReference(
      "reference.scene",
      `${path}.scene`,
      `Scene '${operation.scene}' does not exist.`,
    ));
  } else {
    diagnostics.push(...authorities.validatePlacement(
      [operation.scene],
      operation.groundPoint,
      `${path}.groundPoint`,
    ));
  }
  if (authorities.objects.has(operation.object) && operation.appearance !== undefined) {
    diagnostics.push(...authorities.validateObjectAppearance(
      operation.object,
      operation.appearance,
      `${path}.appearance`,
    ));
  }
  return diagnostics;
}

/** @internal Explicit result returned to Game Session for atomic commit. */
export type InventoryOperationResult =
  | { readonly status: "applied"; readonly state: Omit<InventoryLifecycleState, "currentScene"> }
  | { readonly status: "invalid"; readonly message: string };

interface InventoryLifecycleDraft {
  objects: Record<string, ObjectState>;
  inventory: { objects: string[] };
  command: CommandState;
}

/** @internal One carried Object prepared for presentation by the HUD. */
export interface InventoryPresentationEntry {
  readonly object: string;
  readonly label: string;
  readonly inventoryAppearance: string;
  readonly preferredVerb?: Verb;
  readonly secondaryVerb?: Verb;
  readonly selected: boolean;
}

/** @internal Immutable Inventory facts consumed without aggregate project or state queries. */
export interface InventoryPresentation {
  readonly entries: readonly InventoryPresentationEntry[];
}

/** @internal */
export interface InteractionTargetView {
  readonly kind: "hotspot" | "passage" | "detail-hotspot";
  readonly scene: string;
  readonly index: number;
  readonly noun: NounDefinition;
  readonly target: HotspotTarget;
}

/** @internal */
export type InteractionInput =
  | { readonly type: "select-verb"; readonly verb: CommandVerb }
  | { readonly type: "activate-hotspot"; readonly hotspot: number }
  | { readonly type: "quick-hotspot"; readonly hotspot: number; readonly verb?: Verb }
  | { readonly type: "contextual-hotspot"; readonly hotspot: number; readonly action: "primary" | "secondary" }
  | { readonly type: "activate-passage"; readonly passage: number; readonly fast?: boolean; readonly forceWalk?: boolean }
  | { readonly type: "quick-passage"; readonly passage: number; readonly verb?: Verb }
  | { readonly type: "contextual-passage"; readonly passage: number; readonly action: "primary" | "secondary" }
  | { readonly type: "activate-object"; readonly object: string }
  | { readonly type: "select-object"; readonly object: string }
  | { readonly type: "contextual-object"; readonly object: string; readonly action: "primary" | "secondary" }
  | { readonly type: "escape" };

type WorldTargetInteractionInput = Extract<
  InteractionInput,
  { readonly hotspot: number } | { readonly passage: number }
>;

/** @internal Player input against a Hotspot that has nothing to approach. */
export type ImmediateInteractionInput = Extract<
  InteractionInput,
  { readonly hotspot: number }
>;

/** Reports whether one Player input names a Hotspot rather than another subject. */
export function isHotspotInteractionInput(
  input: InteractionInput,
): input is ImmediateInteractionInput {
  return input.type === "activate-hotspot" ||
    input.type === "quick-hotspot" ||
    input.type === "contextual-hotspot";
}

interface TargetCommand {
  readonly verb: Verb;
  readonly firstNoun?: string;
  readonly preserveCommandState: boolean;
}

/** @internal */
export type InteractionDecision =
  | { readonly type: "ignored" }
  | {
      readonly type: "command";
      readonly command: CommandState;
      readonly cancelActivity?: true;
    }
  | {
      readonly type: "request-approach";
      readonly target: WorldTarget;
      readonly intent: PlayerIntent;
      readonly fast?: true;
    }
  | {
      readonly type: "resolve";
      readonly target: HotspotTarget;
      readonly firstNoun?: string;
      readonly commandStateDisposition: "preserve" | "reset";
      readonly resolution?: ResolvedInteraction;
    }
  | { readonly type: "passage"; readonly passage: number };

/** @internal Interaction policy over one narrow Game Project view. */
export interface Interaction {
  nounForHotspot(scene: string, hotspot: HotspotDefinition): NounDefinition | undefined;
  input(
    input: InteractionInput,
    state: InteractionStateView,
    target?: InteractionTargetView,
  ): InteractionDecision;
  /**
   * The second resolution path, for a surface such as a Detail View where no
   * Approach Point exists and a Command therefore answers at once. It never
   * consults the walking path, and the walking path never consults it.
   */
  immediateInput(
    input: ImmediateInteractionInput,
    state: InteractionStateView,
    target?: InteractionTargetView,
  ): InteractionDecision;
  resume(
    intent: PlayerIntent,
    state: InteractionStateView,
    target?: InteractionTargetView,
  ): InteractionDecision;
  applyInventoryOperation(
    operation: InventoryOperation,
    state: InventoryLifecycleState,
    context: InventoryOperationContext,
  ): InventoryOperationResult;
  inventory(state: InteractionStateView): InventoryPresentation;
}

/** Creates the Interaction module that translates Player input into explicit intentions. */
export function createInteraction(
  view: InteractionProjectView,
  authorities: InventoryAuthorities = {
    canPlaceObject: () => false,
    objectHasAppearance: () => false,
  },
): Interaction {
  const resetCommand: CommandState = { verb: "walk-to", firstNoun: null };

  const resolve = (
    noun: NounDefinition,
    verb: CommandVerb,
    target: HotspotTarget,
    state: InteractionStateView,
    commandStateDisposition: "preserve" | "reset",
    firstNoun?: string,
  ): InteractionDecision => {
    const resolution = resolveCommandDefinition({
      noun,
      verb,
      ...(firstNoun ? { firstNoun } : {}),
      state,
      projectFallbacks: view.commandFallbacks,
    });
    return {
      type: "resolve",
      target,
      ...(firstNoun ? { firstNoun } : {}),
      commandStateDisposition,
      ...(resolution ? { resolution } : {}),
    };
  };

  const selectObject = (object: string, state: InteractionStateView): InteractionDecision => {
    if (!state.inventory.objects.includes(object)) return { type: "ignored" };
    return {
      type: "command",
      command: state.command.firstNoun?.object === object
        ? resetCommand
        : { verb: "use", firstNoun: { kind: "object", object } },
      cancelActivity: true,
    };
  };

  const requestApproach = (
    target: WorldTarget,
    intent: PlayerIntent,
    fast = false,
  ): InteractionDecision => ({
    type: "request-approach",
    target: { ...target },
    intent,
    ...(fast ? { fast: true } : {}),
  });

  const commandForTarget = (
    input: WorldTargetInteractionInput,
    state: InteractionStateView,
    target: InteractionTargetView,
  ): TargetCommand | undefined => {
    const activated = input.type === "activate-hotspot" || input.type === "activate-passage";
    if (activated && state.command.verb === "give" && !state.command.firstNoun) return undefined;
    const verb = input.type === "quick-hotspot" || input.type === "quick-passage"
      ? input.verb ?? conditionalValue(target.noun.preferredVerbs, state).verb
      : input.type === "contextual-hotspot" || input.type === "contextual-passage"
        ? contextualVerb(target.noun, input.action, state.command.firstNoun?.object, state)
        : state.command.verb;
    if (!verb) return undefined;
    const preserveCommandState = !activated;
    const firstNoun = preserveCommandState
      ? preferredFirstNoun(target.noun, verb, state.command.firstNoun?.object, state)
      : state.command.firstNoun?.object;
    return {
      verb,
      ...(firstNoun ? { firstNoun } : {}),
      preserveCommandState,
    };
  };

  const pendingCommand = (command: TargetCommand): PendingCommand => ({
    verb: command.verb as CommandVerb,
    ...(command.firstNoun ? { firstNoun: command.firstNoun } : {}),
    ...(command.preserveCommandState ? { preserveState: true } : {}),
  });

  const placeObject = (
    draft: InventoryLifecycleDraft,
    objectId: string,
    scene: string,
    groundPoint: Point,
    appearance?: string,
  ): string | undefined => {
    if (!authorities.canPlaceObject(scene, groundPoint)) {
      return "The placed Object Ground Point is outside the destination Scene Size.";
    }
    if (appearance !== undefined && !authorities.objectHasAppearance(objectId, appearance)) {
      return `Unknown Object Appearance '${appearance}'.`;
    }
    const object = draft.objects[objectId]!;
    object.location = {
      kind: "scene",
      scene,
      groundPoint: { ...groundPoint },
    };
    if (appearance !== undefined) object.appearance = appearance;
    draft.inventory.objects = draft.inventory.objects.filter((candidate) => candidate !== objectId);
    return undefined;
  };

  return {
    nounForHotspot(scene, hotspot) {
      if (hotspot.target.kind === "background") return hotspot.noun;
      if (hotspot.target.kind === "character") {
        return view.characters?.[hotspot.target.character]?.noun;
      }
      if (hotspot.target.kind === "object") {
        return view.objects[hotspot.target.object]?.noun;
      }
      return view.scenes?.[scene]?.scenery?.[hotspot.target.scenery]?.noun;
    },
    input(input, state, target) {
      if (input.type === "select-verb") {
        return {
          type: "command",
          command: { verb: input.verb, firstNoun: null },
          cancelActivity: true,
        };
      }
      if (input.type === "escape") {
        return { type: "command", command: resetCommand };
      }
      if (input.type === "select-object") return selectObject(input.object, state);
      if (input.type === "contextual-object") {
        if (input.action === "primary") return selectObject(input.object, state);
        const noun = view.objects[input.object]?.noun;
        if (!state.inventory.objects.includes(input.object) || !noun) {
          return { type: "ignored" };
        }
        const verb = conditionalOptionalValue(noun.secondaryVerbs, state)?.verb;
        if (!verb || verb === "walk-to") return { type: "ignored" };
        return resolve(noun, verb, { kind: "object", object: input.object }, state, "preserve");
      }
      if (input.type === "activate-object") {
        const noun = view.objects[input.object]?.noun;
        if (!state.inventory.objects.includes(input.object) || !noun || state.command.verb === "walk-to") {
          return { type: "ignored" };
        }
        if (state.command.verb === "give" && !state.command.firstNoun) {
          return {
            type: "command",
            command: { verb: "give", firstNoun: { kind: "object", object: input.object } },
            cancelActivity: true,
          };
        }
        if (
          state.command.verb === "use" &&
          !state.command.firstNoun &&
          // The Noun's `use` default is not an answer to using the Object by
          // itself: it must not stop the Player from selecting the Object as
          // the first Noun of a binary Use.
          !noun.cases.some((candidate) =>
            candidate.verb === "use" &&
            candidate.firstNoun === undefined &&
            !isVerbDefault(candidate) &&
            conditionMatchesState(candidate.when, state)
          )
        ) {
          return selectObject(input.object, state);
        }
        return resolve(
          noun,
          state.command.verb,
          { kind: "object", object: input.object },
          state,
          "reset",
          state.command.firstNoun?.object,
        );
      }

      if (isHotspotInteractionInput(input)) {
        if (!target || target.kind !== "hotspot" || target.index !== input.hotspot) {
          return { type: "ignored" };
        }
        const command = commandForTarget(input, state, target);
        if (!command) return { type: "ignored" };
        const intent: PlayerIntent = command.verb === "walk-to"
          ? { kind: "move" }
          : {
              kind: "interaction",
              scene: target.scene,
              hotspot: target.index,
              command: pendingCommand(command),
            };
        return requestApproach({ kind: "hotspot", index: target.index }, intent);
      }

      if (!target || target.kind !== "passage" || target.index !== input.passage) {
        return { type: "ignored" };
      }
      const command = commandForTarget(input, state, target);
      if (!command) return { type: "ignored" };
      const shouldWalk = input.type === "activate-passage" &&
        (input.forceWalk || state.command.verb === "walk-to") || command.verb === "walk-to";
      const intent: PlayerIntent = shouldWalk
        ? { kind: "passage", scene: target.scene, passage: target.index }
        : {
            kind: "passage-command",
            scene: target.scene,
            passage: target.index,
            command: pendingCommand(command),
          };
      return requestApproach(
        { kind: "passage", index: target.index },
        intent,
        input.type === "activate-passage" && Boolean(input.fast),
      );
    },
    immediateInput(input, state, target) {
      if (!target || target.kind !== "detail-hotspot" || target.index !== input.hotspot) {
        return { type: "ignored" };
      }
      const command = commandForTarget(input, state, target);
      if (!command || command.verb === "walk-to") return { type: "ignored" };
      return resolve(
        target.noun,
        command.verb,
        target.target,
        state,
        command.preserveCommandState ? "preserve" : "reset",
        command.firstNoun,
      );
    },
    resume(intent, state, target) {
      if (intent.kind === "move" || intent.scene !== state.currentScene) {
        return { type: "ignored" };
      }
      if (intent.kind === "interaction") {
        if (
          !target ||
          target.kind !== "hotspot" ||
          target.scene !== intent.scene ||
          target.index !== intent.hotspot
        ) {
          return intent.command
            ? { type: "command", command: { verb: "walk-to", firstNoun: null } }
            : { type: "ignored" };
        }
        if (!intent.command) return { type: "ignored" };
        return resolve(
          target.noun,
          intent.command.verb,
          target.target,
          state,
          intent.command.preserveState ? "preserve" : "reset",
          intent.command.firstNoun,
        );
      }
      if (
        !target ||
        target.kind !== "passage" ||
        target.scene !== intent.scene ||
        target.index !== intent.passage
      ) {
        return intent.kind === "passage-command" && !intent.command.preserveState
          ? { type: "command", command: resetCommand }
          : { type: "ignored" };
      }
      if (intent.kind === "passage") return { type: "passage", passage: intent.passage };
      return resolve(
        target.noun,
        intent.command.verb,
        { kind: "background" },
        state,
        intent.command.preserveState ? "preserve" : "reset",
        intent.command.firstNoun,
      );
    },
    applyInventoryOperation(operation, state, context) {
      const next: InventoryLifecycleDraft = {
        objects: structuredClone(state.objects) as Record<string, ObjectState>,
        inventory: { objects: [...state.inventory.objects] },
        command: structuredClone(state.command),
      };
      if (operation.type === "collect-target-object") {
        if (context.target.kind !== "object") {
          return { status: "invalid", message: "Collect requires an Object target." };
        }
        const object = next.objects[context.target.object];
        if (!object || object.location.kind !== "scene" || object.location.scene !== state.currentScene) {
          return {
            status: "invalid",
            message: "The target Object is not present in the current Scene.",
          };
        }
        object.location = { kind: "inventory" };
        next.inventory.objects.push(context.target.object);
      } else if (operation.type === "give-object-to-player") {
        const object = next.objects[operation.object];
        if (!object || object.location.kind !== "scene" || object.location.scene !== state.currentScene) {
          return {
            status: "invalid",
            message: "The given Object is not present in the current Scene.",
          };
        }
        object.location = { kind: "inventory" };
        next.inventory.objects.push(operation.object);
      } else if (operation.type === "consume-selected-object") {
        const selected = context.firstNounObject;
        if (!selected || !next.inventory.objects.includes(selected)) {
          return { status: "invalid", message: "No Object is selected." };
        }
        const object = next.objects[selected];
        if (!object) {
          return { status: "invalid", message: `Unknown Object '${selected}'.` };
        }
        object.location = { kind: "consumed" };
        next.inventory.objects = next.inventory.objects.filter((objectId) => objectId !== selected);
      } else if (operation.type === "place-selected-object") {
        const selected = context.firstNounObject;
        if (!selected || !next.inventory.objects.includes(selected)) {
          return { status: "invalid", message: "No Object is selected." };
        }
        const object = next.objects[selected];
        if (!object) {
          return { status: "invalid", message: `Unknown Object '${selected}'.` };
        }
        const failure = placeObject(
          next,
          selected,
          state.currentScene,
          operation.groundPoint,
          operation.appearance,
        );
        if (failure) return { status: "invalid", message: failure };
      } else if (operation.type === "place-object") {
        const object = next.objects[operation.object];
        if (!object) {
          return {
            status: "invalid",
            message: "Placed Object or destination Scene does not exist.",
          };
        }
        const failure = placeObject(
          next,
          operation.object,
          operation.scene,
          operation.groundPoint,
          operation.appearance,
        );
        if (failure) return { status: "invalid", message: failure };
      }
      if (
        next.command.firstNoun &&
        !next.inventory.objects.includes(next.command.firstNoun.object)
      ) {
        next.command = { verb: "walk-to", firstNoun: null };
      }
      return { status: "applied", state: next };
    },
    inventory(state) {
      const entries = state.inventory.objects.flatMap((object) => {
        const definition = view.objects[object];
        const noun = definition?.noun;
        const source = definition?.inventoryAppearance;
        if (!noun || source === undefined) return [];
        const preferredVerb = conditionalValue(noun.preferredVerbs, state).verb;
        const secondaryVerb = conditionalOptionalValue(noun.secondaryVerbs, state)?.verb;
        return [Object.freeze({
          object,
          label: conditionalValue(noun.labels, state).text,
          inventoryAppearance: source instanceof URL ? source.href : source,
          ...(preferredVerb ? { preferredVerb } : {}),
          ...(secondaryVerb ? { secondaryVerb } : {}),
          selected: state.command.firstNoun?.object === object,
        })];
      });
      return Object.freeze({ entries: Object.freeze(entries) });
    },
  };
}

/** @internal */
export interface ResolvedInteraction {
  readonly operations: readonly GameOperation[];
  readonly response?: CommandResponse;
  readonly line?: Line;
}

/** Interaction-owned selection of the Command Case that answers a Command. */
export function resolveCommandDefinition(input: {
  readonly noun: NounDefinition;
  readonly verb: CommandVerb;
  readonly firstNoun?: string;
  readonly state: InteractionStateView;
  readonly projectFallbacks?: Readonly<Partial<Record<CommandVerb, CommandResponse>>>;
}): ResolvedInteraction | undefined {
  const { noun, verb, firstNoun, state, projectFallbacks } = input;
  const verbDefault = defaultCommandCase(noun, verb);
  if (firstNoun && !state.inventory.objects.includes(firstNoun)) {
    // The Command cannot have happened, so the Verb's default is asked for its
    // words alone: its Game Operations, and any Sequence it would start,
    // belong to a Command that did.
    if (verbDefault?.response) return { operations: [], response: verbDefault.response };
    if (verbDefault?.line) return { operations: [], line: verbDefault.line };
    const response = projectFallbacks?.[verb];
    return response ? { operations: [], response } : undefined;
  }
  const candidate = noun.cases.find((value) =>
    value.verb === verb &&
    value.firstNoun === firstNoun &&
    conditionMatchesState(value.when, state)
  );
  const resolution = candidate ?? verbDefault;
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
  return values.find((value) => conditionMatchesState(value.when, state)) ?? values.at(-1)!;
}

export function conditionalOptionalValue<T extends { readonly when?: InteractionCondition }>(
  values: readonly T[] | undefined,
  state: InteractionStateView,
): T | undefined {
  return values?.find((value) => conditionMatchesState(value.when, state)) ?? values?.at(-1);
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
    conditionMatchesState(candidate.when, state)
  ) ? selectedObject : undefined;
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

function interactionReference(
  code: string,
  path: string,
  message: string,
): AuthoringDiagnostic {
  return { code, family: "reference", owner: "interaction", path, message };
}

function childPath(path: string, child: string): string {
  return path ? `${path}.${child}` : child;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasExactKeys(
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[] = [],
): boolean {
  const keys = Object.keys(value);
  return required.every((key) => keys.includes(key)) &&
    keys.every((key) => required.includes(key) || optional.includes(key));
}
